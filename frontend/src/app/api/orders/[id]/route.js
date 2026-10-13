import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getAdminSession, getCustomerSession } from "../../../../lib/auth";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const adminAuth = await getAdminSession(request);
    const customerAuth = await getCustomerSession(request);

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: id }, { orderNumber: id }],
      },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    // Ownership check: must be admin OR the customer who placed the order
    const isOrderOwner = customerAuth.authenticated && order.customerId === customerAuth.customer.id;
    const isAdmin = adminAuth.authenticated && adminAuth.user;

    if (!isOrderOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not have permission to view this order." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Order detail API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
