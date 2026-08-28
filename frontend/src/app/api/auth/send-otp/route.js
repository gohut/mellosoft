import { NextResponse } from "next/server";
import { getDb, schema } from "../../../../db";
import { sendOtpEmail } from "../../../../lib/mail";

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, purpose = "Verification" } = body;

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Email or phone identifier is required." },
        { status: 400 }
      );
    }

    const trimmedIdentifier = identifier.trim().toLowerCase();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry
    const now = new Date().toISOString();

    const db = getDb();
    if (db) {
      await db.insert(schema.otps).values({
        id: `otp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        identifier: trimmedIdentifier,
        otpCode,
        purpose,
        expiresAt,
        verified: 0,
        createdAt: now,
      });
    }

    // Dispatch email with OTP
    const mailResult = await sendOtpEmail({
      to: trimmedIdentifier,
      otpCode,
      purpose,
    });

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${trimmedIdentifier}`,
      expiresAt,
      // Include code in non-production environments for quick test usability
      ...(process.env.NODE_ENV !== "production" ? { devOtpCode: otpCode } : {}),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
