import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCustomerSession } from "../../../lib/auth";
import { calculateAuthoritativeTotals } from "../../../lib/pricing";

export async function GET(request) {
  try {
    const auth = await getCustomerSession(request);
    const guestToken = request.headers.get("x-guest-token");

    let cart = null;

    if (auth.authenticated && auth.customer) {
      cart = await prisma.cart.findUnique({
        where: { customerId: auth.customer.id },
        include: {
          items: {
            include: {
              product: {
                include: { images: { take: 1, orderBy: { displayOrder: "asc" } } },
              },
              variant: true,
            },
          },
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { customerId: auth.customer.id },
          include: { items: true },
        });
      }
    } else if (guestToken) {
      cart = await prisma.cart.findUnique({
        where: { guestSessionToken: guestToken },
        include: {
          items: {
            include: {
              product: {
                include: { images: { take: 1, orderBy: { displayOrder: "asc" } } },
              },
              variant: true,
            },
          },
        },
      });
    }

    if (!cart || !cart.items) {
      return NextResponse.json({
        success: true,
        items: [],
        totals: calculateAuthoritativeTotals([]),
      });
    }

    // Format cart items with authoritative prices
    const formattedItems = cart.items.map((item) => {
      const p = item.product;
      const v = item.variant;
      const actualPrice = v ? v.actualPrice : (p?.actualPrice || 0);
      const discountPercent = v ? v.discountPercent : (p?.discountPercent || 0);
      const unitPrice = v ? v.discountedPrice : (p?.price || actualPrice);
      const primaryImg = p?.images?.[0]?.url || "/asset/img1.jpg";

      return {
        id: item.id,
        cartItemId: item.id,
        productId: item.productId,
        variantId: item.variantId,
        name: p?.name || "Product",
        productName: p?.name || "Product",
        size: item.size || v?.size || "Queen",
        firmness: item.firmness || v?.firmness || "Medium",
        dimension: item.dimension || v?.dimension || "",
        thickness: item.thickness || v?.thickness || "",
        sku: item.sku || v?.sku || "",
        quantity: item.quantity,
        qty: item.quantity,
        price: unitPrice,
        actualPrice,
        discountPercent,
        image: primaryImg,
        stockStatus: v ? (v.stock > 5 ? "In Stock" : v.stock > 0 ? "Low Stock" : "Out of Stock") : "In Stock",
      };
    });

    const totals = calculateAuthoritativeTotals(formattedItems);

    return NextResponse.json({
      success: true,
      cartId: cart.id,
      items: formattedItems,
      totals,
    });
  } catch (error) {
    console.error("Cart retrieval error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await getCustomerSession(request);
    const guestToken = request.headers.get("x-guest-token");

    let cartId = null;

    if (auth.authenticated && auth.customer) {
      const cart = await prisma.cart.findUnique({ where: { customerId: auth.customer.id } });
      cartId = cart?.id;
    } else if (guestToken) {
      const cart = await prisma.cart.findUnique({ where: { guestSessionToken: guestToken } });
      cartId = cart?.id;
    }

    if (cartId) {
      await prisma.cartItem.deleteMany({ where: { cartId } });
    }

    return NextResponse.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
