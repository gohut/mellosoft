/**
 * Authoritative Central Product Lookup & Routing Utilities for Mellosoft
 */
export { getMinimumProductPrice, formatPrice } from "./currency";
import { getResolvedImageUrlSync } from "./imageStorage";

export const ACCESSORY_CATEGORIES = {
  "memory-foam-pillow": {
    id: "memory-foam-pillow",
    slug: "memory-foam-pillow",
    name: "Memory Foam Pillow",
    title: "Memory Foam Pillows",
    heading: "Memory Foam Pillows",
    description: "Adaptive comfort designed to support your head and neck.",
    tagline: "Adaptive comfort designed to support your head and neck.",
    image: "/images/accessories/pillows/cloud-contour.jpg"
  },
  "latex-pillow": {
    id: "latex-pillow",
    slug: "latex-pillow",
    name: "Latex Pillow",
    title: "Latex Pillows",
    heading: "Latex Pillows",
    description: "Naturally responsive, breathable comfort for refreshing sleep.",
    tagline: "Naturally responsive, breathable comfort for refreshing sleep.",
    image: "/images/accessories/pillows/natura-latex.jpg"
  },
  "fiber-pillow": {
    id: "fiber-pillow",
    slug: "fiber-pillow",
    name: "Fiber Pillow",
    title: "Fiber Pillows",
    heading: "Fiber Pillows",
    description: "Soft, lightweight comfort for everyday relaxation.",
    tagline: "Soft, lightweight comfort for everyday relaxation.",
    image: "/images/accessories/pillows/plush-fiber.jpg"
  },
  "mattress-protector": {
    id: "mattress-protector",
    slug: "mattress-protector",
    name: "Mattress Protector",
    title: "Mattress Protectors",
    heading: "Mattress Protectors",
    description: "Practical protection designed to keep your mattress fresh and comfortable.",
    tagline: "Practical protection designed to keep your mattress fresh and comfortable.",
    image: "/images/accessories/pillows/92616115d66068597b3fcfc2e5ea2714.jpg"
  },
  "fitted-bedspread": {
    id: "fitted-bedspread",
    slug: "fitted-bedspread",
    name: "Fitted Bedspread",
    title: "Fitted Bedspreads",
    heading: "Fitted Bedspreads",
    description: "Clean fitted styling for a neat and comfortable bedroom.",
    tagline: "Clean fitted styling for a neat and comfortable bedroom.",
    image: "/images/accessories/pillows/soft-touch.jpg"
  },
  "blanket-duvet": {
    id: "blanket-duvet",
    slug: "blanket-duvet",
    name: "Blanket / Duvet",
    title: "Blankets & Duvets",
    heading: "Blankets & Duvets",
    description: "Cozy layers designed for comfortable nights in every season.",
    tagline: "Cozy layers designed for comfortable nights in every season.",
    image: "/images/accessories/pillows/cloud-contour.jpg"
  },
  "travel-bed": {
    id: "travel-bed",
    slug: "travel-bed",
    name: "Travel Bed",
    title: "Travel Beds",
    heading: "Travel Beds",
    description: "Portable sleep comfort for guests, journeys and compact spaces.",
    tagline: "Portable sleep comfort for guests, journeys and compact spaces.",
    image: "/asset/pillow.png"
  }
};

export const ACCESSORY_CATEGORY_LIST = Object.values(ACCESSORY_CATEGORIES);

export const MATTRESS_CATEGORIES = {
  foam: {
    id: "foam",
    slug: "foam",
    name: "Foam Mattress",
    title: "Foam Mattresses",
    heading: "Foam Mattresses",
    description: "Simple, supportive comfort designed for everyday rest.",
    tagline: "Simple, supportive comfort designed for everyday rest.",
    image: "/images/mattresses/foam/haven.jpg"
  },
  ortho: {
    id: "ortho",
    slug: "ortho",
    name: "Ortho Mattress",
    title: "Ortho Mattresses",
    heading: "Ortho Mattresses",
    description: "Balanced firmness and dependable support for comfortable sleep.",
    tagline: "Balanced firmness and dependable support for comfortable sleep.",
    image: "/images/mattresses/foam/cocoon.jpg"
  },
  spring: {
    id: "spring",
    slug: "spring",
    name: "Spring Mattress",
    title: "Spring Mattresses",
    heading: "Spring Mattresses",
    description: "Responsive support with breathable spring comfort.",
    tagline: "Responsive support with breathable spring comfort.",
    image: "/images/mattresses/foam/0beb5330f6aabf8576772441b99ea894.jpg"
  },
  latex: {
    id: "latex",
    slug: "latex",
    name: "Latex Mattress",
    title: "Latex Mattresses",
    heading: "Latex Mattresses",
    description: "Naturally responsive comfort with premium resilience.",
    tagline: "Naturally responsive comfort with premium resilience.",
    image: "/images/mattresses/foam/99f4537f6a3b342b766b3253fa072148.jpg"
  },
  "memory-foam": {
    id: "memory-foam",
    slug: "memory-foam",
    name: "Memory Foam Mattress",
    title: "Memory Foam Mattresses",
    heading: "Memory Foam Mattresses",
    description: "Adaptive comfort designed to contour around your body.",
    tagline: "Adaptive comfort designed to contour around your body.",
    image: "/asset/img2.jpg"
  }
};

