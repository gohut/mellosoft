/**
 * Central Mellosoft Pricing Engine
 * 
 * Provides deterministic price generation for catalogue products missing client matrices,
 * preserving official client pricing (Haven, Cocoon, Bloom, Mist, Terra) and Admin overrides.
 * 
 * Pricing Sources:
 * - "client": Official original client mattress matrices (Haven, Cocoon, Bloom, Mist, Terra)
 * - "generated": System-calculated default matrix based on area, category rate, thickness & construction
 * - "admin": Explicit Admin pricing overrides from MatrixPricingManager
 */

import { STANDARD_SIZES } from "../data/mattressData.js";

export const CLIENT_PRICED_PRODUCTS = new Set(["haven", "cocoon", "bloom", "mist", "terra"]);

export const CATEGORY_BASE_RATES = {
  foam: 0.026,
  ortho: 0.036,
  spring: 0.046,
  "memory-foam": 0.056,
  latex: 0.066
};

export const THICKNESS_MULTIPLIERS = {
  "4 inch": 1.0,
  "5 inch": 1.22,
  "6 inch": 1.45,
  "8 inch": 1.90,
  "10 inch": 2.40
};

export function getConstructionMultiplier(construction = "") {
  const c = String(construction).toUpperCase();
  if (c.includes("PURE FULL LATEX") || c.includes("ADVANCED POCKET SPRING") || c.includes("CELESTIAL") || c.includes("SOVEREIGN")) return 1.50;
  if (c.includes("NATURAL LATEX") || c.includes("POCKET SPRING") || c.includes("PREMIUM MEMORY") || c.includes("LATEX + ORTHO") || c.includes("LATEX + HR")) return 1.35;
  if (c.includes("MEMORY") || c.includes("SS + HR") || c.includes("SS + ORTHO") || c.includes("HYBRID")) return 1.25;
  if (c.includes("HR") || c.includes("BONNELL SPRING") || c.includes("HIGH DENSITY") || c.includes("ORTHO")) return 1.15;
  return 1.00;
}

export function roundToNearest50(val) {
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) return 500;
  return Math.max(500, Math.round(num / 50) * 50);
}

export function parseDimensionArea(dimStr) {
  if (!dimStr || typeof dimStr !== "string") return 2160;
  const parts = dimStr.toLowerCase().split("x").map((p) => parseFloat(p.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] > 0 && parts[1] > 0) {
    return parts[0] * parts[1];
  }
  return 2160;
}

export const ALL_MATTRESS_DIMENSIONS = [
  ...(STANDARD_SIZES.Single || []),
  ...(STANDARD_SIZES.Double || []),
  ...(STANDARD_SIZES.Queen || []),
  ...(STANDARD_SIZES.King || [])
];

/**
 * Generates a complete deterministic price matrix for a mattress product.
 */
export function generateMattressPriceMatrix(product) {
  if (!product) return {};

  const categoryKey = (product.category || "foam").toLowerCase();
  const baseRate = CATEGORY_BASE_RATES[categoryKey] || CATEGORY_BASE_RATES.foam;
  const constructionMult = getConstructionMultiplier(product.construction);
  const thicknessList = product.thicknessOptions && product.thicknessOptions.length > 0
    ? product.thicknessOptions
    : ["4 inch", "5 inch", "6 inch"];

  const matrix = {};

  thicknessList.forEach((thickness) => {
    const thickMult = THICKNESS_MULTIPLIERS[thickness] || 1.2;
    matrix[thickness] = {};

    ALL_MATTRESS_DIMENSIONS.forEach((dim) => {
      const area = parseDimensionArea(dim);
      // Formula: area * baseRate * thickMult * constructionMult * scaleFactor
      const rawPrice = area * baseRate * thickMult * constructionMult * 85.0;
      matrix[thickness][dim] = roundToNearest50(rawPrice);
    });
  });

  return matrix;
}

/**
/**
 * Generates deterministic pricing for accessory products.
 */
