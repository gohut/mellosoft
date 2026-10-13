import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireCustomerAuth } from "../../../../../lib/rbac";
import { addressSchema } from "../../../../../lib/validators";

export async function PUT(request, { params }) {
  const auth = await requireCustomerAuth(request);
  if (!auth.authenticated) return auth.response;

  const { id } = await params;

  try {
    // Verify ownership
    const existing = await prisma.customerAddress.findUnique({ where: { id } });
    if (!existing || existing.customerId !== auth.customer.id) {
      return NextResponse.json({ success: false, error: "Address not found." }, { status: 404 });
    }

    const body = await request.json();
    const validation = addressSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = validation.data;
    if (data.isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: auth.customer.id, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.customerAddress.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, address: updated });
  } catch (error) {
    console.error("Address update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireCustomerAuth(request);
  if (!auth.authenticated) return auth.response;

  const { id } = await params;

  try {
    const existing = await prisma.customerAddress.findUnique({ where: { id } });
    if (!existing || existing.customerId !== auth.customer.id) {
      return NextResponse.json({ success: false, error: "Address not found." }, { status: 404 });
    }

    await prisma.customerAddress.delete({ where: { id } });

    // If deleted address was default, set another address as default if one exists
    if (existing.isDefault) {
      const remaining = await prisma.customerAddress.findFirst({
        where: { customerId: auth.customer.id },
        orderBy: { createdAt: "desc" },
      });
      if (remaining) {
        await prisma.customerAddress.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Address deleted successfully." });
  } catch (error) {
    console.error("Address deletion error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
