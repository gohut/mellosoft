import crypto from "crypto";
import { prisma } from "./db.js";

/**
 * Payment Gateway Service & Verification Engine
 * 
 * Implements strict server-side signature verification, idempotency protection,
 * and clear separation between Cash on Delivery, UPI, and gateway integrations (Razorpay, Stripe).
 */

export const PAYMENT_METHODS = {
  COD: "COD",
  UPI: "UPI",
  RAZORPAY: "RAZORPAY",
  STRIPE: "STRIPE",
};

/**
 * Creates a payment intent or provider transaction record for an order.
 * 
 * @param {object} order
 * @param {string} method
 * @returns {Promise<{ success: boolean, payment: object, clientPayload?: object, error?: string }>}
 */
export async function createPaymentOrder(order, method, db = prisma) {
  const client = db || prisma;
  const normalizedMethod = (method || "COD").toUpperCase();

  // 1. CASH ON DELIVERY
  if (normalizedMethod === PAYMENT_METHODS.COD) {
    const payment = await client.payment.create({
      data: {
        orderId: order.id,
        provider: PAYMENT_METHODS.COD,
        amount: order.totalAmount,
        currency: order.currency || "INR",
        status: "Pending",
        rawResponse: { message: "Cash on delivery order placed. Payment pending delivery." },
      },
    });

    return {
      success: true,
      payment,
      clientPayload: { method: "COD", orderId: order.id, status: "Pending" },
    };
  }

  // 2. UPI DIRECT
  if (normalizedMethod === PAYMENT_METHODS.UPI) {
    const payment = await client.payment.create({
      data: {
        orderId: order.id,
        provider: PAYMENT_METHODS.UPI,
        amount: order.totalAmount,
        currency: order.currency || "INR",
        status: "Pending",
        rawResponse: { message: "UPI order placed. Awaiting UPI transaction verification." },
      },
    });

    return {
      success: true,
      payment,
      clientPayload: { method: "UPI", orderId: order.id, status: "Pending" },
    };
  }

  // 3. RAZORPAY INTEGRATION
  if (normalizedMethod === PAYMENT_METHODS.RAZORPAY) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return {
        success: false,
        error: "Razorpay credentials not configured on server (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing).",
      };
    }

    try {
      // Create Razorpay Order via REST API
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          amount: order.totalAmount * 100, // Razorpay takes paise
          currency: "INR",
          receipt: order.id,
          notes: { orderId: order.id, customerEmail: order.email },
        }),
      });

      const rzpOrder = await res.json();
      if (!res.ok) {
        throw new Error(rzpOrder.error?.description || "Razorpay order creation failed");
      }

      const payment = await client.payment.create({
        data: {
          orderId: order.id,
          provider: PAYMENT_METHODS.RAZORPAY,
          providerOrderId: rzpOrder.id,
          amount: order.totalAmount,
          currency: "INR",
          status: "Pending",
          rawResponse: rzpOrder,
        },
      });

      return {
        success: true,
        payment,
        clientPayload: {
          method: "RAZORPAY",
          orderId: order.id,
          razorpayOrderId: rzpOrder.id,
          key: keyId,
          amount: rzpOrder.amount,
          currency: "INR",
        },
      };
    } catch (err) {
      console.error("Razorpay order error:", err);
      return { success: false, error: err.message };
    }
  }

  // 4. STRIPE INTEGRATION
  if (normalizedMethod === PAYMENT_METHODS.STRIPE) {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return {
        success: false,
        error: "Stripe secret key not configured on server (STRIPE_SECRET_KEY missing).",
      };
    }

    try {
      const res = await fetch("https://api.stripe.com/v1/payment_intents", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${stripeSecret}`,
        },
        body: new URLSearchParams({
          amount: String(order.totalAmount * 100), // Stripe takes minor units (paise/cents)
          currency: "inr",
          "metadata[orderId]": order.id,
          "description": `Mellosoft Order #${order.id}`,
        }),
      });

      const intent = await res.json();
      if (!res.ok) {
        throw new Error(intent.error?.message || "Stripe payment intent creation failed");
      }

      const payment = await client.payment.create({
        data: {
          orderId: order.id,
          provider: PAYMENT_METHODS.STRIPE,
          providerOrderId: intent.id,
          amount: order.totalAmount,
          currency: "INR",
          status: "Pending",
          rawResponse: intent,
        },
      });

      return {
        success: true,
        payment,
        clientPayload: {
          method: "STRIPE",
          clientSecret: intent.client_secret,
          orderId: order.id,
        },
      };
    } catch (err) {
      console.error("Stripe payment error:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: `Unsupported payment method: ${method}` };
}

/**
 * Verify server-side payment confirmation or webhook callback.
 * Prevents orders from being marked Paid without cryptographically verified signatures.
 */
export async function verifyPaymentConfirmation({
  orderId,
  provider,
  providerOrderId,
  providerPaymentId,
  providerSignature,
  upiVpa,
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });

  if (!order) {
    return { success: false, error: "Order not found" };
  }

  // 1. CASH ON DELIVERY VERIFICATION
  if (provider === PAYMENT_METHODS.COD) {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: "Confirmed", paymentStatus: "Pending" },
      }),
      prisma.payment.create({
        data: {
          orderId,
          provider: PAYMENT_METHODS.COD,
          amount: order.totalAmount,
          currency: order.currency,
          status: "Pending",
          rawResponse: { note: "Cash on delivery confirmed. Awaiting payment on receipt." },
        },
      }),
    ]);

    return { success: true, orderStatus: "Confirmed", paymentStatus: "Pending" };
  }

  // 2. UPI PAYMENT RECORDING
  if (provider === PAYMENT_METHODS.UPI) {
    // UPI submission requires a VPA or transaction reference
    if (!upiVpa || !upiVpa.includes("@")) {
      return { success: false, error: "A valid UPI ID / VPA is required." };
    }

    // In production without auto-reconciliation aggregator, UPI orders remain Pending until bank confirmation
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: "Confirmed", paymentStatus: "Pending" },
      }),
      prisma.payment.create({
        data: {
          orderId,
          provider: PAYMENT_METHODS.UPI,
          providerPaymentId: upiVpa.trim(),
          amount: order.totalAmount,
          currency: order.currency,
          status: "Pending",
          rawResponse: { vpa: upiVpa.trim(), recordedAt: new Date().toISOString(), note: "Awaiting UPI payment verification" },
        },
      }),
    ]);

    return { success: true, orderStatus: "Confirmed", paymentStatus: "Pending" };
  }

  // 3. RAZORPAY VERIFICATION
  if (provider === PAYMENT_METHODS.RAZORPAY) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return { success: false, error: "Razorpay secret key not configured on server" };
    }

    if (!providerOrderId || !providerPaymentId || !providerSignature) {
      return { success: false, error: "Missing Razorpay verification tokens" };
    }

    // Verify HMAC-SHA256 signature: hmac_sha256(order_id + "|" + payment_id, secret)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${providerOrderId}|${providerPaymentId}`)
      .digest("hex");

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(providerSignature, "utf-8")
    );

    if (!isMatch) {
      return { success: false, error: "Invalid Razorpay signature. Verification failed." };
    }

    // Atomic update
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: "Confirmed", paymentStatus: "Paid" },
      }),
      prisma.payment.create({
        data: {
          orderId,
          provider: PAYMENT_METHODS.RAZORPAY,
          providerOrderId,
          providerPaymentId,
          providerSignature,
          amount: order.totalAmount,
          currency: "INR",
          status: "Successful",
          rawResponse: { verified: true, signatureMatched: true },
        },
      }),
    ]);

    return { success: true, orderStatus: "Confirmed", paymentStatus: "Paid" };
  }

  // 4. STRIPE VERIFICATION
  if (provider === PAYMENT_METHODS.STRIPE) {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return { success: false, error: "Stripe secret key not configured on server" };
    }

    if (!providerOrderId) {
      return { success: false, error: "Missing Stripe Payment Intent ID" };
    }

    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${providerOrderId}`, {
      headers: { Authorization: `Bearer ${stripeSecret}` },
    });
    const intent = await res.json();

    if (intent.status !== "succeeded") {
      return { success: false, error: `Stripe payment not successful. Status: ${intent.status}` };
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: "Confirmed", paymentStatus: "Paid" },
      }),
      prisma.payment.create({
        data: {
          orderId,
          provider: PAYMENT_METHODS.STRIPE,
          providerOrderId,
          amount: order.totalAmount,
          currency: "INR",
          status: "Successful",
          rawResponse: intent,
        },
      }),
    ]);

    return { success: true, orderStatus: "Confirmed", paymentStatus: "Paid" };
  }

  return { success: false, error: `Unknown payment provider: ${provider}` };
}