export function generateAccessoryPricing(product) {
  if (!product) return { prices: {}, sizePrices: {}, startingPrice: 499 };

  const cat = String(product.category || product.subCategory || "").toLowerCase();
  const idStr = String(product.id || "").toLowerCase();
  const nameStr = String(product.name || "").toLowerCase();
  const typeStr = String(product.type || "").toLowerCase();

  let prices = {};
  let sizePrices = {};

  // Preserve existing numeric prices if provided (e.g. from Admin or pre-set)
  if (product.prices && typeof product.prices === "object" && Object.keys(product.prices).length > 0) {
    const hasNumeric = Object.values(product.prices).some((v) => (typeof v === "number" && v > 0) || (v && typeof v === "object"));
    if (hasNumeric) prices = { ...product.prices };
  }
  if (product.sizePrices && typeof product.sizePrices === "object" && Object.keys(product.sizePrices).length > 0) {
    const hasNumeric = Object.values(product.sizePrices).some((v) => typeof v === "number" && v > 0);
    if (hasNumeric) sizePrices = { ...product.sizePrices };
  }

  // Generate category-specific pricing if not already populated
  if (Object.keys(prices).length === 0 && Object.keys(sizePrices).length === 0) {
    if (cat.includes("memory-foam-pillow") || idStr.includes("memory") || nameStr.includes("memory")) {
      prices = { "Contour": 1450, "Soap": 1250 };
    } else if (cat.includes("latex-pillow") || idStr.includes("latex") || nameStr.includes("latex")) {
      prices = { "Contour": 1850, "Soap": 1650 };
    } else if (cat.includes("fiber-pillow") || idStr.includes("fiber") || nameStr.includes("fiber")) {
      prices = { "Small": 550, "Big": 750 };
    } else if (cat.includes("mattress-protector") || cat.includes("protector") || idStr.includes("protector") || nameStr.includes("shield") || nameStr.includes("guard") || nameStr.includes("protector")) {
      sizePrices = { "78 x 36": 850, "78 x 48": 1150, "78 x 60": 1450, "78 x 72": 1750 };
    } else if (cat.includes("fitted-bedspread") || cat.includes("bedspread") || idStr.includes("fit") || nameStr.includes("fit") || nameStr.includes("bedspread")) {
      sizePrices = { "75 x 36": 950, "75 x 48": 1250, "78 x 60": 1550, "78 x 72": 1850 };
    } else if (cat.includes("blanket-duvet") || cat.includes("duvet") || idStr.includes("duvet") || nameStr.includes("duvet") || nameStr.includes("blanket")) {
      sizePrices = { "90 x 60": 1950, "100 x 90": 2950 };
    } else if (cat.includes("travel-bed") || cat.includes("travel") || idStr.includes("travel") || idStr.includes("fold") || nameStr.includes("travel") || nameStr.includes("bed")) {
      prices = {
        "Quilt": { "72 x 30": 2250, "72 x 36": 2550, "72 x 48": 2950 },
        "Folding Bed": { "72 x 30": 3450, "72 x 36": 3850, "72 x 48": 4450 }
      };
    } else {
      prices = { "Standard": 990 };
    }

    // Apply quality multipliers based on name/type
    let qualityMultiplier = 1.0;
    if (typeStr.includes("luxury") || nameStr.includes("sovereign") || nameStr.includes("royal") || nameStr.includes("celestial") || typeStr.includes("sovereign") || typeStr.includes("royal")) {
      qualityMultiplier = 1.35;
    } else if (typeStr.includes("premium") || nameStr.includes("plush") || nameStr.includes("hotel") || nameStr.includes("luxe") || typeStr.includes("luxe")) {
      qualityMultiplier = 1.20;
    } else if (nameStr.includes("cool") || nameStr.includes("aero") || nameStr.includes("breeze") || nameStr.includes("aqua")) {
      qualityMultiplier = 1.10;
    }

    if (qualityMultiplier !== 1.0) {
      Object.keys(prices).forEach((k) => {
        if (typeof prices[k] === "number") {
          prices[k] = roundToNearest50(prices[k] * qualityMultiplier);
        } else if (prices[k] && typeof prices[k] === "object") {
          Object.keys(prices[k]).forEach((subK) => {
            prices[k][subK] = roundToNearest50(prices[k][subK] * qualityMultiplier);
          });
        }
      });

      Object.keys(sizePrices).forEach((k) => {
        if (typeof sizePrices[k] === "number") {
          sizePrices[k] = roundToNearest50(sizePrices[k] * qualityMultiplier);
        }
      });
    }
  }

  // Flatten all numeric prices to compute startingPrice
  const allVals = [];
  const extractNumeric = (val) => {
    if (typeof val === "number" && val > 0) allVals.push(val);
    else if (val && typeof val === "object") {
      Object.values(val).forEach(extractNumeric);
    }
  };

  Object.values(prices).forEach(extractNumeric);
  Object.values(sizePrices).forEach(extractNumeric);

  const minVal = allVals.length > 0 ? Math.min(...allVals) : (product.startingPrice || 499);

  return { prices, sizePrices, startingPrice: minVal };
}

