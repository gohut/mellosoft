import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getAdminSession, getCustomerSession } from "../../../lib/auth";

export async function GET(request) {
  try {
    const adminAuth = await getAdminSession(request);
    const customerAuth = await getCustomerSession(request);

    // If Admin, allow viewing all orders
    if (adminAuth.authenticated && adminAuth.user) {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { items: true },
      });
      return NextResponse.json({ success: true, orders });
    }

    // If Customer, filter by customer ID, canonical customerId, or matching email
    if (customerAuth.authenticated && customerAuth.customer) {
      const c = customerAuth.customer;
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            { customerId: c.id },
            ...(c.customerId ? [{ customerId: c.customerId }] : []),
            ...(c.email ? [{ email: { equals: c.email, mode: "insensitive" } }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      });
      return NextResponse.json({ success: true, orders });
    }

    return NextResponse.json(
      { success: false, error: "Unauthorized: Sign in to view orders." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Orders list API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
