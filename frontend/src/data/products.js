import { MATTRESS_PRODUCTS, ACCESSORY_PRODUCTS, ACCESSORIES_CATEGORIES, BED_FRAME_PRODUCTS } from "./mattressData";
import { ensureProductPricing } from "../utils/pricingEngine";
import { getProductCategoryLabel } from "../utils/productHelpers";

// Helper to convert MATTRESS_PRODUCTS to full MOCK_PRODUCTS format
const mattressProductsFormatted = MATTRESS_PRODUCTS.map((rawProd) => {
  const prod = ensureProductPricing(rawProd);
  const minP = prod.startingPrice || 10800;
  const subCat = prod.category;
  const catLabel = getProductCategoryLabel({ parentCategory: "mattresses", subCategory: subCat, category: subCat });

  return {
    ...prod,
    category: subCat,
    parentCategory: "mattresses",
    parentCategoryId: "mattresses",
    subCategory: subCat,
    subcategory: subCat,
    subcategoryId: subCat,
    categoryName: catLabel,
    categoryLabel: catLabel,
    Product_Id: `PROD-${prod.id.toUpperCase().replace(/-/g, "")}`,
    Product_Name: prod.name,
    price: minP,
    Actual_Price: minP,
    discountPercent: 0,
    discountPrice: minP,
    Discounted_Price: minP,
    rating: 4.8,
    reviewCount: 42,
    badge: catLabel,
    specs: `${prod.construction || "Premium Construction"} • ${(prod.thicknessOptions || ["Standard"]).join(" / ")} Thickness`,
    features: [
      `Construction: ${prod.construction || "Standard"}`,
      `Available Thickness: ${(prod.thicknessOptions || ["Standard"]).join(" & ")}`,
      `Layer Details: ${Object.entries(prod.layers || {}).map(([t, l]) => `${t}: ${l}`).join(" | ") || "Multi-layer comfort design"}`,
      "100-Night Sleep Trial & Direct Manufacturer Warranty"
    ],
    isNewArrival: prod.isNewArrival ?? false,
    newArrivalOrder: prod.newArrivalOrder ?? 999,
    firmnessOptions: prod.thicknessOptions,
    sizeOptions: ["Single", "Double", "Queen", "King"],
    sizePrices: prod.sizePrices || {},
    reviews: [
      {
        id: `r-${prod.id}-1`,
        author: "Ananya S.",
        rating: 5,
        date: "3 days ago",
        content: `Extremely satisfied with our new ${prod.name} mattress! Perfect balance of support and pressure relief.`,
        helpfulCount: 14,
        replyCount: 0
      },
      {
        id: `r-${prod.id}-2`,
        author: "Rajesh M.",
        rating: 5,
        date: "1 week ago",
        content: `Great quality materials and speedy delivery. ${prod.tagline} is 100% accurate.`,
        helpfulCount: 9,
        replyCount: 0
      }
    ]
  };
});

// Helper to convert ACCESSORY_PRODUCTS to full format
const accessoryProductsFormatted = (ACCESSORY_PRODUCTS || []).map((rawAcc) => {
  const acc = ensureProductPricing(rawAcc);
  const minP = acc.startingPrice || 499;
  const subCat = acc.category;
  const catLabel = getProductCategoryLabel({ parentCategory: "accessories", subCategory: subCat, category: subCat });

  return {
    ...acc,
    isNewArrival: acc.isNewArrival ?? false,
    newArrivalOrder: acc.newArrivalOrder ?? 999,
    category: "accessories",
    parentCategory: "accessories",
    parentCategoryId: "accessories",
    subCategory: subCat,
    subcategory: subCat,
    subcategoryId: subCat,
    categoryName: catLabel,
    categoryLabel: catLabel,
    Product_Id: `PROD-${acc.id.toUpperCase().replace(/-/g, "")}`,
    Product_Name: acc.name,
    price: minP,
    Actual_Price: minP,
    discountPercent: 0,
    discountPrice: minP,
    Discounted_Price: minP,
    rating: 4.8,
    reviewCount: 28,
    badge: catLabel,
    specs: `${acc.type || "Accessory"} ${acc.firmness ? `• ${acc.firmness}` : ""} ${acc.material ? `• ${acc.material}` : ""}`,
    features: [
      `Type: ${acc.type || "Accessory"}`,
      acc.firmness ? `Firmness: ${acc.firmness}` : "Premium Comfort Feel",
      acc.material ? `Material: ${acc.material}` : "Certified Sleep Grade Material",
      "Official Manufacturer Warranty & Easy Returns"
    ],
    firmnessOptions: acc.firmness ? [acc.firmness] : ["Standard"],
    sizeOptions: acc.sizes || ["Standard"],
    sizePrices: acc.sizePrices || {}
  };
});

// Helper to convert BED_FRAME_PRODUCTS to full format
const bedFrameProductsFormatted = (BED_FRAME_PRODUCTS || []).map((rawFrame) => {
  const frame = ensureProductPricing(rawFrame);
  const minP = frame.startingPrice || 14999;
  const subCat = frame.category || frame.subCategory || "wooden-bed-frame";
  const catLabel = frame.categoryName || frame.categoryLabel || "Wooden Bed Frame";

  return {
    ...frame,
    isNewArrival: frame.isNewArrival ?? false,
    newArrivalOrder: frame.newArrivalOrder ?? 999,
    // Preserve the bed-frame specific category fields — do NOT remap to "accessories"
    category: subCat,
    parentCategory: "bed-frames",
    parentCategoryId: "CAT-BED-FRAMES",
    mainCategoryId: "CAT-BED-FRAMES",
    subCategory: subCat,
    subcategory: subCat,
    subcategoryId: frame.subcategoryId || subCat,
    categoryName: catLabel,
    categoryLabel: catLabel,
    Product_Id: `PROD-${frame.id.toUpperCase().replace(/-/g, "")}`,
    Product_Name: frame.name,
    price: minP,
    Actual_Price: minP,
    discountPercent: 0,
    discountPrice: minP,
    Discounted_Price: minP,
    rating: 4.8,
    reviewCount: 18,
    badge: catLabel,
    specs: `${frame.type || "Bed Frame"} ${frame.material ? `• ${frame.material}` : ""} • ${(frame.sizes || ["Queen", "King"]).join(" / ")}`,
    features: [
      `Type: ${frame.type || "Bed Frame"}`,
      frame.material ? `Material: ${frame.material}` : "Premium Solid Wood Construction",
      `Available Sizes: ${(frame.sizes || ["Queen", "King"]).join(", ")}`,
      "Official Manufacturer Warranty & Easy Returns"
    ],
    firmnessOptions: ["Standard"],
    sizeOptions: frame.sizes || ["Queen", "King"],
    sizePrices: frame.sizePrices || {}
  };
});

export const MOCK_PRODUCTS = [
  ...mattressProductsFormatted,
  ...accessoryProductsFormatted,
  ...bedFrameProductsFormatted
];

