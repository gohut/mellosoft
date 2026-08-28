import { NextResponse } from "next/server";
import { getDb, schema } from "../../../db";
import { eq, and } from "drizzle-orm";
import { verifyToken } from "../../../lib/jwt";
import { MOCK_PRODUCTS } from "../../../data/products";
import { calculateDiscountedPrice } from "../../../utils/currency";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("ms_token")?.value;
    const token = authHeader || cookieToken;

    const tokenPayload = token ? verifyToken(token) : null;
    const customerId = tokenPayload ? tokenPayload.sub : null;

    if (!customerId) {
      return NextResponse.json({
        success: true,
        cart: [],
        message: "Anonymous user - use local storage or authenticate to persist cart.",
      });
    }

    const db = getDb();
    let cartItems = [];

    if (db) {
      cartItems = await db
        .select()
        .from(schema.carts)
        .where(eq(schema.carts.customerId, customerId));
    }

    return NextResponse.json({
      success: true,
      cart: cartItems.map((c) => ({
        cartItemId: c.id,
        customerId: c.customerId,
        productId: c.productId,
        variantSize: c.variantSize,
        variantFirmness: c.variantFirmness,
        variantSKU: c.variantSKU,
        qty: c.quantity,
        quantity: c.quantity,
        actualPrice: c.actualPrice,
        price: calculateDiscountedPrice(c.actualPrice, c.discountPercent),
        discountPercent: c.discountPercent,
        addedAt: c.addedAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("ms_token")?.value;
    const token = authHeader || cookieToken;
    const tokenPayload = token ? verifyToken(token) : null;
    const customerId = tokenPayload ? tokenPayload.sub : "guest";

    const body = await request.json();
    const { productId, variantSize = "Queen", variantFirmness = "Medium", qty = 1, actualPrice, discountPercent } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    const compositeCartItemId = `${productId}-${variantFirmness}-${variantSize}${customerId !== "guest" ? `-${customerId}` : ""}`;
    const now = new Date().toISOString();
    const db = getDb();

    if (db && customerId !== "guest") {
      const existing = await db
        .select()
        .from(schema.carts)
        .where(eq(schema.carts.id, compositeCartItemId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(schema.carts)
          .set({
            quantity: existing[0].quantity + Number(qty),
            updatedAt: now,
          })
          .where(eq(schema.carts.id, compositeCartItemId));
      } else {
        await db.insert(schema.carts).values({
          id: compositeCartItemId,
          customerId,
          productId,
          variantId: `${productId}-${variantFirmness}-${variantSize}`,
          variantSize,
          variantFirmness,
          variantSKU: `SKU-${productId}-${variantSize}`,
          quantity: Number(qty),
          actualPrice: Number(actualPrice || 999),
          discountPercent: Number(discountPercent || 10),
          addedAt: now,
          updatedAt: now,
        });
      }
    }

    return NextResponse.json({
      success: true,
      cartItemId: compositeCartItemId,
      message: "Item added to cart.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("ms_token")?.value;
    const token = authHeader || cookieToken;
    const tokenPayload = token ? verifyToken(token) : null;
    const customerId = tokenPayload ? tokenPayload.sub : null;

    if (customerId) {
      const db = getDb();
      if (db) {
        await db.delete(schema.carts).where(eq(schema.carts.customerId, customerId));
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cart cleared.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
