import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  // Clear HTTP-only session cookies
  response.cookies.delete("ms_token");
  response.cookies.delete("ms_admin_token");

  return response;
}
