import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireAdminPermission } from "../../../../lib/rbac";

export async function GET(request) {
  const auth = await requireAdminPermission(request, "reviews", "view");
  if (!auth.authorized) return auth.response;

  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true } },
      },
    });

    const formatted = reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      product: r.product?.name || "Product",
      productName: r.product?.name || "Product",
      customer: r.customerName,
      customerName: r.customerName,
      rating: r.rating,
      comment: r.comment,
      review: r.comment,
      title: r.title,
      status: r.status,
      showOnHome: r.showOnHome,
      date: r.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json({ success: true, reviews: formatted });
  } catch (error) {
    console.error("Admin reviews list error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
