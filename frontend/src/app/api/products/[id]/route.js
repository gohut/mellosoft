import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: id },
          { productId: id.toUpperCase() },
        ],
      },
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
        variants: {
          orderBy: [{ actualPrice: "asc" }],
        },
        reviews: {
          where: { status: "Approved" },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    const primaryImg = product.images?.find((img) => img.isPrimary)?.url || product.images[0]?.url || "/asset/img1.jpg";

    const formatted = {
      ...product,
      image: primaryImg,
      images: product.images.length > 0 ? product.images.map((img) => img.url) : [primaryImg],
      reviews: product.reviews.map((r) => ({
        id: r.id,
        author: r.customerName,
        rating: r.rating,
        date: r.createdAt.toISOString().split("T")[0],
        content: r.comment,
        title: r.title,
        helpfulCount: r.helpfulCount,
        verifiedPurchase: r.verifiedPurchase,
      })),
    };

    return NextResponse.json({ success: true, product: formatted });
  } catch (error) {
    console.error("Product detail error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
