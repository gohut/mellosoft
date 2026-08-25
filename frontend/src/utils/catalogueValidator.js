/**
 * Mellosoft Catalogue Audit & Validation Utility
 */

export function validateCatalogue(products = [], categories = []) {
  const report = {
    totalProducts: products.length,
    duplicateProductIds: 0,
    duplicateSlugs: 0,
    missingCategories: 0,
    missingSubcategories: 0,
    missingImages: 0,
    brokenImagePaths: 0,
    blobUrlsPersisted: 0,
    windowsAbsolutePaths: 0,
    missingPrices: 0,
    invalidPrices: 0,
    brokenCategoryMappings: 0,
    countsByCategory: {
      mattresses: 0,
      accessories: 0,
      foam: 0,
      ortho: 0,
      spring: 0,
      latex: 0,
      "memory-foam": 0,
      "memory-foam-pillow": 0,
      "latex-pillow": 0,
      "fiber-pillow": 0,
      "mattress-protector": 0,
      "fitted-bedspread": 0,
      "blanket-duvet": 0,
      "travel-bed": 0
    }
  };

  const seenIds = new Set();
  const seenSlugs = new Set();

  products.forEach((p) => {
    if (!p) return;

    // Check Duplicate ID
    const pid = p.id || p.Product_Id;
    if (!pid || seenIds.has(pid)) {
      report.duplicateProductIds++;
    } else {
      seenIds.add(pid);
    }

    // Check Duplicate Slug
    const pSlug = p.slug || p.id;
    if (pSlug) {
      if (seenSlugs.has(pSlug)) report.duplicateSlugs++;
      else seenSlugs.add(pSlug);
    }

    // Check Category & Subcategory
    const cat = (p.category || "").toLowerCase();
    const subCat = (p.subCategory || "").toLowerCase();

    if (!cat) report.missingCategories++;
    if (!subCat && cat === "accessories") report.missingSubcategories++;

    // Category Counts
    if (cat === "accessories") {
      report.countsByCategory.accessories++;
    } else {
      report.countsByCategory.mattresses++;
    }

    const effectiveSub = subCat || cat;
    if (report.countsByCategory[effectiveSub] !== undefined) {
      report.countsByCategory[effectiveSub]++;
    }

    // Check Images & Image Paths
    const img = p.images?.[0] || p.image || p.imageUrl || p.thumbnail;
    if (!img || typeof img !== "string" || img.trim() === "") {
      report.missingImages++;
    } else {
      const lowerImg = img.toLowerCase();
      if (lowerImg.startsWith("blob:")) {
        report.blobUrlsPersisted++;
        report.brokenImagePaths++;
      }
      if (lowerImg.includes(":\\") || lowerImg.includes(":/") || lowerImg.startsWith("c:")) {
        report.windowsAbsolutePaths++;
        report.brokenImagePaths++;
      }
    }

    // Check Pricing
    const pPrice = p.startingPrice || p.price || p.Actual_Price;
    if (!pPrice || isNaN(pPrice) || pPrice <= 0) {
      report.missingPrices++;
    }
  });

  return report;
}
