import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || searchParams.get("query") || "").trim();
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, results: [], total: 0 });
    }

    const products = await prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { tagline: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { categorySlug: { contains: query, mode: "insensitive" } },
          { specs: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      include: {
        images: { orderBy: { displayOrder: "asc" }, take: 1 },
      },
    });

    const results = products.map((p) => ({
      id: p.id,
      productId: p.productId,
      name: p.name,
      tagline: p.tagline,
      category: p.categorySlug,
      price: p.price,
      discountPercent: p.discountPercent,
      rating: p.rating,
      image: p.images[0]?.url || "/asset/img1.jpg",
    }));

    return NextResponse.json({
      success: true,
      query,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
