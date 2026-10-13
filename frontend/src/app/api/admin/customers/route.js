import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireAdminPermission } from "../../../../lib/rbac";

export async function GET(request) {
  const auth = await requireAdminPermission(request, "customers", "view");
  if (!auth.authorized) return auth.response;

  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            orderStatus: true,
            paymentStatus: true,
          },
        },
        addresses: true,
      },
    });

    const formatted = customers.map((c) => {
      const validOrders = c.orders.filter(
        (o) => o.paymentStatus === "Paid" || o.orderStatus === "Delivered"
      );
      const totalSpending = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        id: c.customerId,
        internalId: c.id,
        customerId: c.customerId,
        name: c.name,
        email: c.email,
        phone: c.phone || "",
        status: c.status,
        avatar: c.avatar || c.name.charAt(0).toUpperCase(),
        orders: c.orders.length,
        totalOrders: c.orders.length,
        spending: totalSpending,
        totalSpending,
        createdAt: c.createdAt.toISOString().split("T")[0],
        lastLogin: c.lastLogin ? c.lastLogin.toISOString() : null,
      };
    });

    return NextResponse.json({ success: true, customers: formatted });
  } catch (error) {
    console.error("Admin customers list error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
