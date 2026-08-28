import { NextResponse } from "next/server";
import { getDb, schema } from "../../../db";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "../../../lib/jwt";
import { MOCK_ORDERS } from "../../../admin/data/adminMockData";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("ms_token")?.value || request.cookies.get("ms_admin_token")?.value;
    const token = authHeader || cookieToken;

    const tokenPayload = token ? verifyToken(token) : null;
    const customerId = tokenPayload ? tokenPayload.sub : null;
    const isAdmin = tokenPayload?.type === "admin";

    const db = getDb();
    let orderList = [];

    if (db) {
      try {
        let query = db.select().from(schema.orders);

        if (!isAdmin && customerId) {
          query = query.where(eq(schema.orders.customerId, customerId));
        }

        const rawOrders = await query.orderBy(desc(schema.orders.createdAt));

        for (const ord of rawOrders) {
          // Fetch order items
          const items = await db
            .select()
            .from(schema.orderItems)
            .where(eq(schema.orderItems.orderId, ord.id));

          orderList.push({
            id: ord.id,
            orderId: ord.orderId,
            customerId: ord.customerId,
            customerName: ord.customerName,
            customerEmail: ord.customerEmail,
            customerPhone: ord.customerPhone,
            shippingAddress: ord.shippingAddress ? JSON.parse(ord.shippingAddress) : null,
            subtotal: ord.subtotal,
            deliveryFee: ord.deliveryFee,
            totalAmount: ord.totalAmount,
            paymentStatus: ord.paymentStatus,
            paymentMethod: ord.paymentMethod,
            orderStatus: ord.orderStatus,
            createdAt: ord.createdAt,
            items: items.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              variantSize: i.variantSize,
              variantFirmness: i.variantFirmness,
              variantSKU: i.variantSKU,
              quantity: i.quantity,
              price: i.unitPrice,
            })),
          });
        }
      } catch (err) {
        console.warn("DB Orders query error, using fallback:", err.message);
      }
    }

    if (orderList.length === 0) {
      if (isAdmin) {
        orderList = MOCK_ORDERS;
      } else if (customerId) {
        orderList = MOCK_ORDERS.filter((o) => o.customerId === customerId || customerId === "C001");
      } else {
        orderList = MOCK_ORDERS.slice(0, 2);
      }
    }

    return NextResponse.json({
      success: true,
      orders: orderList,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
