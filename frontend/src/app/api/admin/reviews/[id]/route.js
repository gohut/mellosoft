import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireAdminPermission } from "../../../../../lib/rbac";
import { moderateReviewSchema } from "../../../../../lib/validators";

export async function PUT(request, { params }) {
  const auth = await requireAdminPermission(request, "reviews", "moderate");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const body = await request.json();
    const validation = moderateReviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Invalid moderation payload" },
        { status: 400 }
      );
    }

    const { status, showOnHome } = validation.data;
    const updateData = {};
    if (status) updateData.status = status;
    if (showOnHome !== undefined) updateData.showOnHome = showOnHome;

    const updated = await prisma.review.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        adminUserId: auth.user.id,
        action: "MODERATE_REVIEW",
        resource: "reviews",
        resourceId: id,
        details: { status: updated.status, showOnHome: updated.showOnHome },
      },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error("Admin review moderation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdminPermission(request, "reviews", "delete");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    await prisma.review.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminUserId: auth.user.id,
        action: "DELETE_REVIEW",
        resource: "reviews",
        resourceId: id,
      },
    });

    return NextResponse.json({ success: true, message: "Review deleted successfully." });
  } catch (error) {
    console.error("Admin review delete error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
