import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCustomerSession } from "../../../lib/auth";
import { checkoutOrderSchema } from "../../../lib/validators";
import { calculateAuthoritativeTotals } from "../../../lib/pricing";
import { createPaymentOrder } from "../../../lib/payments";

export async function POST(request) {
  try {
    const auth = await getCustomerSession(request);
    const body = await request.json();

    const validation = checkoutOrderSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const { items: clientItems, shippingAddress, paymentMethod, notes, couponCode } = validation.data;

    if (!clientItems || clientItems.length === 0) {
      return NextResponse.json({ success: false, error: "Checkout cart is empty." }, { status: 400 });
    }

    // 1. Authoritative Catalog & Variant Verification
    const authoritativeItems = [];
    const variantStockChecks = [];

    for (const item of clientItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: true,
          images: { take: 1, orderBy: { displayOrder: "asc" } },
        },
      });

      if (!product || !product.active) {
        return NextResponse.json(
          { success: false, error: `Product "${item.name || item.productId}" is no longer available.` },
          { status: 400 }
        );
      }

      // Resolve variant
      let variant = null;
      if (item.variantId) {
        variant = product.variants.find((v) => v.id === item.variantId) || null;
      } else if (item.sku) {
        variant = product.variants.find((v) => v.sku === item.sku) || null;
      } else if (item.size || item.firmness || item.thickness || item.dimension) {
        variant = product.variants.find((v) => {
          const matchSize = !item.size || v.size === item.size;
          const matchFirm = !item.firmness || v.firmness === item.firmness;
          const matchThick = !item.thickness || v.thickness === item.thickness;
          const matchDim = !item.dimension || v.dimension === item.dimension;
          return matchSize && matchFirm && matchThick && matchDim;
        }) || product.variants[0] || null;
      } else {
        variant = product.variants[0] || null;
      }

      const qty = Math.max(1, Number(item.quantity || 1));

      // Check authoritative stock
      if (variant) {
        if (variant.stock < qty) {
          return NextResponse.json(
            {
              success: false,
              error: `Insufficient stock for "${product.name}" (${variant.size || "Standard"}). Available: ${variant.stock}, requested: ${qty}.`,
            },
            { status: 409 }
          );
        }
        variantStockChecks.push({ variantId: variant.id, qty });
      }

      const unitPrice = variant ? variant.discountedPrice : (product.price || product.actualPrice);
      const actualPrice = variant ? variant.actualPrice : product.actualPrice;
      const discountPercent = variant ? variant.discountPercent : product.discountPercent;
      const primaryImg = product.images?.[0]?.url || "/asset/img1.jpg";

      authoritativeItems.push({
        productId: product.id,
        variantId: variant?.id || null,
        productName: product.name,
        sku: variant?.sku || `MEL-${product.id.toUpperCase()}-STD`,
        size: item.size || variant?.size || null,
        firmness: item.firmness || variant?.firmness || null,
        dimension: item.dimension || variant?.dimension || null,
        thickness: item.thickness || variant?.thickness || null,
        quantity: qty,
        price: unitPrice,
        actualPrice,
        discountPercent,
        image: primaryImg,
      });
    }

    // 2. Fetch Global Store Settings
    const settingsRecord = await prisma.applicationSettings.findUnique({
      where: { id: "global_settings" },
    });
    const storeSettings = settingsRecord?.data || {};

    // 3. Coupon Verification
    let verifiedCoupon = null;
    if (couponCode && couponCode.trim()) {
      verifiedCoupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });
    }

    // 4. Calculate Authoritative Totals
    const totals = calculateAuthoritativeTotals(authoritativeItems, storeSettings, verifiedCoupon);

    // 5. Generate Unique Order Number
    const timestampSuffix = Date.now().toString().slice(-4);
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const generatedOrderId = `MS-${timestampSuffix}${randPart}`;

    const customerEmail = auth.customer?.email || shippingAddress.fullName ? `${shippingAddress.phone}@mellosoft.com` : "customer@mellosoft.com";
    const customerName = shippingAddress.fullName || auth.customer?.name || "Customer";
    const customerPhone = shippingAddress.phone || auth.customer?.phone || "";

    // 6. Execute Atomic Transaction (Stock Decrement + Order Creation)
    const result = await prisma.$transaction(async (tx) => {
      // Decrement stock atomically
      for (const check of variantStockChecks) {
        await tx.productVariant.update({
          where: { id: check.variantId },
          data: { stock: { decrement: check.qty } },
        });
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          id: generatedOrderId,
          orderNumber: generatedOrderId,
          customerId: auth.customer?.id || null,
          customerName,
          email: customerEmail,
          phone: customerPhone,
          shippingAddress: shippingAddress,
          paymentMethod,
          paymentStatus: paymentMethod === "COD" ? "Pending" : "Pending",
          orderStatus: paymentMethod === "COD" ? "Confirmed" : "Pending",
          subtotal: totals.subtotal,
          discountAmount: totals.discountSavings,
          couponCode: verifiedCoupon ? verifiedCoupon.code : null,
          couponDiscount: totals.couponDiscount,
          taxAmount: totals.tax,
          shippingAmount: totals.shipping,
          totalAmount: totals.finalTotal,
          currency: "INR",
          notes: notes || null,
          expectedDeliveryStart: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          expectedDeliveryEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          items: {
            create: authoritativeItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              sku: item.sku,
              size: item.size,
              firmness: item.firmness,
              dimension: item.dimension,
              thickness: item.thickness,
              quantity: item.quantity,
              price: item.price,
              actualPrice: item.actualPrice,
              discountPercent: item.discountPercent,
              image: item.image,
              total: item.price * item.quantity,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Clear customer cart if authenticated
      if (auth.customer) {
        const cart = await tx.cart.findUnique({ where: { customerId: auth.customer.id } });
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
      }

      return newOrder;
    });

    // 7. Initialize Payment Provider Intent
    const paymentResult = await createPaymentOrder(result, paymentMethod);

    return NextResponse.json({
      success: true,
      order: {
        id: result.id,
        orderId: result.id,
        orderNumber: result.orderNumber,
        totalAmount: result.totalAmount,
        subtotal: result.subtotal,
        tax: result.taxAmount,
        shipping: result.shippingAmount,
        discount: result.discountAmount,
        paymentStatus: result.paymentStatus,
        orderStatus: result.orderStatus,
        paymentMethod: result.paymentMethod,
        items: result.items,
        shippingAddress: result.shippingAddress,
        createdAt: result.createdAt,
      },
      payment: paymentResult.clientPayload || null,
    }, { status: 201 });
  } catch (error) {
    console.error("Checkout transaction error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Checkout failed. Please try again." },
      { status: 500 }
    );
  }
}
