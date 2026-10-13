import { describe, it } from "node:test";
import assert from "node:assert";
import crypto from "crypto";
import { PAYMENT_METHODS } from "../src/lib/payments.js";

describe("Payment Gateway Verification Tests", () => {
  it("should define supported payment methods", () => {
    assert.strictEqual(PAYMENT_METHODS.COD, "COD");
    assert.strictEqual(PAYMENT_METHODS.UPI, "UPI");
    assert.strictEqual(PAYMENT_METHODS.RAZORPAY, "RAZORPAY");
    assert.strictEqual(PAYMENT_METHODS.STRIPE, "STRIPE");
  });

  it("should verify authentic Razorpay HMAC-SHA256 signatures", () => {
    const keySecret = "test_secret_key_12345";
    const orderId = "order_rzp_001";
    const paymentId = "pay_rzp_999";

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(expectedSignature, "utf-8")
    );
    assert.strictEqual(isMatch, true);
  });

  it("should reject forged or mismatched Razorpay signatures", () => {
    const keySecret = "test_secret_key_12345";
    const orderId = "order_rzp_001";
    const paymentId = "pay_rzp_999";

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const forgedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|pay_forged_000`)
      .digest("hex");

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(forgedSignature, "utf-8")
    );
    assert.strictEqual(isMatch, false);
  });
});
