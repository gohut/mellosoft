/**
 * Mellosoft IndexedDB Persistent Image Storage Utility
 * 
 * TODO: For production deployment, product/catalog/image persistence should
 * move to backend/database/object storage (e.g., AWS S3, Cloudflare R2, GCP + PostgreSQL).
 * 
 * In this client architecture:
 * - localStorage stores lightweight product metadata & static path URLs ("/images/...")
 * - IndexedDB ("MellosoftImageDB") stores binary Blobs/Files for user & Admin uploads
 * - In-memory object URL cache converts "idb:..." references to renderable Object URLs
 */

const DB_NAME = "MellosoftImageDB";
const DB_VERSION = 1;
const STORE_NAME = "images";

// In-memory cache for created Object URLs to prevent duplicate allocations & memory leaks
const objectUrlCache = new Map();
const pendingResolutions = new Map();

/**
 * Initialize IndexedDB instance
 */
function openDB() {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error("IndexedDB open error:", event.target.error);
      resolve(null);
    };
  });
}

/**
 * Convert base64 dataURL to Blob
 */
export function dataURLtoBlob(dataurl) {
  if (!dataurl || typeof dataurl !== "string" || !dataurl.startsWith("data:")) return null;
  try {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error("Failed to convert dataURL to Blob:", e);
    return null;
  }
}

/**
 * Save an image (Blob, File, or Base64 dataURL) into IndexedDB under a key
 */
export async function saveImageBlob(id, fileOrDataUrl) {
  if (!id) return null;
  const db = await openDB();
  if (!db) return null;

  let blob = null;
  if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
    blob = fileOrDataUrl;
  } else if (typeof fileOrDataUrl === "string" && fileOrDataUrl.startsWith("data:")) {
    blob = dataURLtoBlob(fileOrDataUrl);
  }

  if (!blob) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const record = { id, blob, createdAt: Date.now() };
      const req = store.put(record);
      req.onsuccess = () => {
        try {
          const objectUrl = URL.createObjectURL(blob);
          objectUrlCache.set(id, objectUrl);
        } catch (e) {
          // Ignore
        }
        resolve(id);
      };
      req.onerror = () => resolve(null);
    } catch (e) {
      console.error("Failed to store blob in IndexedDB:", e);
      resolve(null);
    }
  });
}

/**
 * Retrieve an image Blob from IndexedDB by key
 */
export async function getImageBlob(id) {
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result?.blob || null);
      req.onerror = () => resolve(null);
    } catch (e) {
      console.error("Failed to read blob from IndexedDB:", e);
      resolve(null);
    }
  });
}

/**
 * Resolve an image reference ("idb:...", static path, or base64) to a renderable URL synchronously/cached
 */
export function getResolvedImageUrlSync(imageRef, fallback = "/asset/img1.jpg") {
  if (!imageRef || typeof imageRef !== "string" || imageRef.trim() === "") {
    return fallback;
  }

  const trimmed = imageRef.trim();

  // 1. Static path or external URL
  if (!trimmed.startsWith("idb:") && !trimmed.startsWith("data:")) {
    return trimmed;
  }

  // 2. Base64 dataURL (temporary preview or legacy fallback)
  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  // 3. IndexedDB key "idb:..."
  if (objectUrlCache.has(trimmed)) {
    return objectUrlCache.get(trimmed);
  }

  // Asynchronously trigger loading into objectUrlCache if not yet fetched
  if (!pendingResolutions.has(trimmed)) {
    pendingResolutions.set(
      trimmed,
      getImageBlob(trimmed).then((blob) => {
        if (blob) {
          try {
            const url = URL.createObjectURL(blob);
            objectUrlCache.set(trimmed, url);
            return url;
          } catch (e) {
            return fallback;
          }
        }
        return fallback;
      })
    );
  }

  return fallback;
}

/**
 * Migrate products array: move any base64 dataURL images into IndexedDB keys ("idb:...")
 * Returns { migratedProducts, hasChanges }
 */
