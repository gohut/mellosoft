/**
 * Authoritative Central Product Lookup & Routing Utilities for Mellosoft
 */
export { getMinimumProductPrice, formatPrice } from "./currency";
import { getResolvedImageUrlSync } from "./imageStorage";

export const ACCESSORY_CATEGORIES = {
  "memory-foam-pillow": { id: "memory-foam-pillow", slug: "memory-foam-pillow", name: "Memory Foam Pillow", title: "Memory Foam Pillows", heading: "Memory Foam Pillows", description: "Adaptive comfort designed to support your head and neck.", tagline: "Adaptive comfort designed to support your head and neck.", image: "/images/accessories/pillows/cloud-contour.jpg" },
  "latex-pillow": { id: "latex-pillow", slug: "latex-pillow", name: "Latex Pillow", title: "Latex Pillows", heading: "Latex Pillows", description: "Naturally responsive, breathable comfort for refreshing sleep.", tagline: "Naturally responsive, breathable comfort for refreshing sleep.", image: "/images/accessories/pillows/natura-latex.jpg" },
  "fiber-pillow": { id: "fiber-pillow", slug: "fiber-pillow", name: "Fiber Pillow", title: "Fiber Pillows", heading: "Fiber Pillows", description: "Soft, lightweight comfort for everyday relaxation.", tagline: "Soft, lightweight comfort for everyday relaxation.", image: "/images/accessories/pillows/plush-fiber.jpg" },
  "mattress-protector": { id: "mattress-protector", slug: "mattress-protector", name: "Mattress Protector", title: "Mattress Protectors", heading: "Mattress Protectors", description: "Practical protection designed to keep your mattress fresh and comfortable.", tagline: "Practical protection designed to keep your mattress fresh and comfortable.", image: "/images/accessories/pillows/92616115d66068597b3fcfc2e5ea2714.jpg" },
  "fitted-bedspread": { id: "fitted-bedspread", slug: "fitted-bedspread", name: "Fitted Bedspread", title: "Fitted Bedspreads", heading: "Fitted Bedspreads", description: "Clean fitted styling for a neat and comfortable bedroom.", tagline: "Clean fitted styling for a neat and comfortable bedroom.", image: "/images/accessories/pillows/soft-touch.jpg" },
  "blanket-duvet": { id: "blanket-duvet", slug: "blanket-duvet", name: "Blanket / Duvet", title: "Blankets & Duvets", heading: "Blankets & Duvets", description: "Cozy layers designed for comfortable nights in every season.", tagline: "Cozy layers designed for comfortable nights in every season.", image: "/images/accessories/pillows/cloud-contour.jpg" },
  "travel-bed": { id: "travel-bed", slug: "travel-bed", name: "Travel Bed", title: "Travel Beds", heading: "Travel Beds", description: "Portable sleep comfort for guests, journeys and compact spaces.", tagline: "Portable sleep comfort for guests, journeys and compact spaces.", image: "/asset/pillow.png" }
};

/**
 * Canonical Bed Frame subcategory dictionary (Bed Frames is now its own main category).
 */
export const BED_FRAME_CATEGORIES = {
  "wooden-bed-frame": { id: "wooden-bed-frame", slug: "wooden-bed-frame", name: "Wooden Bed Frame", title: "Wooden Bed Frames", heading: "Wooden Bed Frames", description: "Handcrafted solid wooden bed frames for timeless style and stability.", tagline: "Handcrafted solid wooden bed frames for timeless style and stability.", image: "/assets/categories/bed-frames.jpg" },
  "platform-bed": { id: "platform-bed", slug: "platform-bed", name: "Platform Bed", title: "Platform Beds", heading: "Platform Beds", description: "Sleek, low-profile platform beds with slatted support for modern bedrooms.", tagline: "Sleek, low-profile platform beds with slatted support for modern bedrooms.", image: "/assets/categories/bed-frames.jpg" }
};