export const MATTRESS_CATEGORY_LIST = Object.values(MATTRESS_CATEGORIES);

/**
 * Calculates price from product pricing matrix
 */
export function getCalculatedPrice(product, thickness, size) {
  if (!product || !product.prices) return product?.startingPrice ?? null;
  const thicknessKey = thickness ? String(thickness).trim() : null;
  const sizeKey = size ? String(size).trim() : null;

  if (thicknessKey && sizeKey && product.prices[thicknessKey]) {
    const val = product.prices[thicknessKey][sizeKey];
    if (val !== undefined && val !== null) return val;
  }
  return product.startingPrice ?? null;
}

/**
 * Retrieves accessory category metadata for a given slug
 */
export function getAccessoryCategoryMeta(categorySlug) {
  if (!categorySlug || categorySlug === "all" || categorySlug === "All") return null;
  const normalized = String(categorySlug).trim().toLowerCase();
  return ACCESSORY_CATEGORIES[normalized] || null;
}

/**
 * Retrieves mattress category metadata for a given slug
 */
export function getMattressCategoryMeta(categorySlug) {
  if (!categorySlug || categorySlug === "all" || categorySlug === "All" || categorySlug === "mattress") return null;
  const normalized = String(categorySlug).trim().toLowerCase();
  return MATTRESS_CATEGORIES[normalized] || null;
}

/**
 * Filters accessories by category slug
 */
export function getAccessoriesByCategory(accessories = [], categorySlug = "all") {
  if (!Array.isArray(accessories)) return [];
  if (!categorySlug || categorySlug === "all" || categorySlug === "All") {
    return accessories;
  }
  const target = String(categorySlug).trim().toLowerCase();
  return accessories.filter((item) => {
    if (!item) return false;
    const cat = String(item.category || item.subCategory || "").trim().toLowerCase();
    return cat === target;
  });
}

/**
 * Filters mattresses by category slug
 */
export function getMattressesByCategory(mattresses = [], categorySlug = "all") {
  if (!Array.isArray(mattresses)) return [];
  // Exclude accessories
  const mattressItems = mattresses.filter((p) => p && p.category !== "accessories");
  if (!categorySlug || categorySlug === "all" || categorySlug === "All" || categorySlug === "mattress") {
    return mattressItems;
  }
  const target = String(categorySlug).trim().toLowerCase();
  return mattressItems.filter((item) => {
    const cat = String(item.category || "").trim().toLowerCase();
    return cat === target;
  });
}

/**
 * Returns clean canonical URL for any mattress or accessory product
 */
export function getProductUrl(product) {
  if (!product) return "/mattresses";
  const identifier = product.slug || product.id || product.Product_Id;
  if (!identifier) return "/mattresses";
  return `/product/${encodeURIComponent(String(identifier).trim())}`;
}

/**
 * Resolves a product from any collection by id, slug, or Product_Id case-insensitively
 */
export function getProductByIdentifier(identifier, productsList = []) {
  if (!identifier || !Array.isArray(productsList)) return null;

  let target = String(identifier).trim();
  try {
    target = decodeURIComponent(target).trim().toLowerCase();
  } catch (e) {
    target = target.toLowerCase();
  }

  return (
    productsList.find((product) => {
      if (!product) return false;
      const id = String(product.id || "").trim().toLowerCase();
      const slug = String(product.slug || "").trim().toLowerCase();
      const prodId = String(product.Product_Id || "").trim().toLowerCase();
      return id === target || slug === target || prodId === target;
    }) || null
  );
}

/**
 * Computes deterministic, category-aware recommendations excluding current product
 */
