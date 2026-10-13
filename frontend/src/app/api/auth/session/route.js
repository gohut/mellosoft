import { NextResponse } from "next/server";
import { getAdminSession, getCustomerSession } from "../../../../lib/auth";

export async function GET(request) {
  try {
    // 1. Check admin session first
    const adminCheck = await getAdminSession(request);
    if (adminCheck.authenticated && adminCheck.user) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        type: "admin",
        user: {
          id: adminCheck.user.id,
          name: adminCheck.user.name,
          email: adminCheck.user.email,
          phone: adminCheck.user.phone,
          roleId: adminCheck.user.roleId,
          roleName: adminCheck.role?.name,
          status: adminCheck.user.status,
        },
        role: adminCheck.role,
        permissions: adminCheck.role?.permissions || {},
      });
    }

    // 2. Check customer session
    const customerCheck = await getCustomerSession(request);
    if (customerCheck.authenticated && customerCheck.customer) {
      const c = customerCheck.customer;
      return NextResponse.json({
        success: true,
        authenticated: true,
        type: "customer",
        customer: {
          id: c.customerId,
          internalId: c.id,
          customerId: c.customerId,
          name: c.name,
          email: c.email,
          phone: c.phone,
          status: c.status,
          avatar: c.avatar,
          savedAddresses: c.addresses || [],
        },
        user: {
          id: c.customerId,
          name: c.name,
          email: c.email,
        },
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: false,
    });
  } catch (error) {
    console.error("Session lookup error:", error);
    return NextResponse.json(
      { success: false, authenticated: false, error: error.message },
      { status: 500 }
    );
  }
}
