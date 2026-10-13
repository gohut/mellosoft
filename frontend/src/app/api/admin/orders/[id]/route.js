import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireAdminPermission } from "../../../../../lib/rbac";
import { adminOrderStatusUpdateSchema } from "../../../../../lib/validators";

export async function GET(request, { params }) {
  const auth = await requireAdminPermission(request, "orders", "view");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: {
        items: true,
        payments: true,
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Admin order detail error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdminPermission(request, "orders", "updateStatus");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const body = await request.json();
    const validation = adminOrderStatusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Invalid status payload" },
        { status: 400 }
      );
    }

    const { orderStatus, paymentStatus } = validation.data;
    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id },
        data: updateData,
        include: { items: true, payments: true },
      });

      await tx.auditLog.create({
        data: {
          adminUserId: auth.user.id,
          action: "UPDATE_ORDER_STATUS",
          resource: "orders",
          resourceId: id,
          details: {
            oldOrderStatus: existing.orderStatus,
            newOrderStatus: ord.orderStatus,
            oldPaymentStatus: existing.paymentStatus,
            newPaymentStatus: ord.paymentStatus,
          },
        },
      });

      return ord;
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
