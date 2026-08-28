import { NextResponse } from "next/server";
import { getDb, schema } from "../../../../db";
import { eq } from "drizzle-orm";
import { verifyApiAuthAndPermission } from "../../../../utils/apiAuth";
import { MOCK_CUSTOMERS, MOCK_CARTS } from "../../../../admin/data/adminMockData";

export async function GET(request) {
  try {
    const authCheck = verifyApiAuthAndPermission(request, "customers", "view");
    if (!authCheck.authorized) return authCheck.response;

    const db = getDb();
    let customerList = [];
    let cartList = [];

    if (db) {
      try {
        const rawCustomers = await db.select().from(schema.customers);
        const rawCarts = await db.select().from(schema.carts);

        if (rawCustomers.length > 0) {
          customerList = rawCustomers.map((c) => ({
            id: c.id,
            customerId: c.customerId,
            name: c.name,
            email: c.email,
            phone: c.phone || "",
            status: c.status,
            avatar: c.avatar || c.name.charAt(0).toUpperCase(),
            createdAt: c.createdAt,
            lastLogin: c.updatedAt,
          }));
        }

        if (rawCarts.length > 0) {
          cartList = rawCarts.map((c) => ({
            cartItemId: c.id,
            customerId: c.customerId,
            productId: c.productId,
            variantSize: c.variantSize,
            variantFirmness: c.variantFirmness,
            variantSKU: c.variantSKU,
            quantity: c.quantity,
            actualPrice: c.actualPrice,
            discountPercent: c.discountPercent,
            addedAt: c.addedAt,
            stockStatus: "In Stock",
          }));
        }
      } catch (err) {}
    }

    if (customerList.length === 0) customerList = MOCK_CUSTOMERS;
    if (cartList.length === 0) cartList = MOCK_CARTS;

    return NextResponse.json({
      success: true,
      customers: customerList,
      carts: cartList,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