export const MATTRESS_CATEGORIES = {
  foam: { id: "foam", slug: "foam", name: "Foam Mattress", title: "Foam Mattresses", heading: "Foam Mattresses", description: "Simple, supportive comfort designed for everyday rest.", tagline: "Simple, supportive comfort designed for everyday rest.", image: "/images/mattresses/foam/haven.jpg" },
  ortho: { id: "ortho", slug: "ortho", name: "Ortho Mattress", title: "Ortho Mattresses", heading: "Ortho Mattresses", description: "Balanced firmness and dependable support for comfortable sleep.", tagline: "Balanced firmness and dependable support for comfortable sleep.", image: "/images/mattresses/foam/cocoon.jpg" },
  spring: { id: "spring", slug: "spring", name: "Spring Mattress", title: "Spring Mattresses", heading: "Spring Mattresses", description: "Responsive support with breathable spring comfort.", tagline: "Responsive support with breathable spring comfort.", image: "/images/mattresses/foam/0beb5330f6aabf8576772441b99ea894.jpg" },
  latex: { id: "latex", slug: "latex", name: "Latex Mattress", title: "Latex Mattresses", heading: "Latex Mattresses", description: "Naturally responsive comfort with premium resilience.", tagline: "Naturally responsive comfort with premium resilience.", image: "/images/mattresses/foam/99f4537f6a3b342b766b3253fa072148.jpg" },
  "memory-foam": { id: "memory-foam", slug: "memory-foam", name: "Memory Foam Mattress", title: "Memory Foam Mattresses", heading: "Memory Foam Mattresses", description: "Adaptive comfort designed to contour around your body.", tagline: "Adaptive comfort designed to contour around your body.", image: "/asset/img2.jpg" }
};

export const MATTRESS_CATEGORY_LIST = Object.values(MATTRESS_CATEGORIES);
export const ACCESSORY_CATEGORY_LIST = Object.values(ACCESSORY_CATEGORIES);
export const BED_FRAME_CATEGORY_LIST = Object.values(BED_FRAME_CATEGORIES);

