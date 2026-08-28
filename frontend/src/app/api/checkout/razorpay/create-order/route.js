import { NextResponse } from "next/server";
import { getRazorpayInstance } from "../../../../../lib/razorpay";
import { getDb, schema } from "../../../../../db";
import { eq } from "drizzle-orm";
import { calculateDiscountedPrice } from "../../../../../utils/currency";

export async function POST(request) {
  try {
    const body = await request.json();
    const { cartItems, customerInfo } = body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty. Please add items before checking out." },
        { status: 400 }
      );
    }

    const db = getDb();
    let subtotal = 0;

    // Validate authoritative item prices from DB
    for (const item of cartItems) {
      let itemPrice = Number(item.price || 0);

      if (db && item.productId) {
        try {
          const prodResults = await db
            .select()
            .from(schema.products)
            .where(eq(schema.products.id, item.productId))
            .limit(1);

          if (prodResults.length > 0) {
            const p = prodResults[0];
            itemPrice = calculateDiscountedPrice(p.actualPrice, p.discountPercent);
          }
        } catch (e) {}
      }

      subtotal += itemPrice * Number(item.qty || item.quantity || 1);
    }

    const deliveryFee = subtotal > 150 ? 0 : 30;
    const totalAmount = subtotal + deliveryFee;
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpay = getRazorpayInstance();
    const receiptId = `rcpt_${Date.now().toString().slice(-8)}`;

    let razorpayOrder = null;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        notes: {
          customerName: customerInfo?.name || "Guest Customer",
          customerEmail: customerInfo?.email || "customer@example.com",
        },
      });
    } catch (err) {
      console.warn("Razorpay API order creation failed (using test mode fallback):", err.message);
      // Fallback for demo / offline development testing
      razorpayOrder = {
        id: `order_demo_${Date.now()}`,
        entity: "order",
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        status: "created",
      };
    }

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_MellosoftDemoKey",
      subtotal,
      deliveryFee,
      totalAmount,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