export function getRelatedProducts(currentProduct, productsList = [], limit = 4) {
  if (!currentProduct || !Array.isArray(productsList)) return [];

  const currentId = String(currentProduct.id || "").trim().toLowerCase();
  const currentSlug = String(currentProduct.slug || "").trim().toLowerCase();
  const currentCat = currentProduct.subCategory || currentProduct.category;

  const candidates = productsList.filter((item) => {
    if (!item) return false;
    const itemId = String(item.id || "").trim().toLowerCase();
    const itemSlug = String(item.slug || "").trim().toLowerCase();
    return itemId !== currentId && itemSlug !== currentSlug;
  });

  // 1. Same exact category or subCategory
  const sameCategory = candidates.filter((item) => {
    const itemCat = item.subCategory || item.category;
    return itemCat === currentCat;
  });

  // 2. Same general group (Accessories vs Mattresses)
  const sameGroup = candidates.filter((item) => {
    const itemCat = item.subCategory || item.category;
    if (itemCat === currentCat) return false;
    if (currentProduct.subCategory || currentProduct.category === "accessories") {
      return item.subCategory || item.category === "accessories";
    }
    return !item.subCategory && item.category !== "accessories";
  });

  // 3. Other remaining candidate products
  const remaining = candidates.filter(
    (item) => !sameCategory.includes(item) && !sameGroup.includes(item)
  );

  const combined = [...sameCategory, ...sameGroup, ...remaining];

  // De-duplicate by ID / Slug
  const uniqueList = [];
  const seen = new Set();
  for (const item of combined) {
    const key = item.slug || item.id;
    if (key && !seen.has(key)) {
      seen.add(key);
      uniqueList.push(item);
    }
    if (uniqueList.length >= limit) break;
  }

  return uniqueList;
}

/**
 * Specialized Mattress Recommendation Engine (Strictly excludes accessories and current product)
 */
export function getMattressRecommendations(currentProduct, productsList = [], limit = 4) {
  if (!currentProduct || !Array.isArray(productsList)) return [];

  // Exclude accessories
  const mattressList = productsList.filter((p) => p && p.category !== "accessories");

  const currentId = String(currentProduct.id || "").trim().toLowerCase();
  const currentSlug = String(currentProduct.slug || "").trim().toLowerCase();
  const currentCat = String(currentProduct.category || "").trim().toLowerCase();

  const candidates = mattressList.filter((item) => {
    const itemId = String(item.id || "").trim().toLowerCase();
    const itemSlug = String(item.slug || "").trim().toLowerCase();
    return itemId !== currentId && itemSlug !== currentSlug;
  });

  const sameCategory = candidates.filter((item) => {
    const itemCat = String(item.category || "").trim().toLowerCase();
    return itemCat === currentCat;
  });

  const otherMattresses = candidates.filter((item) => {
    const itemCat = String(item.category || "").trim().toLowerCase();
    return itemCat !== currentCat;
  });

  const combined = [...sameCategory, ...otherMattresses];

  const uniqueList = [];
  const seen = new Set();
  for (const item of combined) {
    const key = item.slug || item.id;
    if (key && !seen.has(key)) {
      seen.add(key);
      uniqueList.push(item);
    }
    if (uniqueList.length >= limit) break;
  }

  return uniqueList;
}



/**
 * Identifies legacy branded artwork SVGs or fallback placeholder paths.
 */
export function isLegacyArtwork(url) {
  if (!url || typeof url !== "string") return false;
  const lower = url.trim().toLowerCase();
  if (lower.endsWith(".svg") || lower.includes("/fallback/") || lower.includes("artwork") || lower.includes("mellosoft") && lower.endsWith(".svg")) {
    return true;
  }
  return false;
}

/**
 * Canonical helper to collect all valid, de-duplicated gallery images of a product.
 * Strips all legacy artwork SVGs and returns only real product images.
 */
export function getProductGalleryImages(product) {
  if (!product) return [];

  const rawCandidates = [];

  if (Array.isArray(product.images) && product.images.length > 0) {
    rawCandidates.push(...product.images);
  }
  if (product.image) rawCandidates.push(product.image);
  if (product.imageUrl) rawCandidates.push(product.imageUrl);
  if (product.thumbnail) rawCandidates.push(product.thumbnail);

  const seen = new Set();
  const cleanList = [];

  for (const item of rawCandidates) {
    if (!item || typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed || isLegacyArtwork(trimmed)) continue;

    const resolved = getResolvedImageUrlSync(trimmed, "");
    if (resolved && !isLegacyArtwork(resolved) && !seen.has(resolved)) {
      seen.add(resolved);
      cleanList.push(resolved);
    }
  }

  if (cleanList.length === 0) {
    const isAcc = isAccessoryProduct(product);
    const fallbackPhoto = isAcc
      ? "/images/accessories/pillows/natura-latex.jpg"
      : "/images/mattresses/foam/haven.jpg";
    cleanList.push(fallbackPhoto);
  }

  return cleanList;
}

