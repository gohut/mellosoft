import { NextResponse } from "next/server";
import { getDb, schema } from "../../../db";
import { MOCK_PRODUCTS } from "../../../data/products";
import { verifyApiAuthAndPermission } from "../../../utils/apiAuth";
import { calculateDiscountedPrice } from "../../../utils/currency";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "All";
    const firmness = searchParams.get("firmness") || "All";
    const size = searchParams.get("size") || "All";
    const sort = searchParams.get("sort") || "Recommended";

    const db = getDb();
    let productList = [];

    if (db) {
      try {
        const rawProducts = await db.select().from(schema.products);
        if (rawProducts && rawProducts.length > 0) {
          productList = rawProducts.map((p) => ({
            id: p.id,
            Product_Id: p.productId,
            name: p.name,
            tagline: p.tagline,
            category: p.category,
            badge: p.badge,
            price: p.price,
            Actual_Price: p.actualPrice,
            discountPercent: p.discountPercent,
            rating: p.rating,
            reviewCount: p.reviewCount,
            images: p.images ? JSON.parse(p.images) : [],
            description: p.description,
            specs: p.specs,
            features: p.features ? JSON.parse(p.features) : [],
            firmnessOptions: p.firmnessOptions ? JSON.parse(p.firmnessOptions) : [],
            sizeOptions: p.sizeOptions ? JSON.parse(p.sizeOptions) : [],
            sizePrices: p.sizePrices ? JSON.parse(p.sizePrices) : {},
            firmnessPrices: p.firmnessPrices ? JSON.parse(p.firmnessPrices) : {},
          }));
        }
      } catch (err) {
        console.warn("DB products query error, falling back to mock:", err.message);
      }
    }

    if (productList.length === 0) {
      productList = MOCK_PRODUCTS;
    }

    // 1. Search Query Filter
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      productList = productList.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.tagline && p.tagline.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query) ||
          (p.badge && p.badge.toLowerCase().includes(query)) ||
          (p.specs && p.specs.toLowerCase().includes(query))
      );
    }

    // 2. Category Filter
    if (category !== "All") {
      productList = productList.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // 3. Firmness Filter
    if (firmness !== "All") {
      productList = productList.filter(
        (p) => p.firmnessOptions && p.firmnessOptions.includes(firmness)
      );
    }

    // 4. Size Filter
    if (size !== "All") {
      productList = productList.filter(
        (p) => p.sizeOptions && p.sizeOptions.includes(size)
      );
    }

    // 5. Sorting
    if (sort === "Price: Low to High") {
      productList.sort((a, b) => {
        const pA = calculateDiscountedPrice(a.Actual_Price || a.price, a.discountPercent);
        const pB = calculateDiscountedPrice(b.Actual_Price || b.price, b.discountPercent);
        return pA - pB;
      });
    } else if (sort === "Price: High to Low") {
      productList.sort((a, b) => {
        const pA = calculateDiscountedPrice(a.Actual_Price || a.price, a.discountPercent);
        const pB = calculateDiscountedPrice(b.Actual_Price || b.price, b.discountPercent);
        return pB - pA;
      });
    } else if (sort === "Rating") {
      productList.sort((a, b) => b.rating - a.rating);
    }

    return NextResponse.json({
      success: true,
      count: productList.length,
      products: productList,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authCheck = verifyApiAuthAndPermission(request, "products", "create");
    if (!authCheck.authorized) return authCheck.response;

    const body = await request.json();
    const { name, category, price, Actual_Price, discountPercent, description } = body;

    if (!name || !category || !price) {
      return NextResponse.json(
        { success: false, error: "Product name, category, and price are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    const id = body.id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const now = new Date().toISOString();

    const newProd = {
      id,
      productId: body.Product_Id || `PROD-${Date.now().toString().slice(-4)}`,
      name,
      tagline: body.tagline || "",
      category,
      badge: body.badge || "New",
      price: Number(price),
      actualPrice: Number(Actual_Price || price),
      discountPercent: Number(discountPercent || 0),
      rating: 5.0,
      reviewCount: 0,
      images: JSON.stringify(body.images || ["/asset/img1.jpg"]),
      description: description || "",
      specs: body.specs || "",
      features: JSON.stringify(body.features || []),
      firmnessOptions: JSON.stringify(body.firmnessOptions || ["Soft", "Medium", "Firm"]),
      sizeOptions: JSON.stringify(body.sizeOptions || ["Twin", "Full", "Queen", "King"]),
      sizePrices: JSON.stringify(body.sizePrices || {}),
      firmnessPrices: JSON.stringify(body.firmnessPrices || {}),
      status: "Active",
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      await db.insert(schema.products).values(newProd);
    }

    return NextResponse.json({
      success: true,
      product: newProd,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