export const DEFAULT_CATEGORIES_TREE = [
  {
    id: "CAT-MATTRESSES",
    name: "Mattresses",
    slug: "mattresses",
    image: "/assets/categories/memory-foam.jpg",
    description: "Premium sleep mattresses handcrafted for deep rest",
    type: "main",
    active: true,
    showInNavigation: true,
    order: 1,
    subcategories: [
      { id: "SUB-FOAM", parentId: "CAT-MATTRESSES", parentSlug: "mattresses", name: "Foam Mattress", slug: "foam", aliases: ["foam", "foam-mattress", "foam mattress"], active: true, order: 1 },
      { id: "SUB-ORTHO", parentId: "CAT-MATTRESSES", parentSlug: "mattresses", name: "Ortho Mattress", slug: "ortho", aliases: ["ortho", "ortho-mattress", "ortho mattress"], active: true, order: 2 },
      { id: "SUB-SPRING", parentId: "CAT-MATTRESSES", parentSlug: "mattresses", name: "Spring Mattress", slug: "spring", aliases: ["spring", "spring-mattress", "spring mattress"], active: true, order: 3 },
      { id: "SUB-LATEX", parentId: "CAT-MATTRESSES", parentSlug: "mattresses", name: "Latex Mattress", slug: "latex", aliases: ["latex", "latex-mattress", "latex mattress"], active: true, order: 4 },
      { id: "SUB-MEMORY-FOAM", parentId: "CAT-MATTRESSES", parentSlug: "mattresses", name: "Memory Foam Mattress", slug: "memory-foam", aliases: ["memory-foam", "memory-foam-mattress", "memory foam mattress"], active: true, order: 5 }
    ]
  },
  {
    id: "CAT-ACCESSORIES",
    name: "Accessories",
    slug: "accessories",
    image: "/assets/categories/pillows.jpg",
    description: "Luxury pillows, protectors & sleep essentials",
    type: "main",
    active: true,
    showInNavigation: true,
    order: 2,
    subcategories: [
      { id: "SUB-MEMORY-FOAM-PILLOW", parentId: "CAT-ACCESSORIES", parentSlug: "accessories", name: "Memory Foam Pillow", slug: "memory-foam-pillow", aliases: ["memory-foam-pillow", "memory foam pillow", "pillows", "pillow"], active: true, order: 1 },
      { id: "SUB-LATEX-PILLOW", parentId: "CAT-ACCESSORIES", parentSlug: "accessories", name: "Latex Pillow", slug: "latex-pillow", aliases: ["latex-pillow", "latex pillow"], active: true, order: 2 },
      { id: "SUB-FIBER-PILLOW", parentId: "CAT-ACCESSORIES", parentSlug: "accessories", name: "Fiber Pillow", slug: "fiber-pillow", aliases: ["fiber-pillow", "fiber pillow"], active: true, order: 3 },
      { id: "SUB-MATTRESS-PROTECTOR", parentId: "CAT-ACCESSORIES", parentSlug: "accessories", name: "Mattress Protector", slug: "mattress-protector", aliases: ["mattress-protector", "mattress protector", "protectors", "protector"], active: true, order: 4 },
      { id: "SUB-FITTED-BEDSPREAD", parentId: "CAT-ACCESSORIES", parentSlug: "accessories", name: "Fitted Bedspread", slug: "fitted-bedspread", aliases: ["fitted-bedspread", "fitted bedspread"], active: true, order: 5 },
      { id: "SUB-BLANKET-DUVET", parentId: "CAT-ACCESSORIES", parentSlug: "accessories", name: "Blanket / Duvet", slug: "blanket-duvet", aliases: ["blanket-duvet", "blanket / duvet"], active: true, order: 6 },
      { id: "SUB-TRAVEL-BED", parentId: "CAT-ACCESSORIES", parentSlug: "accessories", name: "Travel Bed", slug: "travel-bed", aliases: ["travel-bed", "travel bed"], active: true, order: 7 }
    ]
  },
  {
    id: "CAT-BED-FRAMES",
    name: "Bed Frames",
    slug: "bed-frames",
    image: "/assets/categories/bed-frames.jpg",
    description: "Bed frames designed for stylish and supportive sleep spaces.",
    type: "main",
    active: true,
    showInNavigation: true,
    order: 3,
    subcategories: [
      { id: "SUB-WOODEN-BED-FRAME", parentId: "CAT-BED-FRAMES", parentSlug: "bed-frames", name: "Wooden Bed Frame", slug: "wooden-bed-frame", aliases: ["wooden-bed-frame", "wooden bed frame", "haven-bed-frame", "luxe-timber-frame", "ortho-support-frame", "teak", "timber", "wooden"], active: true, order: 1 },
      { id: "SUB-PLATFORM-BED", parentId: "CAT-BED-FRAMES", parentSlug: "bed-frames", name: "Platform Bed", slug: "platform-bed", aliases: ["platform-bed", "platform bed", "craft-platform-bed", "minimal-platform-bed", "platform"], active: true, order: 2 }
    ]
  }
];

