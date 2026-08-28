import { NextResponse } from "next/server";
import { getDb, schema } from "../../../../db";
import { eq } from "drizzle-orm";
import { signCustomerToken } from "../../../../lib/jwt";

export async function POST(request) {
  try {
    const body = await request.json();
    const { credential, accessToken, googleUser } = body;

    let email = null;
    let name = null;
    let googleId = null;
    let avatar = null;

    // 1. Verify Google Credential (ID Token) if provided
    if (credential) {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
        );
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          email = payload.email;
          name = payload.name;
          googleId = payload.sub;
          avatar = payload.picture;
        }
      } catch (err) {
        console.warn("Google tokeninfo verification failed:", err.message);
      }
    }

    // 2. Direct Google User payload fallback for client-side SDK
    if (!email && googleUser && googleUser.email) {
      email = googleUser.email;
      name = googleUser.name || googleUser.email.split("@")[0];
      googleId = googleUser.id || googleUser.sub || `g_${Date.now()}`;
      avatar = googleUser.picture || googleUser.avatar;
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Google authentication failed: Missing valid email." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const db = getDb();

    // Check if customer already exists in DB
    let customer = null;
    if (db) {
      try {
        const results = await db
          .select()
          .from(schema.customers)
          .where(eq(schema.customers.email, trimmedEmail))
          .limit(1);
        customer = results[0];
      } catch (e) {}
    }

    const now = new Date().toISOString();

    if (!customer) {
      // Create new customer for first-time Google sign in
      const customerIdStr = `C${Date.now().toString().slice(-4)}`;
      const formattedCustId = `CUS-${Date.now().toString().slice(-4)}`;

      customer = {
        id: customerIdStr,
        customerId: formattedCustId,
        name: name || trimmedEmail.split("@")[0],
        email: trimmedEmail,
        passwordHash: null,
        phone: "+91 98765 43210",
        googleId,
        avatar: avatar || (name || trimmedEmail).charAt(0).toUpperCase(),
        sleepPos: "Side",
        preferredTemp: "Cool",
        status: "Active",
        createdAt: now,
        updatedAt: now,
      };

      if (db) {
        await db.insert(schema.customers).values(customer);
      }
    } else if (googleId && !customer.googleId && db) {
      // Link googleId to existing customer account
      await db
        .update(schema.customers)
        .set({ googleId, avatar: avatar || customer.avatar, updatedAt: now })
        .where(eq(schema.customers.id, customer.id));
    }

    const token = signCustomerToken(customer);

    const response = NextResponse.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        avatar: customer.avatar,
        sleepPos: customer.sleepPos || "Side",
        preferredTemp: customer.preferredTemp || "Cool",
        status: customer.status,
      },
    });

    response.cookies.set("ms_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
