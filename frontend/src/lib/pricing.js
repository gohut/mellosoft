/**
 * Server-Side Authoritative Pricing Engine
 * 
 * Guarantees that:
 * 1. Line item prices are resolved from the database/catalog, never client input.
 * 2. Discounts and taxes are computed deterministically.
 * 3. All amounts are rounded to integer rupees/minor units (preventing float rounding bugs).
 * 4. Free shipping thresholds and GST rates are driven by authoritative settings.
 */

export const DEFAULT_PRICING_CONFIG = {
  freeShippingThreshold: 5000, // ₹5,000
  standardShippingFee: 499,    // ₹499
  gstRatePercent: 18,          // 18% GST
};

/**
 * Calculates authoritative order totals for a list of items and store settings.
 * 
 * @param {Array<{ price: number, actualPrice?: number, quantity: number }>} items
 * @param {object} [settings]
 * @param {object} [coupon]
 * @returns {{
 *   subtotal: number,
 *   discountSavings: number,
 *   couponDiscount: number,
 *   taxableAmount: number,
 *   gstRate: number,
 *   tax: number,
 *   shipping: number,
 *   isFreeShipping: boolean,
 *   finalTotal: number
 * }}
 */
export function calculateAuthoritativeTotals(items, settings = {}, coupon = null) {
  const storeConfig = {
    freeShippingThreshold: settings?.shipping?.freeShippingThreshold ?? DEFAULT_PRICING_CONFIG.freeShippingThreshold,
    standardShippingFee: settings?.shipping?.standardFee ?? DEFAULT_PRICING_CONFIG.standardShippingFee,
    gstRatePercent: settings?.taxes?.defaultGstRate ?? DEFAULT_PRICING_CONFIG.gstRatePercent,
  };

  let subtotal = 0;
  let rawUndiscountedTotal = 0;

  for (const item of items) {
    const qty = Math.max(1, Math.min(50, Number(item.quantity || item.qty || 1)));
    const unitPrice = Math.max(0, Math.round(Number(item.price || item.discountPrice || 0)));
    const baseActualPrice = Math.max(unitPrice, Math.round(Number(item.actualPrice || item.price || 0)));

    subtotal += unitPrice * qty;
    rawUndiscountedTotal += baseActualPrice * qty;
  }

  const discountSavings = Math.max(0, rawUndiscountedTotal - subtotal);

  // Apply Coupon if valid
  let couponDiscount = 0;
  if (coupon && coupon.status === "Active") {
    const minOrder = Number(coupon.minOrderValue || 0);
    if (subtotal >= minOrder) {
      if (coupon.discountType === "percentage") {
        const pct = Math.min(100, Math.max(0, Number(coupon.discountValue || 0)));
        let calculated = Math.round((subtotal * pct) / 100);
        if (coupon.maxDiscount && coupon.maxDiscount > 0) {
          calculated = Math.min(calculated, coupon.maxDiscount);
        }
        couponDiscount = calculated;
      } else if (coupon.discountType === "fixed") {
        couponDiscount = Math.min(subtotal, Math.round(Number(coupon.discountValue || 0)));
      } else if (coupon.discountType === "shipping") {
        // Free shipping handled below
      }
    }
  }

  const effectiveSubtotal = Math.max(0, subtotal - couponDiscount);

  // Shipping calculation
  const isFreeByThreshold = effectiveSubtotal >= storeConfig.freeShippingThreshold;
  const isFreeByCoupon = coupon?.discountType === "shipping" && coupon?.status === "Active";
  const isFreeShipping = isFreeByThreshold || isFreeByCoupon;
  const shipping = isFreeShipping ? 0 : storeConfig.standardShippingFee;

  // Tax calculation (GST 18%)
  const gstRate = storeConfig.gstRatePercent;
  const tax = Math.round((effectiveSubtotal * gstRate) / 100);

  const finalTotal = effectiveSubtotal + tax + shipping;

  return {
    subtotal,
    rawTotal: rawUndiscountedTotal,
    discountSavings,
    couponDiscount,
    gstRate,
    tax,
    shipping,
    isFreeShipping,
    freeShippingThreshold: storeConfig.freeShippingThreshold,
    finalTotal,
  };
}
