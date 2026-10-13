import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireCustomerAuth } from "../../../../lib/rbac";
import { addressSchema } from "../../../../lib/validators";

export async function GET(request) {
  const auth = await requireCustomerAuth(request);
  if (!auth.authenticated) return auth.response;

  const addresses = await prisma.customerAddress.findMany({
    where: { customerId: auth.customer.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ success: true, addresses });
}

export async function POST(request) {
  const auth = await requireCustomerAuth(request);
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const validation = addressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = validation.data;

    // If new address is marked as default, unset other defaults
    if (data.isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: auth.customer.id },
        data: { isDefault: false },
      });
    } else {
      // If this is the customer's first address, make it default automatically
      const count = await prisma.customerAddress.count({
        where: { customerId: auth.customer.id },
      });
      if (count === 0) data.isDefault = true;
    }

    const newAddress = await prisma.customerAddress.create({
      data: {
        ...data,
        customerId: auth.customer.id,
      },
    });

    return NextResponse.json({ success: true, address: newAddress }, { status: 201 });
  } catch (error) {
    console.error("Address creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
