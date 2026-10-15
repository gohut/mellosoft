import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireAdminPermission } from "../../../../lib/rbac";

export async function GET(request) {
  const auth = await requireAdminPermission(request, "orders", "view");
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");

    const where = {};
    if (status && status !== "All") where.orderStatus = status;
    if (paymentStatus && paymentStatus !== "All") where.paymentStatus = paymentStatus;

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { id: { contains: q, mode: "insensitive" } },
        { orderNumber: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        payments: true,
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Admin orders list error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
