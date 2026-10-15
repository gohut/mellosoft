import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getAdminSession, getCustomerSession } from "../../../../lib/auth";

export async function GET(request, { params }) {
  const { id } = await params;
  const targetRef = (id || "").trim();

  if (!targetRef) {
    return NextResponse.json({ success: false, error: "Order reference is required." }, { status: 400 });
  }

  try {
    const adminAuth = await getAdminSession(request);
    const customerAuth = await getCustomerSession(request);

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: targetRef },
          { id: targetRef.toUpperCase() },
          { id: targetRef.toLowerCase() },
          { orderNumber: targetRef },
          { orderNumber: targetRef.toUpperCase() },
          { orderNumber: targetRef.toLowerCase() },
        ],
      },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    // 1. Administrators have authorized access to any order
    const isAdmin = adminAuth.authenticated && adminAuth.user;
    if (isAdmin) {
      return NextResponse.json({ success: true, order });
    }

    // 2. Customer ownership verification
    const orderHasCustomer = Boolean(order.customerId || order.email);

    if (orderHasCustomer) {
      if (!customerAuth.authenticated || !customerAuth.customer) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Please sign in to view this order." },
          { status: 401 }
        );
      }

      const c = customerAuth.customer;
      const isOwner =
        (order.customerId && (order.customerId === c.id || order.customerId === c.customerId)) ||
        (order.email && c.email && order.email.toLowerCase() === c.email.toLowerCase());

      if (!isOwner) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You do not have permission to view this order." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Order detail API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
