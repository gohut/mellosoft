import { NextResponse } from "next/server";
import { getDb, schema } from "../../../../db";
import { verifyApiAuthAndPermission } from "../../../../utils/apiAuth";
import { DASHBOARD_STATS, SALES_CHART_DATA } from "../../../../admin/data/adminMockData";

export async function GET(request) {
  try {
    const authCheck = verifyApiAuthAndPermission(request, "dashboard", "view");
    if (!authCheck.authorized) return authCheck.response;

    const db = getDb();
    let stats = { ...DASHBOARD_STATS };

    if (db) {
      try {
        const allOrders = await db.select().from(schema.orders);
        const allCustomers = await db.select().from(schema.customers);
        const allProducts = await db.select().from(schema.products);

        const totalRevenue = allOrders
          .filter((o) => o.paymentStatus === "Paid" || o.orderStatus === "Delivered")
          .reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);

        stats = {
          totalRevenue: totalRevenue || DASHBOARD_STATS.totalRevenue,
          totalOrders: allOrders.length || DASHBOARD_STATS.totalOrders,
          totalCustomers: allCustomers.length || DASHBOARD_STATS.totalCustomers,
          totalProducts: allProducts.length || DASHBOARD_STATS.totalProducts,
          revenueChange: 12.5,
          ordersChange: 8.2,
          customersChange: 15.3,
          productsChange: 2.1,
        };
      } catch (err) {}
    }

    return NextResponse.json({
      success: true,
      stats,
      chartData: SALES_CHART_DATA,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
