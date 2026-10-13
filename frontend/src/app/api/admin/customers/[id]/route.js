import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireAdminPermission } from "../../../../../lib/rbac";

export async function GET(request, { params }) {
  const auth = await requireAdminPermission(request, "customers", "view");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [{ id: id }, { customerId: id }],
      },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: "desc" },
          include: { items: true },
        },
        cart: {
          include: {
            items: {
              include: {
                product: { include: { images: { take: 1 } } },
                variant: true,
              },
            },
          },
        },
        wishlist: {
          include: {
            items: {
              include: {
                product: { include: { images: { take: 1 } } },
              },
            },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer not found." }, { status: 404 });
    }

    const paidOrders = customer.orders.filter((o) => o.paymentStatus === "Paid" || o.orderStatus === "Delivered");
    const totalSpent = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue = paidOrders.length > 0 ? Math.round(totalSpent / paidOrders.length) : 0;

    // Format active cart items for the customer profile modal cart section
    const cartItems = (customer.cart?.items || []).map((ci) => {
      const p = ci.product;
      const v = ci.variant;
      const actualPrice = v?.actualPrice || p?.actualPrice || 0;
      const discountPercent = v?.discountPercent || p?.discountPercent || 0;
      const unitPrice = v?.discountedPrice || p?.price || actualPrice;

      return {
        cartItemId: ci.id,
        customerId: customer.customerId,
        productId: ci.productId,
        productName: p?.name,
        variantSize: ci.size || v?.size || "Standard",
        variantFirmness: ci.firmness || v?.firmness || "Medium",
        variantSKU: ci.sku || v?.sku || "",
        quantity: ci.quantity,
        actualPrice,
        discountPercent,
        discountPrice: unitPrice,
        price: unitPrice,
        itemTotal: unitPrice * ci.quantity,
        image: p?.images?.[0]?.url || "/asset/img1.jpg",
        stockStatus: v ? (v.stock > 5 ? "In Stock" : v.stock > 0 ? "Low Stock" : "Out of Stock") : "In Stock",
        addedAt: ci.addedAt.toISOString().split("T")[0],
      };
    });

    // Format wishlist items
    const wishlistItems = (customer.wishlist?.items || []).map((wi) => {
      const p = wi.product;
      return {
        id: wi.productId,
        productId: wi.productId,
        name: p?.name,
        price: p?.price,
        actualPrice: p?.actualPrice,
        image: p?.images?.[0]?.url || "/asset/img1.jpg",
      };
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.customerId,
        internalId: customer.id,
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        status: customer.status,
        avatar: customer.avatar || customer.name.charAt(0).toUpperCase(),
        savedAddresses: customer.addresses,
        summary: {
          totalOrders: customer.orders.length,
          totalSpent,
          avgOrderValue,
        },
        orders: customer.orders,
        cartItems,
        wishlistItems,
      },
    });
  } catch (error) {
    console.error("Admin customer detail error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
