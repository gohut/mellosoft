import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { requireCustomerAuth } from "../../../lib/rbac";
import { toggleWishlistSchema } from "../../../lib/validators";

export async function GET(request) {
  const auth = await requireCustomerAuth(request);
  if (!auth.authenticated) return auth.response;

  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { customerId: auth.customer.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: { take: 1, orderBy: { displayOrder: "asc" } } },
            },
          },
        },
      },
    });

    const items = (wishlist?.items || []).map((item) => {
      const p = item.product;
      return {
        id: item.id,
        productId: item.productId,
        name: p?.name,
        price: p?.price,
        actualPrice: p?.actualPrice,
        discountPercent: p?.discountPercent,
        rating: p?.rating,
        image: p?.images?.[0]?.url || "/asset/img1.jpg",
        addedAt: item.addedAt,
      };
    });

    return NextResponse.json({ success: true, wishlist: items });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireCustomerAuth(request);
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const validation = toggleWishlistSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Valid productId required" }, { status: 400 });
    }

    const { productId } = validation.data;

    const wishlist = await prisma.wishlist.upsert({
      where: { customerId: auth.customer.id },
      update: {},
      create: { customerId: auth.customer.id },
    });

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    let isAdded = false;
    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      isAdded = false;
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
      isAdded = true;
    }

    return NextResponse.json({
      success: true,
      productId,
      inWishlist: isAdded,
      message: isAdded ? "Added to wishlist" : "Removed from wishlist",
    });
  } catch (error) {
    console.error("Wishlist toggle error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
