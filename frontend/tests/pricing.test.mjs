import { describe, it } from "node:test";
import assert from "node:assert";
import { calculateAuthoritativeTotals, DEFAULT_PRICING_CONFIG } from "../src/lib/pricing.js";

describe("Pricing Engine & Tax Calculation Tests", () => {
  it("should calculate correct subtotal and apply standard shipping fee when under threshold", () => {
    const items = [
      { price: 2000, actualPrice: 2500, quantity: 2 } // subtotal = 4000
    ];
    const totals = calculateAuthoritativeTotals(items);

    assert.strictEqual(totals.subtotal, 4000);
    assert.strictEqual(totals.rawTotal, 5000);
    assert.strictEqual(totals.discountSavings, 1000);
    assert.strictEqual(totals.isFreeShipping, false);
    assert.strictEqual(totals.shipping, DEFAULT_PRICING_CONFIG.standardShippingFee); // 499
    assert.strictEqual(totals.tax, Math.round((4000 * 18) / 100)); // 720
    assert.strictEqual(totals.finalTotal, 4000 + 720 + 499); // 5219
  });

  it("should grant free shipping when subtotal exceeds threshold", () => {
    const items = [
      { price: 6000, actualPrice: 8000, quantity: 1 } // subtotal = 6000 (> 5000 threshold)
    ];
    const totals = calculateAuthoritativeTotals(items);

    assert.strictEqual(totals.subtotal, 6000);
    assert.strictEqual(totals.isFreeShipping, true);
    assert.strictEqual(totals.shipping, 0);
    assert.strictEqual(totals.tax, Math.round((6000 * 18) / 100)); // 1080
    assert.strictEqual(totals.finalTotal, 6000 + 1080); // 7080
  });

  it("should apply percentage coupon with discount cap", () => {
    const items = [
      { price: 10000, actualPrice: 10000, quantity: 1 }
    ];
    const coupon = {
      code: "WELCOME10",
      status: "Active",
      discountType: "percentage",
      discountValue: 10, // 10% = 1000
      maxDiscount: 500,  // capped at 500
      minOrderValue: 2000
    };
    const totals = calculateAuthoritativeTotals(items, {}, coupon);

    assert.strictEqual(totals.subtotal, 10000);
    assert.strictEqual(totals.couponDiscount, 500); // capped
    const effective = 10000 - 500; // 9500
    assert.strictEqual(totals.tax, Math.round((9500 * 18) / 100)); // 1710
    assert.strictEqual(totals.finalTotal, 9500 + 1710); // 11210
  });

  it("should reject coupon when order subtotal is below minimum order value", () => {
    const items = [
      { price: 1000, actualPrice: 1000, quantity: 1 }
    ];
    const coupon = {
      code: "BIGSAVE",
      status: "Active",
      discountType: "fixed",
      discountValue: 300,
      minOrderValue: 3000
    };
    const totals = calculateAuthoritativeTotals(items, {}, coupon);

    assert.strictEqual(totals.subtotal, 1000);
    assert.strictEqual(totals.couponDiscount, 0); // Not applied
  });
});
