import { NextResponse } from "next/server";
import { getDb, schema } from "../../../../db";
import { eq } from "drizzle-orm";
import { sendOtpEmail } from "../../../../lib/mail";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const db = getDb();

    let customerExists = false;
    if (db) {
      const results = await db
        .select()
        .from(schema.customers)
        .where(eq(schema.customers.email, trimmedEmail))
        .limit(1);
      customerExists = results.length > 0;
    }

    // Always respond with success to prevent user enumeration attacks
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    if (customerExists && db) {
      await db.insert(schema.otps).values({
        id: `otp_reset_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        identifier: trimmedEmail,
        otpCode,
        purpose: "Password Reset",
        expiresAt,
        verified: 0,
        createdAt: now,
      });

      await sendOtpEmail({
        to: trimmedEmail,
        otpCode,
        purpose: "Password Reset",
      });
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists for this email, password reset instructions have been sent.",
      ...(process.env.NODE_ENV !== "production" && customerExists ? { devOtpCode: otpCode } : {}),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
