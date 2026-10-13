import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireAdminPermission } from "../../../../lib/rbac";

export async function GET(request) {
  const auth = await requireAdminPermission(request, "dashboard", "view");
  if (!auth.authorized) return auth.response;

  try {
    const validOrderFilter = {
      orderStatus: { notIn: ["Cancelled"] },
      paymentStatus: { notIn: ["Failed"] },
    };

    const [
      revenueAggregate,
      totalOrders,
      totalCustomers,
      totalProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: validOrderFilter,
        _sum: { totalAmount: true },
      }),
      prisma.order.count({ where: validOrderFilter }),
      prisma.customer.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
    ]);

    const totalRevenue = revenueAggregate._sum.totalAmount || 0;

    // Build real time-aggregated sales series for charts
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const pastWeekOrders = await prisma.order.findMany({
      where: {
        ...validOrderFilter,
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true, totalAmount: true },
    });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7DaysMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const label = dayNames[d.getDay()];
      last7DaysMap[label] = { label, orders: 0, revenue: 0 };
    }

    for (const ord of pastWeekOrders) {
      const label = dayNames[new Date(ord.createdAt).getDay()];
      if (last7DaysMap[label]) {
        last7DaysMap[label].orders += 1;
        last7DaysMap[label].revenue += ord.totalAmount;
      }
    }

    const last7DaysChart = Object.values(last7DaysMap);

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueChange: 12.5,
        ordersChange: 8.2,
        customersChange: 15.3,
        productsChange: 2.1,
      },
      recentOrders,
      chartData: {
        last7Days: last7DaysChart,
      },
    });
  } catch (error) {
    console.error("Admin dashboard API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
