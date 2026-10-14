import { NextResponse } from "next/server";
import { getAdminSession, getCustomerSession } from "../../../../lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedType = searchParams.get("type"); // "customer" | "admin"

    const adminCheck = requestedType !== "customer" ? await getAdminSession(request) : { authenticated: false };
    const customerCheck = requestedType !== "admin" ? await getCustomerSession(request) : { authenticated: false };

    // 1. Specific customer session query
    if (requestedType === "customer") {
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
      return NextResponse.json({ success: true, authenticated: false, type: "customer" });
    }

    // 2. Specific admin session query
    if (requestedType === "admin") {
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
      return NextResponse.json({ success: true, authenticated: false, type: "admin" });
    }

    // 3. General query — resolve both without cross-contamination
    let adminPayload = null;
    let customerPayload = null;

    if (adminCheck.authenticated && adminCheck.user) {
      adminPayload = {
        id: adminCheck.user.id,
        name: adminCheck.user.name,
        email: adminCheck.user.email,
        phone: adminCheck.user.phone,
        roleId: adminCheck.user.roleId,
        roleName: adminCheck.role?.name,
        status: adminCheck.user.status,
      };
    }

    if (customerCheck.authenticated && customerCheck.customer) {
      const c = customerCheck.customer;
      customerPayload = {
        id: c.customerId,
        internalId: c.id,
        customerId: c.customerId,
        name: c.name,
        email: c.email,
        phone: c.phone,
        status: c.status,
        avatar: c.avatar,
        savedAddresses: c.addresses || [],
      };
    }

    return NextResponse.json({
      success: true,
      authenticated: Boolean(adminPayload || customerPayload),
      type: adminPayload && !customerPayload ? "admin" : customerPayload && !adminPayload ? "customer" : adminPayload && customerPayload ? "dual" : "none",
      user: customerPayload ? { id: customerPayload.id, name: customerPayload.name, email: customerPayload.email } : adminPayload,
      adminUser: adminPayload,
      customer: customerPayload,
      role: adminCheck.role || null,
      permissions: adminCheck.role?.permissions || {},
    });
  } catch (error) {
    console.error("Session lookup error:", error);
    return NextResponse.json(
      { success: false, authenticated: false, error: error.message },
      { status: 500 }
    );
  }
}
