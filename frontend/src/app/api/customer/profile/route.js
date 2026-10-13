import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireCustomerAuth } from "../../../../lib/rbac";
import { updateProfileSchema } from "../../../../lib/validators";

export async function GET(request) {
  const auth = await requireCustomerAuth(request);
  if (!auth.authenticated) return auth.response;

  const c = auth.customer;
  return NextResponse.json({
    success: true,
    customer: {
      id: c.customerId,
      internalId: c.id,
      customerId: c.customerId,
      name: c.name,
      email: c.email,
      phone: c.phone || "",
      status: c.status,
      avatar: c.avatar,
      savedAddresses: c.addresses || [],
      createdAt: c.createdAt,
    },
  });
}

export async function PUT(request) {
  const auth = await requireCustomerAuth(request);
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { name, phone, avatar } = validation.data;
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim() || null;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updated = await prisma.customer.update({
      where: { id: auth.customer.id },
      data: updateData,
      include: { addresses: true },
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: updated.customerId,
        internalId: updated.id,
        customerId: updated.customerId,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || "",
        status: updated.status,
        avatar: updated.avatar,
        savedAddresses: updated.addresses || [],
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
