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
      const lookup = String(item.productId || item.id || "").trim();
      let product = await prisma.product.findUnique({
        where: { id: lookup },
        include: {
          variants: true,
          images: { take: 1, orderBy: { displayOrder: "asc" } },
        },
      });

      if (!product) {
        product = await prisma.product.findFirst({
          where: {
            OR: [
              { productId: lookup },
              { productId: lookup.toUpperCase() },
              { id: lookup.toLowerCase() },
              { id: lookup },
            ],
          },
          include: {
            variants: true,
            images: { take: 1, orderBy: { displayOrder: "asc" } },
          },
        });
      }

      if (!product || !product.active) {
        return NextResponse.json(
          { success: false, error: `Product "${item.name || item.productName || lookup}" is no longer available.` },
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

    const customerEmail =
      auth.customer?.email ||
      validation.data.email ||
      (shippingAddress.phone ? `${shippingAddress.phone.replace(/\D/g, "")}@mellosoft.com` : "customer@mellosoft.com");
    const customerName = shippingAddress.fullName || auth.customer?.name || "Customer";
    const customerPhone = shippingAddress.phone || auth.customer?.phone || "";

    // 6. Execute Atomic Transaction (Stock Decrement + Order Creation + Payment Intent)
    const { newOrder, paymentResult } = await prisma.$transaction(async (tx) => {
      // Idempotency: Prevent duplicate submissions within 5 seconds for the same customer/phone/email and total
      const recentDuplicate = await tx.order.findFirst({
        where: {
          OR: [
            ...(auth.customer?.id ? [{ customerId: auth.customer.id }] : []),
            { phone: customerPhone },
            { email: customerEmail },
          ],
          totalAmount: Math.round(totals.finalTotal),
          createdAt: { gte: new Date(Date.now() - 5000) },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      if (recentDuplicate) {
        return {
          newOrder: recentDuplicate,
          paymentResult: {
            success: true,
            clientPayload: {
              method: recentDuplicate.paymentMethod,
              orderId: recentDuplicate.id,
              status: recentDuplicate.paymentStatus,
            },
          },
        };
      }

      // Decrement stock atomically after verifying current stock level in transaction
      for (const check of variantStockChecks) {
        const currentVariant = await tx.productVariant.findUnique({
          where: { id: check.variantId },
          select: { stock: true, sku: true },
        });
        if (!currentVariant || currentVariant.stock < check.qty) {
          throw new Error(
            `Insufficient stock for item (${currentVariant?.sku || check.variantId}). Only ${currentVariant?.stock ?? 0} remaining, requested: ${check.qty}.`
          );
        }
        await tx.productVariant.update({
          where: { id: check.variantId },
          data: { stock: { decrement: check.qty } },
        });
      }

      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          id: generatedOrderId,
          orderNumber: generatedOrderId,
          customerId: auth.customer?.id || null,
          customerName,
          email: customerEmail,
          phone: customerPhone,
          shippingAddress: shippingAddress,
          paymentMethod,
          paymentStatus: "Pending", // Always Pending until genuine payment proof (even for COD / UPI)
          orderStatus: paymentMethod === "COD" ? "Confirmed" : "Pending",
          subtotal: Math.round(totals.subtotal),
          discountAmount: Math.round(totals.discountSavings),
          couponCode: verifiedCoupon ? verifiedCoupon.code : null,
          couponDiscount: Math.round(totals.couponDiscount),
          taxAmount: Math.round(totals.tax),
          shippingAmount: Math.round(totals.shipping),
          totalAmount: Math.round(totals.finalTotal),
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
              quantity: Math.round(item.quantity),
              price: Math.round(item.price),
              actualPrice: Math.round(item.actualPrice),
              discountPercent: Math.round(item.discountPercent),
              image: item.image,
              total: Math.round(item.price * item.quantity),
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Create Payment Record atomically inside transaction
      const pResult = await createPaymentOrder(createdOrder, paymentMethod, tx);
      if (!pResult.success) {
        throw new Error(pResult.error || "Payment initialization failed");
      }

      // Clear customer cart if authenticated
      if (auth.customer) {
        const cart = await tx.cart.findUnique({ where: { customerId: auth.customer.id } });
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
      }

      // Clear guest cart if guest session token header provided
      const guestToken = request.headers.get("x-guest-token");
      if (guestToken) {
        const guestCart = await tx.cart.findUnique({ where: { guestSessionToken: guestToken } });
        if (guestCart) {
          await tx.cartItem.deleteMany({ where: { cartId: guestCart.id } });
        }
      }

      return { newOrder: createdOrder, paymentResult: pResult };
    });

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        totalAmount: newOrder.totalAmount,
        subtotal: newOrder.subtotal,
        tax: newOrder.taxAmount,
        shipping: newOrder.shippingAmount,
        discount: newOrder.discountAmount,
        paymentStatus: newOrder.paymentStatus,
        orderStatus: newOrder.orderStatus,
        paymentMethod: newOrder.paymentMethod,
        items: newOrder.items,
        shippingAddress: newOrder.shippingAddress,
        createdAt: newOrder.createdAt,
      },
      payment: paymentResult?.clientPayload || null,
    }, { status: 201 });
  } catch (error) {
    console.error("Checkout transaction error:", error);
    const isConflict = error.message && error.message.includes("Insufficient stock");
    return NextResponse.json(
      { success: false, error: error.message || "Checkout failed. Please try again." },
      { status: isConflict ? 409 : 500 }
    );
  }
}