export function ensureRequiredCategories(existing = []) {
  // Slugs/IDs that must NEVER appear as top-level main categories
  const obsoleteMainSlugs = ["pillows", "cat-pillows", "protectors", "cat-protectors"];
  // Remove any old top-level "bed-frames" that was a subcategory alias, but keep CAT-BED-FRAMES
  const obsoleteMainIds = ["cat-bed-frames-old"];

  let tree = [];
  if (Array.isArray(existing) && existing.length > 0) {
    tree = JSON.parse(JSON.stringify(existing)).filter((c) => {
      const normId = (c.id || "").toLowerCase();
      const normSlug = (c.slug || "").toLowerCase();
      const normName = (c.name || "").toLowerCase();
      // Filter out old bad entries (but allow CAT-BED-FRAMES which is the canonical new entry)
      if (normId === "cat-bed-frames" || normSlug === "bed-frames") {
        // Keep only if it is a proper main category (has subcategories or isParent)
        return c.isParent === true || c.type === "main" || Array.isArray(c.subcategories);
      }
      return (
        !obsoleteMainSlugs.includes(normId) &&
        !obsoleteMainSlugs.includes(normSlug) &&
        !obsoleteMainSlugs.includes(normName) &&
        !obsoleteMainIds.includes(normId)
      );
    });

    // Strip "bed-frames" from any persisted Accessories subcategory list
    tree.forEach((mainCat) => {
      if ((mainCat.id === "CAT-ACCESSORIES" || mainCat.slug === "accessories") && Array.isArray(mainCat.subcategories)) {
        mainCat.subcategories = mainCat.subcategories.filter((s) => {
          const sId = (s.id || "").toLowerCase();
          const sSlug = (s.slug || "").toLowerCase();
          // Remove bed-frames sub that was previously nested under accessories
          return sId !== "sub-bed-frames" && sSlug !== "bed-frames";
        });
      }
    });
  }

  DEFAULT_CATEGORIES_TREE.forEach((defMain) => {
    let mainMatch = tree.find(
      (c) => c.id === defMain.id || c.slug === defMain.slug || (c.name && c.name.toLowerCase() === defMain.name.toLowerCase())
    );
    if (!mainMatch) {
      tree.push(JSON.parse(JSON.stringify(defMain)));
    } else {
      // Ensure required fields are present on existing match
      if (mainMatch.showInNavigation === undefined) mainMatch.showInNavigation = defMain.showInNavigation;
      if (!Array.isArray(mainMatch.subcategories)) {
        mainMatch.subcategories = [];
      }
      defMain.subcategories.forEach((defSub) => {
        const subExists = mainMatch.subcategories.some(
          (s) => s.id === defSub.id || s.slug === defSub.slug || (s.name && s.name.toLowerCase() === defSub.name.toLowerCase())
        );
        if (!subExists) {
          mainMatch.subcategories.push(JSON.parse(JSON.stringify(defSub)));
        }
      });
    }
  });

  // Sort main categories by order
  tree.sort((a, b) => (a.order || 99) - (b.order || 99));

  return tree;
}

export function isProductInMainCategory(product, mainCatIdOrSlug, categoriesList = DEFAULT_CATEGORIES_TREE) {
  if (!product || !mainCatIdOrSlug) return false;
  const targetNorm = normalizeProductId(mainCatIdOrSlug);

  const prodParent = normalizeProductId(product.mainCategoryId || product.parentCategory || product.parentCategoryId);
  const prodCat = normalizeProductId(product.category || product.categoryId);

  if (prodParent && prodParent === targetNorm) return true;
  if (prodCat && prodCat === targetNorm) return true;

  const mainCat = (categoriesList || DEFAULT_CATEGORIES_TREE).find(
    (c) => normalizeProductId(c.id) === targetNorm || normalizeProductId(c.slug) === targetNorm || normalizeProductId(c.name) === targetNorm
  );

  if (!mainCat) return false;

  const subSlugs = (mainCat.subcategories || []).map((s) => normalizeProductId(s.slug || s.id || s.name));
  const prodSub = normalizeProductId(product.subCategoryId || product.subCategory || product.subcategory || product.category);

  return subSlugs.includes(prodSub) || subSlugs.includes(prodCat);
}

export function isProductInSubcategory(product, subCatIdOrSlug, categoriesList = DEFAULT_CATEGORIES_TREE) {
  if (!product || !subCatIdOrSlug) return false;
  const targetNorm = normalizeProductId(subCatIdOrSlug);

  const prodSubId = normalizeProductId(product.subCategoryId || product.subcategoryId);
  const prodSub = normalizeProductId(product.subCategory || product.subcategory || product.category);

  if (prodSubId && prodSubId === targetNorm) return true;
  if (prodSub && prodSub === targetNorm) return true;

  for (const mainCat of (categoriesList || DEFAULT_CATEGORIES_TREE)) {
    for (const sub of (mainCat.subcategories || [])) {
      const sId = normalizeProductId(sub.id);
      const sSlug = normalizeProductId(sub.slug);
      const sName = normalizeProductId(sub.name);
      const aliases = (sub.aliases || []).map(normalizeProductId);

      if (sId === targetNorm || sSlug === targetNorm || sName === targetNorm || aliases.includes(targetNorm)) {
        if (prodSubId && (prodSubId === sId || prodSubId === sSlug)) return true;
        if (prodSub && (prodSub === sId || prodSub === sSlug || prodSub === sName || aliases.includes(prodSub))) return true;
      }
    }
  }

  return false;
}



