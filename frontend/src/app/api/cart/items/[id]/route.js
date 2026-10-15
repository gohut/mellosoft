import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCustomerSession } from "../../../../../lib/auth";
import { updateCartItemSchema } from "../../../../../lib/validators";

async function resolveCartItem(id, request) {
  // 1. Try direct primary key lookup
  try {
    const direct = await prisma.cartItem.findUnique({ where: { id } });
    if (direct) return direct;
  } catch {}

  // 2. Resolve cart by customer session or guest token
  const auth = await getCustomerSession(request).catch(() => ({ authenticated: false }));
  const guestToken = request.headers.get("x-guest-token");

  let cart = null;
  if (auth.authenticated && auth.customer) {
    cart = await prisma.cart.findUnique({
      where: { customerId: auth.customer.id },
      include: { items: true },
    }).catch(() => null);
  } else if (guestToken) {
    cart = await prisma.cart.findUnique({
      where: { guestSessionToken: guestToken },
      include: { items: true },
    }).catch(() => null);
  }

  if (!cart || !cart.items || cart.items.length === 0) return null;

  // Match composite key: `${productId}-${firmness}-${size}` or productId
  const matched = cart.items.find(
    (item) =>
      item.id === id ||
      `${item.productId}-${item.firmness}-${item.size}` === id ||
      item.productId === id
  );

  return matched || null;
}

export async function PUT(request, { params }) {
  const { id } = await params;

  try {
    const body = await request.json();
    const validation = updateCartItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Invalid quantity" }, { status: 400 });
    }

    const { quantity } = validation.data;
    const targetItem = await resolveCartItem(id, request);

    if (!targetItem) {
      return NextResponse.json({ success: false, error: "Cart item not found" }, { status: 404 });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: targetItem.id } }).catch(() => {});
      return NextResponse.json({ success: true, message: "Item removed" });
    }

    const updated = await prisma.cartItem.update({
      where: { id: targetItem.id },
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
    const targetItem = await resolveCartItem(id, request);
    if (targetItem) {
      await prisma.cartItem.delete({ where: { id: targetItem.id } });
    }
    return NextResponse.json({ success: true, message: "Item removed" });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
