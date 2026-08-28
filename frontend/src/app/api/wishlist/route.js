import { NextResponse } from "next/server";
import { getDb, schema } from "../../../db";
import { eq, and } from "drizzle-orm";
import { verifyToken } from "../../../lib/jwt";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("ms_token")?.value;
    const token = authHeader || cookieToken;

    const tokenPayload = token ? verifyToken(token) : null;
    const customerId = tokenPayload ? tokenPayload.sub : null;

    if (!customerId) {
      return NextResponse.json({ success: true, wishlist: [] });
    }

    const db = getDb();
    let items = [];
    if (db) {
      const records = await db
        .select()
        .from(schema.wishlists)
        .where(eq(schema.wishlists.customerId, customerId));
      items = records.map((r) => r.productId);
    }

    return NextResponse.json({
      success: true,
      wishlist: items,
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
    const customerId = tokenPayload ? tokenPayload.sub : null;

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    if (customerId) {
      const db = getDb();
      const id = `${customerId}-${productId}`;
      const now = new Date().toISOString();

      if (db) {
        const existing = await db
          .select()
          .from(schema.wishlists)
          .where(and(eq(schema.wishlists.customerId, customerId), eq(schema.wishlists.productId, productId)))
          .limit(1);

        if (existing.length > 0) {
          await db.delete(schema.wishlists).where(eq(schema.wishlists.id, id));
        } else {
          await db.insert(schema.wishlists).values({
            id,
            customerId,
            productId,
            createdAt: now,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Wishlist toggled successfully.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
