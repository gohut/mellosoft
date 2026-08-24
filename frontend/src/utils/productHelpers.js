/**
 * Authoritative Central Product Lookup & Routing Utilities for Mellosoft
 */
export { getMinimumProductPrice, formatPrice } from "./currency";

export const ACCESSORY_CATEGORIES = {
  "memory-foam-pillow": {
    id: "memory-foam-pillow",
    slug: "memory-foam-pillow",
    name: "Memory Foam Pillow",
    title: "Memory Foam Pillows",
    heading: "Memory Foam Pillows",
    description: "Adaptive comfort designed to support your head and neck.",
    tagline: "Adaptive comfort designed to support your head and neck.",
    image: "/images/accessories/fallback/memory-foam-pillow.svg"
  },
  "latex-pillow": {
    id: "latex-pillow",
    slug: "latex-pillow",
    name: "Latex Pillow",
    title: "Latex Pillows",
    heading: "Latex Pillows",
    description: "Naturally responsive, breathable comfort for refreshing sleep.",
    tagline: "Naturally responsive, breathable comfort for refreshing sleep.",
    image: "/images/accessories/fallback/latex-pillow.svg"
  },
  "fiber-pillow": {
    id: "fiber-pillow",
    slug: "fiber-pillow",
    name: "Fiber Pillow",
    title: "Fiber Pillows",
    heading: "Fiber Pillows",
    description: "Soft, lightweight comfort for everyday relaxation.",
    tagline: "Soft, lightweight comfort for everyday relaxation.",
    image: "/images/accessories/fallback/fiber-pillow.svg"
  },
  "mattress-protector": {
    id: "mattress-protector",
    slug: "mattress-protector",
    name: "Mattress Protector",
    title: "Mattress Protectors",
    heading: "Mattress Protectors",
    description: "Practical protection designed to keep your mattress fresh and comfortable.",
    tagline: "Practical protection designed to keep your mattress fresh and comfortable.",
    image: "/images/accessories/fallback/mattress-protector.svg"
  },
  "fitted-bedspread": {
    id: "fitted-bedspread",
    slug: "fitted-bedspread",
    name: "Fitted Bedspread",
    title: "Fitted Bedspreads",
    heading: "Fitted Bedspreads",
    description: "Clean fitted styling for a neat and comfortable bedroom.",
    tagline: "Clean fitted styling for a neat and comfortable bedroom.",
    image: "/images/accessories/fallback/fitted-bedspread.svg"
  },
  "blanket-duvet": {
    id: "blanket-duvet",
    slug: "blanket-duvet",
    name: "Blanket / Duvet",
    title: "Blankets & Duvets",
    heading: "Blankets & Duvets",
    description: "Cozy layers designed for comfortable nights in every season.",
    tagline: "Cozy layers designed for comfortable nights in every season.",
    image: "/images/accessories/fallback/blanket-duvet.svg"
  },
  "travel-bed": {
    id: "travel-bed",
    slug: "travel-bed",
    name: "Travel Bed",
    title: "Travel Beds",
    heading: "Travel Beds",
    description: "Portable sleep comfort for guests, journeys and compact spaces.",
    tagline: "Portable sleep comfort for guests, journeys and compact spaces.",
    image: "/images/accessories/fallback/travel-bed.svg"
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
    image: "/images/mattresses/fallback/foam.svg"
  },
  ortho: {
    id: "ortho",
    slug: "ortho",
    name: "Ortho Mattress",
    title: "Ortho Mattresses",
    heading: "Ortho Mattresses",
    description: "Balanced firmness and dependable support for comfortable sleep.",
    tagline: "Balanced firmness and dependable support for comfortable sleep.",
    image: "/images/mattresses/fallback/ortho.svg"
  },
  spring: {
    id: "spring",
    slug: "spring",
    name: "Spring Mattress",
    title: "Spring Mattresses",
    heading: "Spring Mattresses",
    description: "Responsive support with breathable spring comfort.",
    tagline: "Responsive support with breathable spring comfort.",
    image: "/images/mattresses/fallback/spring.svg"
  },
  latex: {
    id: "latex",
    slug: "latex",
    name: "Latex Mattress",
    title: "Latex Mattresses",
    heading: "Latex Mattresses",
    description: "Naturally responsive comfort with premium resilience.",
    tagline: "Naturally responsive comfort with premium resilience.",
    image: "/images/mattresses/fallback/latex.svg"
  },
  "memory-foam": {
    id: "memory-foam",
    slug: "memory-foam",
    name: "Memory Foam Mattress",
    title: "Memory Foam Mattresses",
    heading: "Memory Foam Mattresses",
    description: "Adaptive comfort designed to contour around your body.",
    tagline: "Adaptive comfort designed to contour around your body.",
    image: "/images/mattresses/fallback/memory-foam.svg"
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