export function getMainCategoryProductCount(mainCategory, productsList = [], categoriesList = DEFAULT_CATEGORIES_TREE) {
  if (!mainCategory || !Array.isArray(productsList)) return 0;
  return productsList.filter((p) => isProductInMainCategory(p, mainCategory.id || mainCategory.slug, categoriesList)).length;
}

export function getSubcategoryProductCount(subcategory, productsList = [], categoriesList = DEFAULT_CATEGORIES_TREE) {
  if (!subcategory || !Array.isArray(productsList)) return 0;
  return productsList.filter((p) => isProductInSubcategory(p, subcategory.id || subcategory.slug, categoriesList)).length;
}

/**
 * Authoritative helper returning dynamic category hierarchy with live product counts.
 * Synchronized across Admin Products, Content Management modals, and Storefront routing.
 */
export function getCatalogCategoryTree(productsList = [], categoriesList = DEFAULT_CATEGORIES_TREE) {
  const cats = ensureRequiredCategories(categoriesList || DEFAULT_CATEGORIES_TREE);
  const activeProducts = Array.isArray(productsList)
    ? productsList.filter((p) => p && !isProductDeleted(p.id || p.Product_Id || p.slug) && (p.status ? p.status === "Active" : true))
    : [];

  const totalCount = activeProducts.length;

  const tree = cats.map((mainCat) => {
    const mainCount = getMainCategoryProductCount(mainCat, activeProducts, cats);
    const subcategories = (mainCat.subcategories || []).map((sub) => {
      const subCount = getSubcategoryProductCount(sub, activeProducts, cats);
      return {
        id: sub.id,
        name: sub.name,
        slug: sub.slug || sub.id,
        count: subCount,
        active: sub.active !== false,
      };
    });

    return {
      id: mainCat.id,
      name: mainCat.name,
      slug: mainCat.slug || mainCat.id,
      count: mainCount,
      order: mainCat.order || 99,
      active: mainCat.active !== false,
      subcategories,
    };
  });

  return {
    totalCount,
    tree,
  };
}

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
 * Retrieves bed frame category metadata for a given slug
 */
export function getBedFrameCategoryMeta(categorySlug) {
  if (!categorySlug || categorySlug === "all" || categorySlug === "All") return null;
  const normalized = String(categorySlug).trim().toLowerCase();
  return BED_FRAME_CATEGORIES[normalized] || null;
}

/**
 * Returns the canonical storefront URL for any main category.
 * Known categories get friendly routes; future admin-created categories use /category/{slug}.
 */
export function getMainCategoryUrl(categorySlugOrId) {
  if (!categorySlugOrId) return "/";
  const slug = String(categorySlugOrId).trim().toLowerCase()
    .replace(/^cat-/, "")
    .replace(/[^a-z0-9-]/g, "-");
  if (slug === "mattresses" || slug === "mattress") return "/mattresses";
  if (slug === "accessories" || slug === "accessory") return "/accessories";
  if (slug === "bed-frames" || slug === "bedframes" || slug === "bed-frame") return "/bed-frames";
  return `/category/${slug}`;
}

/**
 * Returns the canonical storefront URL for any subcategory.
 * Known main categories get friendly sub-routes; future categories use /category/{main}/{sub}.
 */
