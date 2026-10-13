import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const parentCategory = searchParams.get("parentCategory");
    const search = searchParams.get("search") || searchParams.get("q");
    const sort = searchParams.get("sort") || "recommended";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "40", 10)));
    const featured = searchParams.get("featured");
    const bestSeller = searchParams.get("bestseller");
    const newArrival = searchParams.get("newarrival");

    const where = {
      active: true,
    };

    if (category && category !== "All") {
      where.categorySlug = category.toLowerCase().trim();
    }

    if (parentCategory && parentCategory !== "All") {
      where.parentCategorySlug = parentCategory.toLowerCase().trim();
    }

    if (featured === "true") where.isFeatured = true;
    if (bestSeller === "true") where.isBestSeller = true;
    if (newArrival === "true") where.isNewArrival = true;

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { tagline: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { categorySlug: { contains: q, mode: "insensitive" } },
      ];
    }

    let orderBy = [{ createdAt: "desc" }];
    if (sort === "price_asc" || sort === "Price: Low to High") {
      orderBy = [{ price: "asc" }];
    } else if (sort === "price_desc" || sort === "Price: High to Low") {
      orderBy = [{ price: "desc" }];
    } else if (sort === "rating" || sort === "Customer Rating") {
      orderBy = [{ rating: "desc" }];
    } else if (sort === "name") {
      orderBy = [{ name: "asc" }];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: {
            orderBy: { displayOrder: "asc" },
          },
          variants: true,
        },
      }),
    ]);

    // Format products for storefront consistency
    const formatted = products.map((p) => {
      const primaryImg = p.images?.find((img) => img.isPrimary)?.url || p.images[0]?.url || "/asset/img1.jpg";
      return {
        ...p,
        image: primaryImg,
        images: p.images.map((img) => img.url),
      };
    });

    return NextResponse.json({
      success: true,
      products: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products listing API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load product catalog." },
      { status: 500 }
    );
  }
}
