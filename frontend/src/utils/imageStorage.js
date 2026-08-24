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
