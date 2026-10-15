import { NextResponse } from "next/server";
import { destroyCustomerSession, destroyAdminSession } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "customer" | "admin" | null

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });

    if (type !== "admin") {
      const custRes = await destroyCustomerSession(request);
      response.cookies.set(custRes.cookieName, "", custRes.cookieOptions);
    }

    if (type !== "customer") {
      const adminRes = await destroyAdminSession(request);
      response.cookies.set(adminRes.cookieName, "", adminRes.cookieOptions);
    }

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
