import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCustomerSession } from "../../../lib/auth";
import { createReviewSchema } from "../../../lib/validators";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const where = { status: "Approved" };
    if (productId) where.productId = productId;

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        product: { select: { name: true, id: true } },
      },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await getCustomerSession(request);
    const body = await request.json();

    const validation = createReviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Invalid review payload" },
        { status: 400 }
      );
    }

    const { productId, rating, title, comment } = validation.data;

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    const customerName = auth.customer?.name || body.author || body.customerName || "Verified Buyer";

    const review = await prisma.review.create({
      data: {
        productId,
        customerId: auth.customer?.id || null,
        customerName,
        rating,
        title: title || null,
        comment,
        status: "Approved", // Approved by default or configurable
        verifiedPurchase: Boolean(auth.customer),
      },
    });

    // Recalculate product average rating and count
    const aggregations = await prisma.review.aggregate({
      where: { productId, status: "Approved" },
      _avg: { rating: true },
      _count: { rating: true },
    });

    if (aggregations._count.rating > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: Number((aggregations._avg.rating || 4.8).toFixed(1)),
          reviewCount: aggregations._count.rating,
        },
      });
    }

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
