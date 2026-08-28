import { NextResponse } from "next/server";
import { getDb, schema } from "../../../../db";
import { eq } from "drizzle-orm";
import { MOCK_PRODUCTS } from "../../../../data/products";
import { verifyApiAuthAndPermission } from "../../../../utils/apiAuth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();

    let product = null;
    let variants = [];
    let reviewsList = [];

    if (db) {
      try {
        const prodResults = await db
          .select()
          .from(schema.products)
          .where(eq(schema.products.id, id))
          .limit(1);

        if (prodResults.length > 0) {
          const p = prodResults[0];
          product = {
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
          };

          // Load variants
          const variantResults = await db
            .select()
            .from(schema.productVariants)
            .where(eq(schema.productVariants.productId, id));

          variants = variantResults.map((v) => ({
            Variant_Id: v.variantId,
            SKU: v.sku,
            Size: v.size,
            Firmness: v.firmness,
            Actual_Price: v.actualPrice,
            Stock: v.stock,
            Threshold: v.threshold,
            Status: v.status,
          }));

          // Load product reviews
          const reviewResults = await db
            .select()
            .from(schema.reviews)
            .where(eq(schema.reviews.productId, id));

          reviewsList = reviewResults.map((r) => ({
            id: r.id,
            author: r.author,
            rating: r.rating,
            content: r.content,
            date: r.date,
            helpfulCount: r.helpfulCount,
            replyCount: r.replyCount,
          }));
        }
      } catch (e) {}
    }

    if (!product) {
      product = MOCK_PRODUCTS.find((p) => p.id === id);
      if (product) {
        variants = product.variants || [];
        reviewsList = product.reviews || [];
      }
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        variants,
        reviews: reviewsList,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const authCheck = verifyApiAuthAndPermission(request, "products", "edit");
    if (!authCheck.authorized) return authCheck.response;

    const { id } = await params;
    const body = await request.json();
    const db = getDb();
    const now = new Date().toISOString();

    if (db) {
      await db
        .update(schema.products)
        .set({
          name: body.name,
          tagline: body.tagline,
          category: body.category,
          badge: body.badge,
          price: body.price !== undefined ? Number(body.price) : undefined,
          actualPrice: body.Actual_Price !== undefined ? Number(body.Actual_Price) : undefined,
          discountPercent: body.discountPercent !== undefined ? Number(body.discountPercent) : undefined,
          description: body.description,
          specs: body.specs,
          updatedAt: now,
        })
        .where(eq(schema.products.id, id));
    }

    return NextResponse.json({
      success: true,
      message: `Product ${id} updated successfully.`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authCheck = verifyApiAuthAndPermission(request, "products", "delete");
    if (!authCheck.authorized) return authCheck.response;

    const { id } = await params;
    const db = getDb();

    if (db) {
      await db.delete(schema.products).where(eq(schema.products.id, id));
      await db.delete(schema.productVariants).where(eq(schema.productVariants.productId, id));
    }

    return NextResponse.json({
      success: true,
      message: `Product ${id} deleted successfully.`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
