import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { createCustomerSession } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json(
        {
          success: false,
          error: "Google credential token is missing. Please select a valid Google account.",
        },
        { status: 400 }
      );
    }

    // Verify token with Google OAuth2 tokeninfo endpoint
    let googlePayload = null;
    try {
      const googleRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      if (googleRes.ok) {
        googlePayload = await googleRes.json();
      }
    } catch (fetchErr) {
      console.warn("Failed to reach Google tokeninfo endpoint:", fetchErr);
    }

    if (!googlePayload || !googlePayload.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Google credential verification failed. The token is invalid or expired.",
        },
        { status: 401 }
      );
    }

    const emailTrimmed = googlePayload.email.toLowerCase().trim();
    const name = (googlePayload.name || emailTrimmed.split("@")[0] || "Customer").trim();
    const avatar = googlePayload.picture || name.charAt(0).toUpperCase();

    // Upsert customer in PostgreSQL
    let customer = await prisma.customer.findUnique({
      where: { email: emailTrimmed },
      include: { addresses: true },
    });

    if (!customer) {
      const customerCount = await prisma.customer.count();
      const formattedCustId = `CUS-${String(customerCount + 1).padStart(4, "0")}`;

      customer = await prisma.customer.create({
        data: {
          customerId: formattedCustId,
          name,
          email: emailTrimmed,
          phone: null,
          passwordHash: "GOOGLE_OAUTH_ACCOUNT",
          status: "Active",
          avatar,
          lastLogin: new Date(),
        },
        include: { addresses: true },
      });
    } else {
      if (customer.status !== "Active") {
        return NextResponse.json(
          {
            success: false,
            error: "Your customer account is currently suspended. Please contact support.",
          },
          { status: 403 }
        );
      }

      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          lastLogin: new Date(),
          avatar: avatar || customer.avatar,
        },
        include: { addresses: true },
      });
    }

    // Create authenticated customer session and cookie
    const sessionData = await createCustomerSession(customer.id, request);

    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.customerId,
        internalId: customer.id,
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
        avatar: customer.avatar,
        savedAddresses: customer.addresses || [],
      },
    });

    response.cookies.set(
      sessionData.cookieName,
      sessionData.token,
      sessionData.cookieOptions
    );

    return response;
  } catch (error) {
    console.error("Google Auth Route Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during Google sign-in." },
      { status: 500 }
    );
  }
}
