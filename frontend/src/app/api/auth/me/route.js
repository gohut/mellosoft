import { NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/jwt";
import { getDb, schema } from "../../../../db";
import { eq } from "drizzle-orm";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("ms_token")?.value || request.cookies.get("ms_admin_token")?.value;
    const token = authHeader || cookieToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session token." },
        { status: 401 }
      );
    }

    const db = getDb();
    if (payload.type === "customer") {
      let customer = null;
      if (db) {
        const results = await db
          .select()
          .from(schema.customers)
          .where(eq(schema.customers.id, payload.sub))
          .limit(1);
        customer = results[0];
      }

      if (!customer) {
        customer = {
          id: payload.sub,
          customerId: payload.customerId || payload.sub,
          name: payload.name,
          email: payload.email,
          phone: "+91 98765 43210",
          status: "Active",
        };
      }

      return NextResponse.json({
        success: true,
        userType: "customer",
        customer: {
          id: customer.id,
          customerId: customer.customerId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone || "",
          avatar: customer.avatar || customer.name.charAt(0).toUpperCase(),
          sleepPos: customer.sleepPos || "Side",
          preferredTemp: customer.preferredTemp || "Cool",
          status: customer.status,
        },
      });
    }

    if (payload.type === "admin") {
      return NextResponse.json({
        success: true,
        userType: "admin",
        user: {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          roleId: payload.roleId,
          roleName: payload.roleName,
          status: "Active",
        },
        permissions: payload.permissions || {},
      });
    }

    return NextResponse.json(
      { success: false, error: "Unknown token payload type." },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