export function getSubcategoryUrl(mainCatSlug, subCatSlug) {
  const main = String(mainCatSlug || "").trim().toLowerCase()
    .replace(/^cat-/, "").replace(/[^a-z0-9-]/g, "-");
  const sub = String(subCatSlug || "").trim().toLowerCase()
    .replace(/^sub-/, "").replace(/[^a-z0-9-]/g, "-");
  if (!sub) return getMainCategoryUrl(main);
  if (main === "mattresses" || main === "mattress") return `/mattresses/${sub}`;
  if (main === "accessories" || main === "accessory") return `/accessories/${sub}`;
  if (main === "bed-frames" || main === "bedframes") return `/bed-frames/${sub}`;
  return `/category/${main}/${sub}`;
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
 * Normalizes any product ID/slug/name for flexible, robust matching.
 * e.g., "PROD-FOAMCLOUD", "foamcloud", "foam-cloud", "Foam Cloud", "foam_cloud" -> "foamcloud"
 */
export function normalizeProductId(str) {
  if (!str) return "";
  let clean = String(str).trim();
  try {
    clean = decodeURIComponent(clean).trim();
  } catch (e) {}

  return clean
    .toLowerCase()
    .replace(/^prod[-_]/i, "") // strip leading PROD- or prod_
    .replace(/[^a-z0-9]/g, ""); // strip all non-alphanumeric characters (hyphens, spaces, underscores)
}

/**
 * Resolves a product from any collection by id, slug, Product_Id, or name flexibly
 */
export function getProductByIdentifier(identifier, productsList = []) {
  if (!identifier || !Array.isArray(productsList) || productsList.length === 0) return null;

  const rawTarget = String(identifier).trim();
  let decodedTarget = rawTarget;
  try {
    decodedTarget = decodeURIComponent(rawTarget).trim();
  } catch (e) {}

  const targetLower = decodedTarget.toLowerCase();
  const targetNorm = normalizeProductId(decodedTarget);

  // 1. Direct exact match (id, slug, Product_Id)
  let found = productsList.find((product) => {
    if (!product) return false;
    const id = String(product.id || "").trim();
    const slug = String(product.slug || "").trim();
    const prodId = String(product.Product_Id || "").trim();
    return id === rawTarget || slug === rawTarget || prodId === rawTarget;
  });

  // 2. Case-insensitive exact match
  if (!found) {
    found = productsList.find((product) => {
      if (!product) return false;
      const id = String(product.id || "").trim().toLowerCase();
      const slug = String(product.slug || "").trim().toLowerCase();
      const prodId = String(product.Product_Id || "").trim().toLowerCase();
      return id === targetLower || slug === targetLower || prodId === targetLower;
    });
  }

  // 3. Fully normalized match (stripping hyphens, PROD-, spaces, non-alphanumerics)
  if (!found && targetNorm) {
    found = productsList.find((product) => {
      if (!product) return false;
      const normId = normalizeProductId(product.id);
      const normSlug = normalizeProductId(product.slug);
      const normProdId = normalizeProductId(product.Product_Id);
      const normName = normalizeProductId(product.name || product.Product_Name);
      return (
        normId === targetNorm ||
        normSlug === targetNorm ||
        normProdId === targetNorm ||
        normName === targetNorm
      );
    });
  }

  // 4. Category / subcategory fallback match (e.g., memory-foam-pillow, latex-pillow, foam, ortho)
  if (!found && targetNorm) {
    found = productsList.find((product) => {
      if (!product) return false;
      const normCat = normalizeProductId(product.category);
      const normSubCat = normalizeProductId(product.subCategory || product.subcategory);
      const normCatName = normalizeProductId(product.categoryName || product.categoryLabel);
      return normCat === targetNorm || normSubCat === targetNorm || normCatName === targetNorm;
    });
  }

  return found || null;
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
 * Helper to check if a product is a Bed Frame product.
 */
export function isBedFrameProduct(product) {
  if (!product) return false;
  const parentCat = normalizeCategoryKey(product.parentCategory || product.parentCategoryId || product.mainCategoryId);
  const cat = normalizeCategoryKey(product.category || product.categoryId);
  const subCat = normalizeCategoryKey(product.subCategory || product.subcategory || product.subcategoryId);

  if (parentCat === "bed-frames" || parentCat === "cat-bed-frames") return true;
  if (cat === "bed-frames" || cat === "cat-bed-frames") return true;

  const bedFrameSubcategories = [
    "wooden-bed-frame", "platform-bed",
    "wooden bed frame", "platform bed",
    "bed-frame", "bedframe"
  ];
  return bedFrameSubcategories.includes(cat) || bedFrameSubcategories.includes(subCat);
}

/**
 * Helper to check if a product is an accessory (excludes Bed Frames).
 */
export function isAccessoryProduct(product) {
  if (!product) return false;
  // Bed frames are NOT accessories — they have their own main category
  if (isBedFrameProduct(product)) return false;

  const parentCat = normalizeCategoryKey(product.parentCategory || product.parentCategoryId || product.mainCategoryId);
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
 * Returns parent group key: "mattresses", "accessories", or "bed-frames".
 */
export function getProductGroupKey(product) {
  if (!product) return "mattresses";
  if (isBedFrameProduct(product)) return "bed-frames";
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
    if (BED_FRAME_CATEGORIES[subKey]) {
      return BED_FRAME_CATEGORIES[subKey].name;
    }
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
 * Universal predicate checking if a product belongs to a group/category key or ID.
 */
export function isProductInCategory(product, categoryKey, categoriesList = DEFAULT_CATEGORIES_TREE) {
  if (!product || !categoryKey) return false;
  const targetKey = normalizeCategoryKey(categoryKey);
  if (targetKey === "all" || targetKey === "all-categories" || targetKey === "all-products") return true;

  if (
    targetKey === "mattresses" ||
    targetKey === "mattress" ||
    targetKey === "all-mattresses" ||
    targetKey === "cat-mattresses"
  ) {
    return getProductGroupKey(product) === "mattresses";
  }
  if (
    targetKey === "accessories" ||
    targetKey === "accessory" ||
    targetKey === "all-accessories" ||
    targetKey === "cat-accessories"
  ) {
    return getProductGroupKey(product) === "accessories";
  }
  if (
    targetKey === "bed-frames" ||
    targetKey === "bedframes" ||
    targetKey === "bedframe" ||
    targetKey === "all-bed-frames" ||
    targetKey === "cat-bed-frames"
  ) {
    return getProductGroupKey(product) === "bed-frames";
  }

  const subKey = getProductCategoryKey(product);
  const catKey = normalizeCategoryKey(product.category || product.categoryId);
  const catNameKey = normalizeCategoryKey(product.categoryName || product.categoryLabel);
  const prodSubId = normalizeCategoryKey(product.subcategoryId || product.subCategoryId);
  const prodParentId = normalizeCategoryKey(product.mainCategoryId || product.parentCategory || product.parentCategoryId);

  if (
    subKey === targetKey ||
    catKey === targetKey ||
    catNameKey === targetKey ||
    prodSubId === targetKey ||
    prodParentId === targetKey
  ) {
    return true;
  }

  return isProductInMainCategory(product, categoryKey, categoriesList) || isProductInSubcategory(product, categoryKey, categoriesList);
}

/**
 * Generic group filter function (e.g. "mattresses", "accessories", "bed-frames").
 */
export function getProductsByGroup(products, groupKey) {
  if (!Array.isArray(products)) return [];
  const normGroup = normalizeCategoryKey(groupKey);
  if (normGroup === "all" || normGroup === "all-categories" || normGroup === "all-products") {
    return products;
  }
  // Resolve the canonical group key for bed-frames aliases
  const resolvedGroup = (normGroup === "bedframes" || normGroup === "bedframe" || normGroup === "bed-frames") ? "bed-frames" : normGroup;
  return products.filter((p) => getProductGroupKey(p) === resolvedGroup);
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

/**
 * Resolves the canonical fallback listing URL for any product based on its category group.
 */
export function getProductCategoryFallback(product) {
  if (!product) return "/mattresses";
  if (isBedFrameProduct(product)) return "/bed-frames";
  if (isAccessoryProduct(product)) return "/accessories";
  return "/mattresses";
}
