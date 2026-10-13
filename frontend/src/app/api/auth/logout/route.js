import { NextResponse } from "next/server";
import { destroyCustomerSession, destroyAdminSession } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const custRes = await destroyCustomerSession(request);
    const adminRes = await destroyAdminSession(request);

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });

    response.cookies.set(custRes.cookieName, "", custRes.cookieOptions);
    response.cookies.set(adminRes.cookieName, "", adminRes.cookieOptions);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
