import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { hashPassword } from "../../../../lib/password";
import { customerRegisterSchema } from "../../../../lib/validators";
import { createCustomerSession } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = customerRegisterSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const { name, email, phone, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check existing customer
    const existing = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Determine next sequential customer ID
    const customerCount = await prisma.customer.count();
    const formattedCustId = `CUS-${String(customerCount + 1).padStart(4, "0")}`;

    const passwordHash = await hashPassword(password);

    const customer = await prisma.customer.create({
      data: {
        customerId: formattedCustId,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone || null,
        passwordHash,
        status: "Active",
        avatar: name.trim().charAt(0).toUpperCase(),
        lastLogin: new Date(),
      },
    });

    // Create session
    const sessionData = await createCustomerSession(customer.id, request);

    const response = NextResponse.json(
      {
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
        },
      },
      { status: 201 }
    );

    // Set secure session cookie
    response.cookies.set(
      sessionData.cookieName,
      sessionData.token,
      sessionData.cookieOptions
    );

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
