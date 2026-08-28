import { NextResponse } from "next/server";
import { getDb, schema } from "../../../../db";
import { eq } from "drizzle-orm";
import { verifyToken } from "../../../../lib/jwt";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("ms_token")?.value;
    const token = authHeader || cookieToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, error: "Invalid session." },
        { status: 401 }
      );
    }

    const db = getDb();
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
      return NextResponse.json({
        success: true,
        customer: {
          id: payload.sub,
          customerId: payload.customerId || payload.sub,
          name: payload.name,
          email: payload.email,
          sleepPos: "Side",
          preferredTemp: "Cool",
          avatar: payload.name ? payload.name.charAt(0).toUpperCase() : "C",
        },
      });
    }

    return NextResponse.json({
      success: true,
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
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("ms_token")?.value;
    const token = authHeader || cookieToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, error: "Invalid session." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, sleepPos, preferredTemp } = body;
    const now = new Date().toISOString();
    const db = getDb();

    if (db) {
      await db
        .update(schema.customers)
        .set({
          ...(name ? { name } : {}),
          ...(phone ? { phone } : {}),
          ...(sleepPos ? { sleepPos } : {}),
          ...(preferredTemp ? { preferredTemp } : {}),
          updatedAt: now,
        })
        .where(eq(schema.customers.id, payload.sub));
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