/**
 * Canonical helper to resolve the primary display image of any product.
 * Returns only real product images.
 */
export function getProductPrimaryImage(product, defaultFallback = null) {
  const gallery = getProductGalleryImages(product);
  if (gallery.length > 0) return gallery[0];
  const isAcc = isAccessoryProduct(product);
  return isAcc
    ? "/images/accessories/pillows/natura-latex.jpg"
    : "/images/mattresses/foam/haven.jpg";
}

export const DELETED_PRODUCT_IDS_KEY = "mellosoft_deleted_product_ids";

/**
 * Returns array of persistently deleted product IDs/slugs
 */
export function getDeletedProductIds() {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(DELETED_PRODUCT_IDS_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to load deleted product IDs:", e);
    return [];
  }
}

/**
 * Persists a deleted product ID/slug tombstone
 */
export function saveDeletedProductId(productId) {
  if (typeof window === "undefined" || !productId) return;
  try {
    const current = getDeletedProductIds();
    const idStr = String(productId).trim();
    if (idStr && !current.includes(idStr)) {
      const next = [...current, idStr];
      localStorage.setItem(DELETED_PRODUCT_IDS_KEY, JSON.stringify(next));
    }
  } catch (e) {
    console.error("Failed to save deleted product ID:", e);
  }
}

/**
 * Checks if a product or ID is deleted
 */
export function isProductDeleted(productOrId, deletedIdsList = null) {
  if (!productOrId) return false;
  const deletedSet = new Set(
    (deletedIdsList || getDeletedProductIds()).map((id) => String(id).trim().toLowerCase())
  );
  if (deletedSet.size === 0) return false;

  if (typeof productOrId === "object") {
    const id = String(productOrId.id || "").trim().toLowerCase();
    const prodId = String(productOrId.Product_Id || "").trim().toLowerCase();
    const slug = String(productOrId.slug || "").trim().toLowerCase();
    return deletedSet.has(id) || deletedSet.has(prodId) || deletedSet.has(slug);
  }

  const target = String(productOrId).trim().toLowerCase();
  return deletedSet.has(target);
}

/**
 * Helper to test if two product objects or ID strings refer to the same product.
 */
export function isSameProduct(p1, p2OrId) {
  if (!p1 || !p2OrId) return false;

  const targetId = typeof p2OrId === "object" ? (p2OrId.id || p2OrId.Product_Id || p2OrId.slug) : p2OrId;
  const targetProdId = typeof p2OrId === "object" ? p2OrId.Product_Id : null;
  const targetSlug = typeof p2OrId === "object" ? p2OrId.slug : null;

  const id1 = String(p1.id || "").trim().toLowerCase();
  const prodId1 = String(p1.Product_Id || "").trim().toLowerCase();
  const slug1 = String(p1.slug || "").trim().toLowerCase();

  const id2 = String(targetId || "").trim().toLowerCase();
  const prodId2 = String(targetProdId || id2).trim().toLowerCase();
  const slug2 = String(targetSlug || id2).trim().toLowerCase();

  return (
    (id1 && (id1 === id2 || id1 === prodId2 || id1 === slug2)) ||
    (prodId1 && (prodId1 === id2 || prodId1 === prodId2 || prodId1 === slug2)) ||
    (slug1 && (slug1 === id2 || slug1 === prodId2 || slug1 === slug2))
  );
}

/**
 * Normalizes any category or subcategory string into a standard slug key.
 * e.g., "Memory Foam Pillow" -> "memory-foam-pillow"
 * "Blanket / Duvet" -> "blanket-duvet"
 */
export function normalizeCategoryKey(key) {
  if (!key || typeof key !== "string") return "";
  return key
    .trim()
    .toLowerCase()
    .replace(/\s*\/\s*/g, "-")
    .replace(/\s+/g, "-")
    .replace(/_+/g, "-");
}

/**
 * Helper to check if a product is an accessory.
 */
