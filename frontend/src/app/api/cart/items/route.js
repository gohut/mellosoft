import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCustomerSession } from "../../../../lib/auth";
import { addToCartSchema } from "../../../../lib/validators";

export async function POST(request) {
  try {
    const auth = await getCustomerSession(request);
    let guestToken = request.headers.get("x-guest-token");

    const body = await request.json();
    const validation = addToCartSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { productId, variantId, size, firmness, dimension, thickness, sku, quantity } = validation.data;

    // Verify product exists and is active (supporting both slug and canonical productId)
    let product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      product = await prisma.product.findFirst({
        where: {
          OR: [
            { productId: productId },
            { id: productId.toLowerCase() },
            { productId: productId.toUpperCase() },
          ],
        },
        include: { variants: true },
      });
    }

    if (!product || !product.active) {
      return NextResponse.json({ success: false, error: "Product unavailable." }, { status: 404 });
    }

    // Resolve variant
    let resolvedVariant = null;
    if (variantId) {
      resolvedVariant = product.variants.find((v) => v.id === variantId) || null;
    } else if (sku) {
      resolvedVariant = product.variants.find((v) => v.sku === sku) || null;
    } else if (size || firmness || thickness || dimension) {
      resolvedVariant = product.variants.find((v) => {
        const matchSize = !size || v.size === size;
        const matchFirm = !firmness || v.firmness === firmness;
        const matchThick = !thickness || v.thickness === thickness;
        const matchDim = !dimension || v.dimension === dimension;
        return matchSize && matchFirm && matchThick && matchDim;
      }) || product.variants[0] || null;
    }

    // Check stock
    if (resolvedVariant && resolvedVariant.stock <= 0) {
      return NextResponse.json(
        { success: false, error: "Selected variant is currently out of stock." },
        { status: 400 }
      );
    }

    // Find or create cart
    let cart = null;
    if (auth.authenticated && auth.customer) {
      cart = await prisma.cart.upsert({
        where: { customerId: auth.customer.id },
        update: {},
        create: { customerId: auth.customer.id },
      });
    } else {
      if (!guestToken) {
        guestToken = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }
      cart = await prisma.cart.upsert({
        where: { guestSessionToken: guestToken },
        update: {},
        create: { guestSessionToken: guestToken },
      });
    }

    // Check if matching item already exists in cart using canonical product.id
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        variantId: resolvedVariant?.id || null,
        size: size || resolvedVariant?.size || null,
        firmness: firmness || resolvedVariant?.firmness || null,
      },
    });

    let savedItem;
    if (existingItem) {
      savedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      savedItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: resolvedVariant?.id || null,
          size: size || resolvedVariant?.size || null,
          firmness: firmness || resolvedVariant?.firmness || null,
          dimension: dimension || resolvedVariant?.dimension || null,
          thickness: thickness || resolvedVariant?.thickness || null,
          sku: sku || resolvedVariant?.sku || null,
          quantity,
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      item: savedItem,
      guestToken: !auth.authenticated ? guestToken : undefined,
    });

    if (!auth.authenticated && guestToken) {
      response.headers.set("x-guest-token", guestToken);
    }

    return response;
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