export async function migrateProductsBase64(products = []) {
  let hasChanges = false;
  if (!Array.isArray(products) || products.length === 0) {
    return { migratedProducts: products, hasChanges: false };
  }

  const migrated = await Promise.all(
    products.map(async (p) => {
      if (!p) return p;
      let pCopy = { ...p };
      let changed = false;

      // Clean transient UI properties
      delete pCopy.imagePreview;
      delete pCopy.temporaryPreview;
      delete pCopy.uploadFile;
      delete pCopy.editingImage;

      // Primary image
      if (typeof pCopy.image === "string" && pCopy.image.startsWith("data:")) {
        const idbKey = `idb:prod-${pCopy.id || pCopy.Product_Id || Math.random().toString(36).substring(2,7)}-main`;
        await saveImageBlob(idbKey, pCopy.image);
        pCopy.image = idbKey;
        pCopy.imageUrl = idbKey;
        pCopy.thumbnail = idbKey;
        changed = true;
      }

      // Images array
      if (Array.isArray(pCopy.images) && pCopy.images.length > 0) {
        const nextImages = await Promise.all(
          pCopy.images.map(async (img, idx) => {
            if (typeof img === "string" && img.startsWith("data:")) {
              const idbKey = `idb:prod-${pCopy.id || pCopy.Product_Id || Math.random().toString(36).substring(2,7)}-img-${idx}`;
              await saveImageBlob(idbKey, img);
              changed = true;
              return idbKey;
            }
            return img;
          })
        );
        pCopy.images = nextImages;
      }

      if (changed) hasChanges = true;
      return pCopy;
    })
  );

  return { migratedProducts: migrated, hasChanges };
}

/**
 * Migrate customer reviews array: move base64 image uploads to IndexedDB
 */
export async function migrateReviewsBase64(reviews = []) {
  let hasChanges = false;
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return { migratedReviews: reviews, hasChanges: false };
  }

  const migrated = await Promise.all(
    reviews.map(async (r) => {
      if (!r) return r;
      let rCopy = { ...r };
      let changed = false;

      if (Array.isArray(rCopy.images) && rCopy.images.length > 0) {
        const nextImgs = await Promise.all(
          rCopy.images.map(async (img, idx) => {
            if (typeof img === "string" && img.startsWith("data:")) {
              const idbKey = `idb:rev-${rCopy.id || Math.random().toString(36).substring(2,7)}-${idx}`;
              await saveImageBlob(idbKey, img);
              changed = true;
              return idbKey;
            }
            return img;
          })
        );
        rCopy.images = nextImgs;
      }

      if (changed) hasChanges = true;
      return rCopy;
    })
  );

  return { migratedReviews: migrated, hasChanges };
}

/**
 * Migrate homepage categories array: move any base64 dataURL images into IndexedDB keys ("idb:...")
 */
export async function migrateHomepageCategoriesBase64(categories = []) {
  let hasChanges = false;
  if (!Array.isArray(categories) || categories.length === 0) {
    return { migratedCategories: categories, hasChanges: false };
  }

  const migrated = await Promise.all(
    categories.map(async (c) => {
      if (!c) return c;
      let cCopy = { ...c };
      if (typeof cCopy.image === "string" && cCopy.image.startsWith("data:")) {
        const idbKey = `idb:cat-${cCopy.id || Math.random().toString(36).substring(2, 7)}`;
        await saveImageBlob(idbKey, cCopy.image);
        cCopy.image = idbKey;
        hasChanges = true;
      }
      return cCopy;
    })
  );

  return { migratedCategories: migrated, hasChanges };
}

// In-memory cache for processed transparent images
const transparentBgCache = new Map();

/**
 * Automatically detects and removes solid white/off-white background from an image.
 * Uses an edge-seeded boundary flood-fill algorithm starting strictly from outer edges,
 * preserving white elements inside the product (e.g. white pillows, white bed sheets, white mattress fabric).
 * Returns a transparent PNG dataURL.
 *
 * @param {string|File|Blob} srcOrFile - Image source (dataURL, file path, or File/Blob)
 * @param {number} tolerance - Color tolerance for white detection (default: 25)
 * @returns {Promise<string>} - Transparent PNG dataURL or original source if already transparent/error
 */
