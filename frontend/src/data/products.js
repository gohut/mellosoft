import { MATTRESS_PRODUCTS, ACCESSORY_PRODUCTS, ACCESSORIES_CATEGORIES } from "./mattressData";
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

export const MOCK_PRODUCTS = [
  ...mattressProductsFormatted,
  ...accessoryProductsFormatted
];
