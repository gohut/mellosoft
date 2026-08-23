import { MATTRESS_PRODUCTS, ACCESSORY_PRODUCTS, ACCESSORIES_CATEGORIES } from "./mattressData";

// Helper to convert MATTRESS_PRODUCTS to full MOCK_PRODUCTS format
const mattressProductsFormatted = MATTRESS_PRODUCTS.map((prod) => {
  return {
    ...prod,
    Product_Id: `PROD-${prod.id.toUpperCase()}`,
    Product_Name: prod.name,
    price: prod.startingPrice ?? 0,
    Actual_Price: prod.startingPrice ?? 0,
    discountPercent: 0,
    discountPrice: prod.startingPrice ?? 0,
    Discounted_Price: prod.startingPrice ?? 0,
    rating: 4.8,
    reviewCount: 42,
    badge: prod.categoryName,
    specs: `${prod.construction} • ${prod.thicknessOptions.join(" / ")} Thickness`,
    features: [
      `Construction: ${prod.construction}`,
      `Available Thickness: ${prod.thicknessOptions.join(" & ")}`,
      `Layer Details: ${Object.entries(prod.layers || {}).map(([t, l]) => `${t}: ${l}`).join(" | ")}`,
      "100-Night Sleep Trial & Direct Manufacturer Warranty"
    ],
    firmnessOptions: prod.thicknessOptions,
    sizeOptions: ["Single", "Double", "Queen", "King"],
    sizePrices: {},
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
const accessoryProductsFormatted = (ACCESSORY_PRODUCTS || []).map((acc) => {
  return {
    ...acc,
    category: "accessories",
    subCategory: acc.category,
    Product_Id: `ACC-${acc.id.toUpperCase()}`,
    Product_Name: acc.name,
    price: acc.startingPrice ?? 0,
    Actual_Price: acc.startingPrice ?? 0,
    discountPercent: 0,
    discountPrice: acc.startingPrice ?? 0,
    Discounted_Price: acc.startingPrice ?? 0,
    rating: 4.8,
    reviewCount: 28,
    badge: acc.categoryName || "Accessories",
    specs: `${acc.type || "Accessory"} ${acc.firmness ? `• ${acc.firmness}` : ""} ${acc.material ? `• ${acc.material}` : ""}`,
    features: [
      `Type: ${acc.type || "Accessory"}`,
      acc.firmness ? `Firmness: ${acc.firmness}` : "Premium Comfort Feel",
      acc.material ? `Material: ${acc.material}` : "Certified Sleep Grade Material",
      "Official Manufacturer Warranty & Easy Returns"
    ],
    firmnessOptions: acc.firmness ? [acc.firmness] : ["Standard"],
    sizeOptions: acc.sizes || ["Standard"],
    sizePrices: {}
  };
});

export const MOCK_PRODUCTS = [
  ...mattressProductsFormatted,
  ...accessoryProductsFormatted
];