export function isAccessoryProduct(product) {
  if (!product) return false;
  const parentCat = normalizeCategoryKey(product.parentCategory || product.parentCategoryId);
  const cat = normalizeCategoryKey(product.category || product.categoryId);
  const subCat = normalizeCategoryKey(product.subCategory || product.subcategory || product.subcategoryId);

  if (parentCat === "accessories" || cat === "accessories") return true;

  const accessorySubcategories = [
    "memory-foam-pillow", "latex-pillow", "fiber-pillow",
    "mattress-protector", "fitted-bedspread", "blanket-duvet", "travel-bed"
  ];
  return accessorySubcategories.includes(cat) || accessorySubcategories.includes(subCat);
}

/**
 * Returns parent group key: "mattresses" or "accessories".
 */
export function getProductGroupKey(product) {
  if (!product) return "mattresses";
  if (isAccessoryProduct(product)) return "accessories";
  return "mattresses";
}

/**
 * Returns the normalized subcategory key for a product.
 */
export function getProductSubcategoryKey(product) {
  if (!product) return "";
  const subCat = product.subCategory || product.subcategory || product.subcategoryId;
  if (subCat && normalizeCategoryKey(subCat) !== "accessories" && normalizeCategoryKey(subCat) !== "mattresses") {
    return normalizeCategoryKey(subCat);
  }
  const cat = product.category || product.categoryId;
  if (cat && normalizeCategoryKey(cat) !== "accessories" && normalizeCategoryKey(cat) !== "mattresses") {
    return normalizeCategoryKey(cat);
  }
  return normalizeCategoryKey(product.categoryName || product.categoryLabel);
}

export function getProductCategoryKey(product) {
  return getProductSubcategoryKey(product);
}

/**
 * Resolves user-friendly display label for any product's category/subcategory.
 */
export function getProductCategoryLabel(product) {
  if (!product) return "General";

  if (product.categoryLabel && typeof product.categoryLabel === "string") {
    const rawLabel = product.categoryLabel.trim();
    const norm = normalizeCategoryKey(rawLabel);
    if (norm !== "accessories" && norm !== "mattresses" && norm !== "all") {
      return rawLabel;
    }
  }

  const subKey = getProductSubcategoryKey(product);
  if (subKey) {
    if (ACCESSORY_CATEGORIES[subKey]) {
      return ACCESSORY_CATEGORIES[subKey].name;
    }
    if (MATTRESS_CATEGORIES[subKey]) {
      return MATTRESS_CATEGORIES[subKey].name;
    }
  }

  if (product.categoryName && typeof product.categoryName === "string") {
    const rawName = product.categoryName.trim();
    const norm = normalizeCategoryKey(rawName);
    if (norm !== "accessories" && norm !== "mattresses" && norm !== "all") {
      return rawName;
    }
  }

  if (isAccessoryProduct(product)) {
    return "Memory Foam Pillow";
  }

  return "Ortho Mattress";
}

/**
 * Universal predicate checking if a product belongs to a group/category key.
 */
export function isProductInCategory(product, categoryKey) {
  if (!product || !categoryKey) return false;
  const targetKey = normalizeCategoryKey(categoryKey);
  if (targetKey === "all" || targetKey === "all-categories" || targetKey === "all-products") return true;

  if (targetKey === "mattresses" || targetKey === "mattress" || targetKey === "all-mattresses") {
    return getProductGroupKey(product) === "mattresses";
  }
  if (targetKey === "accessories" || targetKey === "accessory" || targetKey === "all-accessories") {
    return getProductGroupKey(product) === "accessories";
  }

  const subKey = getProductCategoryKey(product);
  const catKey = normalizeCategoryKey(product.category || product.categoryId);
  const catNameKey = normalizeCategoryKey(product.categoryName || product.categoryLabel);

  return (
    subKey === targetKey ||
    catKey === targetKey ||
    catNameKey === targetKey
  );
}

/**
 * Generic group filter function (e.g. "mattresses" vs "accessories").
 */
export function getProductsByGroup(products, groupKey) {
  if (!Array.isArray(products)) return [];
  const normGroup = normalizeCategoryKey(groupKey);
  if (normGroup === "all" || normGroup === "all-categories" || normGroup === "all-products") {
    return products;
  }
  return products.filter((p) => getProductGroupKey(p) === normGroup);
}

/**
 * Generic category filter function for both Mattresses and Accessories.
 */
export function getProductsByCategory(products, categoryKey) {
  if (!Array.isArray(products)) return [];
  return products.filter((p) => isProductInCategory(p, categoryKey));
}

export function filterProductsByCategory(products, categoryKey) {
  return getProductsByCategory(products, categoryKey);
}

/**
 * Generic category count function using exact same predicate as filtering.
 */
export function getCategoryCount(products, categoryKey) {
  return getProductsByCategory(products, categoryKey).length;
}
