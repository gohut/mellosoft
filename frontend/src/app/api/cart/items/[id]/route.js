import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { updateCartItemSchema } from "../../../../../lib/validators";

export async function PUT(request, { params }) {
  const { id } = await params;

  try {
    const body = await request.json();
    const validation = updateCartItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Invalid quantity" }, { status: 400 });
    }

    const { quantity } = validation.data;

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id } }).catch(() => {});
      return NextResponse.json({ success: true, message: "Item removed" });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Update cart item error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    await prisma.cartItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Item removed" });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
