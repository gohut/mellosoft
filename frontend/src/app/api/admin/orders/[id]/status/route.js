import { NextResponse } from "next/server";
import { getDb, schema } from "../../../../../../db";
import { eq } from "drizzle-orm";
import { verifyApiAuthAndPermission } from "../../../../../../utils/apiAuth";

export async function PUT(request, { params }) {
  try {
    const authCheck = verifyApiAuthAndPermission(request, "orders", "updateStatus");
    if (!authCheck.authorized) return authCheck.response;

    const { id } = await params;
    const body = await request.json();
    const { paymentStatus, orderStatus } = body;
    const now = new Date().toISOString();

    const db = getDb();
    if (db) {
      await db
        .update(schema.orders)
        .set({
          ...(paymentStatus ? { paymentStatus } : {}),
          ...(orderStatus ? { orderStatus } : {}),
          updatedAt: now,
        })
        .where(eq(schema.orders.id, id));
    }

    return NextResponse.json({
      success: true,
      message: `Order ${id} status updated successfully.`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