export function removeWhiteBackgroundFromImage(srcOrFile, tolerance = 25) {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !srcOrFile) {
      resolve(srcOrFile);
      return;
    }

    if (typeof srcOrFile === "string" && transparentBgCache.has(srcOrFile)) {
      resolve(transparentBgCache.get(srcOrFile));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    const processCanvas = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) {
          resolve(srcOrFile);
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(srcOrFile);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Check if a pixel is white/near-white
        const isWhitePixel = (i) => {
          const a = data[i + 3];
          if (a < 50) return false; // Already transparent
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Near white: bright and low color cast
          return r >= 232 && g >= 232 && b >= 232 && Math.abs(r - g) <= tolerance && Math.abs(g - b) <= tolerance;
        };

        // Check 4 corners
        const corners = [
          0,
          (w - 1) * 4,
          ((h - 1) * w) * 4,
          ((h - 1) * w + (w - 1)) * 4
        ];
        const hasWhiteCorner = corners.some(isWhitePixel);

        // Check perimeter sample points
        let edgeWhiteCount = 0;
        const samples = 20;
        for (let s = 0; s < samples; s++) {
          const x = Math.floor((s / samples) * w);
          const y = Math.floor((s / samples) * h);
          if (
            isWhitePixel(x * 4) ||
            isWhitePixel(((h - 1) * w + x) * 4) ||
            isWhitePixel((y * w) * 4) ||
            isWhitePixel((y * w + (w - 1)) * 4)
          ) {
            edgeWhiteCount++;
          }
        }

        // If corners & edges are not white, image is already transparent or colored background
        if (!hasWhiteCorner && edgeWhiteCount < 2) {
          if (typeof srcOrFile === "string") transparentBgCache.set(srcOrFile, srcOrFile);
          resolve(srcOrFile);
          return;
        }

        // BFS flood fill starting strictly from outer boundary pixels
        const visited = new Uint8Array(w * h);
        const queue = [];

        // Seed top and bottom edges
        for (let x = 0; x < w; x++) {
          const topPos = x;
          const topIdx = topPos * 4;
          if (isWhitePixel(topIdx)) {
            visited[topPos] = 1;
            queue.push(x, 0);
          }
          const btmPos = (h - 1) * w + x;
          const btmIdx = btmPos * 4;
          if (isWhitePixel(btmIdx)) {
            visited[btmPos] = 1;
            queue.push(x, h - 1);
          }
        }

        // Seed left and right edges
        for (let y = 0; y < h; y++) {
          const leftPos = y * w;
          const leftIdx = leftPos * 4;
          if (!visited[leftPos] && isWhitePixel(leftIdx)) {
            visited[leftPos] = 1;
            queue.push(0, y);
          }
          const rightPos = y * w + (w - 1);
          const rightIdx = rightPos * 4;
          if (!visited[rightPos] && isWhitePixel(rightIdx)) {
            visited[rightPos] = 1;
            queue.push(w - 1, y);
          }
        }

        let head = 0;
        while (head < queue.length) {
          const cx = queue[head++];
          const cy = queue[head++];
          const p = cy * w + cx;
          const idx = p * 4;

          data[idx + 3] = 0; // Make background transparent

          const neighbors = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1]
          ];

          for (let n = 0; n < 4; n++) {
            const nx = neighbors[n][0];
            const ny = neighbors[n][1];
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const np = ny * w + nx;
              if (!visited[np]) {
                const nidx = np * 4;
                if (isWhitePixel(nidx)) {
                  visited[np] = 1;
                  queue.push(nx, ny);
                } else {
                  // Feather boundary pixels for clean anti-aliasing without white halo
                  const r = data[nidx], g = data[nidx + 1], b = data[nidx + 2];
                  if (r > 220 && g > 220 && b > 220 && data[nidx + 3] > 0) {
                    const bright = (r + g + b) / 3;
                    if (bright > 228) {
                      data[nidx + 3] = Math.round(data[nidx + 3] * Math.max(0, (255 - bright) / 27));
                    }
                  }
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const resultPng = canvas.toDataURL("image/png");
        if (typeof srcOrFile === "string") {
          transparentBgCache.set(srcOrFile, resultPng);
        }
        resolve(resultPng);
      } catch (err) {
        console.warn("Could not remove white background:", err);
        resolve(srcOrFile);
      }
    };

    img.onload = processCanvas;
    img.onerror = () => resolve(srcOrFile);

    if (typeof srcOrFile === "string") {
      img.src = srcOrFile;
    } else if (srcOrFile instanceof Blob || srcOrFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result;
      };
      reader.readAsDataURL(srcOrFile);
    } else {
      resolve(srcOrFile);
    }
  });
}