/**
 * Enforces valid pricing on a product object.
 * Preserves original client pricing (Haven, Cocoon, Bloom, Mist, Terra) and explicit Admin overrides.
 */
export function ensureProductPricing(product) {
  if (!product) return product;

  // 1. Check if product is an official client mattress
  if (CLIENT_PRICED_PRODUCTS.has(product.id) && product.prices && Object.keys(product.prices).length > 0) {
    const validPrices = [];
    Object.values(product.prices).forEach((tPrices) => {
      if (tPrices && typeof tPrices === "object") {
        Object.values(tPrices).forEach((p) => {
          const val = Number(p);
          if (Number.isFinite(val) && val > 0) validPrices.push(val);
        });
      }
    });

    const minP = validPrices.length > 0 ? Math.min(...validPrices) : product.startingPrice;
    return {
      ...product,
      startingPrice: minP,
      price: minP,
      Actual_Price: minP,
      discountPrice: minP,
      Discounted_Price: minP,
      pricingSource: "client"
    };
  }

  // 2. Check if product already has explicit matrix pricing from Admin
  if (product.prices && Object.keys(product.prices).length > 0) {
    const validPrices = [];
    const extractPrices = (obj) => {
      if (!obj || typeof obj !== "object") return;
      Object.values(obj).forEach((val) => {
        if (typeof val === "number" && val > 0) validPrices.push(val);
        else if (val && typeof val === "object") extractPrices(val);
      });
    };
    extractPrices(product.prices);

    if (validPrices.length > 0) {
      const minP = Math.min(...validPrices);
      return {
        ...product,
        startingPrice: minP,
        price: minP,
        Actual_Price: minP,
        discountPrice: minP,
        Discounted_Price: minP,
        pricingSource: product.pricingSource || "admin"
      };
    }
  }

  // 3. Category check for accessory vs mattress
  const ACCESSORY_CATEGORY_SLUGS = new Set([
    "accessories",
    "memory-foam-pillow",
    "latex-pillow",
    "fiber-pillow",
    "mattress-protector",
    "fitted-bedspread",
    "blanket-duvet",
    "travel-bed"
  ]);

  const catSlug = String(product.category || product.subCategory || "").toLowerCase();
  const isAccessory = ACCESSORY_CATEGORY_SLUGS.has(catSlug) || catSlug.includes("pillow") || catSlug.includes("protector") || catSlug.includes("bedspread") || catSlug.includes("duvet") || catSlug.includes("travel");

  if (!isAccessory) {
    const generatedMatrix = generateMattressPriceMatrix(product);
    const validPrices = [];
    Object.values(generatedMatrix).forEach((tPrices) => {
      Object.values(tPrices).forEach((p) => {
        if (typeof p === "number" && p > 0) validPrices.push(p);
      });
    });

    const minP = validPrices.length > 0 ? Math.min(...validPrices) : 10800;
    return {
      ...product,
      prices: generatedMatrix,
      startingPrice: minP,
      price: minP,
      Actual_Price: minP,
      discountPrice: minP,
      Discounted_Price: minP,
      pricingSource: product.pricingSource || "generated"
    };
  }

  // 4. Generate pricing for accessories
  const { prices: accPrices, sizePrices: accSizePrices, startingPrice: accMin } = generateAccessoryPricing(product);
  return {
    ...product,
    prices: Object.keys(accPrices).length > 0 ? accPrices : (product.prices || {}),
    sizePrices: Object.keys(accSizePrices).length > 0 ? accSizePrices : (product.sizePrices || {}),
    startingPrice: accMin,
    price: accMin,
    Actual_Price: accMin,
    discountPrice: accMin,
    Discounted_Price: accMin,
    pricingSource: product.pricingSource || "generated"
  };
}
