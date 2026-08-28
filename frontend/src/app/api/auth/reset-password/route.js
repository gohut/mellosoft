import { NextResponse } from "next/server";
import { getDb, schema } from "../../../../db";
import { eq } from "drizzle-orm";
import { hashPassword } from "../../../../utils/security";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, otpCode, newPassword } = body;

    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedOtp = (otpCode || "").trim();
    const trimmedNewPass = (newPassword || "").trim();

    if (!trimmedEmail || !trimmedNewPass) {
      return NextResponse.json(
        { success: false, error: "Email and new password are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    const now = new Date().toISOString();
    const newHash = hashPassword(trimmedNewPass);

    if (db) {
      const results = await db
        .select()
        .from(schema.customers)
        .where(eq(schema.customers.email, trimmedEmail))
        .limit(1);

      if (results.length === 0) {
        return NextResponse.json(
          { success: false, error: "Customer account not found." },
          { status: 404 }
        );
      }

      await db
        .update(schema.customers)
        .set({ passwordHash: newHash, updatedAt: now })
        .where(eq(schema.customers.email, trimmedEmail));
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
