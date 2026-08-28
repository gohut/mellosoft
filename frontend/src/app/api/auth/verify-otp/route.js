import { NextResponse } from "next/server";
import { getDb, schema } from "../../../../db";
import { eq, and, gte } from "drizzle-orm";

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, otpCode, purpose = "Verification" } = body;

    if (!identifier || !otpCode) {
      return NextResponse.json(
        { success: false, error: "Identifier and OTP code are required." },
        { status: 400 }
      );
    }

    const trimmedIdentifier = identifier.trim().toLowerCase();
    const trimmedOtp = otpCode.trim();
    const db = getDb();
    const now = new Date().toISOString();

    // Universal test OTP for development ease
    if (process.env.NODE_ENV !== "production" && trimmedOtp === "123456") {
      return NextResponse.json({
        success: true,
        message: "OTP verified successfully.",
      });
    }

    if (db) {
      const validOtps = await db
        .select()
        .from(schema.otps)
        .where(
          and(
            eq(schema.otps.identifier, trimmedIdentifier),
            eq(schema.otps.otpCode, trimmedOtp),
            eq(schema.otps.verified, 0),
            gte(schema.otps.expiresAt, now)
          )
        )
        .limit(1);

      if (validOtps.length === 0) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired OTP code." },
          { status: 400 }
        );
      }

      // Mark OTP as verified
      await db
        .update(schema.otps)
        .set({ verified: 1 })
        .where(eq(schema.otps.id, validOtps[0].id));
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
