import { NextResponse } from "next/server";
import { getDb, schema } from "../../../../db";
import { eq } from "drizzle-orm";

export async function PUT(request, { params }) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const { qty } = body;

    const db = getDb();
    const now = new Date().toISOString();

    if (db) {
      if (Number(qty) <= 0) {
        await db.delete(schema.carts).where(eq(schema.carts.id, itemId));
      } else {
        await db
          .update(schema.carts)
          .set({ quantity: Number(qty), updatedAt: now })
          .where(eq(schema.carts.id, itemId));
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cart item updated.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { itemId } = await params;
    const db = getDb();

    if (db) {
      await db.delete(schema.carts).where(eq(schema.carts.id, itemId));
    }

    return NextResponse.json({
      success: true,
      message: "Cart item removed.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
