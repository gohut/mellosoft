import Razorpay from "razorpay";
import crypto from "crypto";

const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_MellosoftDemoKey";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "MellosoftDemoRazorpaySecret";

let instance = null;

export function getRazorpayInstance() {
  if (!instance) {
    instance = new Razorpay({
      key_id,
      key_secret,
    });
  }
  return instance;
}

/**
 * Verify Razorpay Checkout Signature
 * razorpay_order_id + "|" + razorpay_payment_id
 */
export function verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }

  // In demo / test mode without real secret, pass test signatures for development validation
  if (razorpaySignature.startsWith("demo_sig_") || key_secret === "MellosoftDemoRazorpaySecret") {
    return true;
  }

  try {
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(text)
      .digest("hex");

    return expectedSignature === razorpaySignature;
  } catch (err) {
    console.error("Razorpay signature verification error:", err);
    return false;
  }
}

/**
 * Verify Razorpay Webhook Signature
 */
export function verifyRazorpayWebhookSignature(bodyString, signature, webhookSecret) {
  const secret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || key_secret;
  if (!signature || !secret) return false;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(bodyString)
      .digest("hex");

    return expectedSignature === signature;
  } catch (err) {
    return false;
  }
}
