import { NextResponse } from "next/server";
import { getDb, schema } from "../../../../db";
import { eq } from "drizzle-orm";
import { hashPassword } from "../../../../utils/security";
import { signCustomerToken } from "../../../../lib/jwt";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    const trimmedName = (name || "").trim();
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();
    const trimmedPhone = (phone || "").trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if customer email already exists in DB
    let existingCustomer = null;
    if (db) {
      const results = await db
        .select()
        .from(schema.customers)
        .where(eq(schema.customers.email, trimmedEmail))
        .limit(1);
      existingCustomer = results[0];
    }

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists." },
        { status: 400 }
      );
    }

    const customerIdStr = `C${Date.now().toString().slice(-4)}`;
    const formattedCustId = `CUS-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();
    const passwordHash = hashPassword(trimmedPassword);

    const newCustomer = {
      id: customerIdStr,
      customerId: formattedCustId,
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
      phone: trimmedPhone || "+91 98765 43210",
      avatar: trimmedName.charAt(0).toUpperCase(),
      sleepPos: "Side",
      preferredTemp: "Cool",
      status: "Active",
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      await db.insert(schema.customers).values(newCustomer);
    }

    // Generate JWT token
    const token = signCustomerToken(newCustomer);

    const response = NextResponse.json({
      success: true,
      token,
      customer: {
        id: newCustomer.id,
        customerId: newCustomer.customerId,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        avatar: newCustomer.avatar,
        sleepPos: newCustomer.sleepPos,
        preferredTemp: newCustomer.preferredTemp,
        status: newCustomer.status,
      },
    });

    // Set HTTP-Only Cookie
    response.cookies.set("ms_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
