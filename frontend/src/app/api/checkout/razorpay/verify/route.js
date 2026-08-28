import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "../../../../../lib/razorpay";
import { getDb, schema } from "../../../../../db";
import { eq } from "drizzle-orm";
import { verifyToken } from "../../../../../lib/jwt";
import { sendOrderConfirmationEmail } from "../../../../../lib/mail";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      cartItems,
      shippingAddress,
      customerDetails,
    } = body;

    // Verify HMAC-SHA256 signature
    const isValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Payment signature verification failed. Potential transaction tampering detected." },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("ms_token")?.value;
    const token = authHeader || cookieToken;

    const tokenPayload = token ? verifyToken(token) : null;
    const customerId = tokenPayload ? tokenPayload.sub : customerDetails?.id || `CUS-${Date.now().toString().slice(-4)}`;
    const customerName = customerDetails?.name || tokenPayload?.name || "Luxury Sleeper";
    const customerEmail = customerDetails?.email || tokenPayload?.email || "customer@example.com";

    const db = getDb();
    const orderNumberStr = `MS-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    let subtotal = 0;
    const lineItemsToInsert = [];

    if (Array.isArray(cartItems)) {
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const unitPrice = Number(item.price || 899);
        const qty = Number(item.qty || item.quantity || 1);
        const itemTotal = unitPrice * qty;
        subtotal += itemTotal;

        lineItemsToInsert.push({
          id: `${orderNumberStr}-item-${i}`,
          orderId: orderNumberStr,
          productId: item.id || item.productId || "classic-mattress",
          productName: item.name || item.productName || "Mellosoft Sleep Product",
          variantId: `${item.productId}-${item.firmness}-${item.size}`,
          variantSize: item.size || item.variantSize || "Standard",
          variantFirmness: item.firmness || item.variantFirmness || "Medium",
          variantSKU: item.variantSKU || `SKU-${item.id}`,
          unitPrice,
          quantity: qty,
          itemTotal,
        });
      }
    }

    const deliveryFee = subtotal > 150 ? 0 : 30;
    const totalAmount = subtotal + deliveryFee;

    const newOrderRecord = {
      id: orderNumberStr,
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      customerId,
      customerName,
      customerEmail,
      customerPhone: customerDetails?.phone || "+91 98765 43210",
      shippingAddress: JSON.stringify(shippingAddress || { address: "123 Sleep Lane", city: "Bengaluru", state: "Karnataka", pincode: "560001" }),
      subtotal,
      deliveryFee,
      taxAmount: 0,
      totalAmount,
      paymentStatus: "Paid",
      paymentMethod: "Razorpay",
      razorpayOrderId: razorpayOrderId || `order_demo_${Date.now()}`,
      razorpayPaymentId: razorpayPaymentId || `pay_demo_${Date.now()}`,
      razorpaySignature: razorpaySignature || "demo_sig",
      orderStatus: "Processing",
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      try {
        await db.insert(schema.orders).values(newOrderRecord);
        for (const item of lineItemsToInsert) {
          await db.insert(schema.orderItems).values(item);
        }

        // Clear user's active cart in DB upon successful checkout
        if (customerId) {
          await db.delete(schema.carts).where(eq(schema.carts.customerId, customerId));
        }
      } catch (err) {
        console.warn("DB Order save error:", err.message);
      }
    }

    // Dispatch order confirmation email
    await sendOrderConfirmationEmail({
      to: customerEmail,
      order: newOrderRecord,
    });

    return NextResponse.json({
      success: true,
      orderNumber: orderNumberStr,
      order: newOrderRecord,
      message: "Payment verified and order placed successfully.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
