export function formatPrice(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  const num = Number(amount);
  if (Number.isInteger(num)) {
    return `₹${num.toLocaleString("en-IN")}`;
  }
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculateDiscountedPrice(actualPrice, discountPercent) {
  const price = Number(actualPrice) || 0;
  const discount = Number(discountPercent) || 0;
  if (discount <= 0) return price;
  if (discount >= 100) return 0;
  const discounted = price * (1 - discount / 100);
  return Math.round(discounted * 100) / 100;
}

export function getProductPrices(product, selectedSize = null) {
  if (!product) return { actualPrice: 0, discountPercent: 0, discountedPrice: 0 };

  const discountPercent = typeof product.discountPercent === "number"
    ? product.discountPercent
    : (Number(product.discountPercent) || 0);

  let actualPrice = Number(product.Actual_Price ?? product.price) || 0;
  if (selectedSize && product.sizePrices && product.sizePrices[selectedSize]) {
    actualPrice = Number(product.sizePrices[selectedSize]);
  }

  const discountedPrice = calculateDiscountedPrice(actualPrice, discountPercent);

  return { actualPrice, discountPercent, discountedPrice };
}

/**
 * Calculates the smallest valid price available across all pricing matrices, sizes, and flat price attributes.
 */
export function getMinimumProductPrice(product) {
  if (!product) return null;

  const validPrices = [];

  // 1. Matrix prices (e.g. product.prices["4 inch"]["72 x 30"] = 10411)
  if (product.prices && typeof product.prices === "object") {
    Object.values(product.prices).forEach((thicknessPrices) => {
      if (thicknessPrices && typeof thicknessPrices === "object") {
        Object.values(thicknessPrices).forEach((price) => {
          const val = Number(price);
          if (Number.isFinite(val) && val > 0) {
            validPrices.push(val);
          }
        });
      }
    });
  }

  // 2. Size prices (e.g. product.sizePrices)
  if (product.sizePrices && typeof product.sizePrices === "object") {
    Object.values(product.sizePrices).forEach((price) => {
      const val = Number(price);
      if (Number.isFinite(val) && val > 0) {
        validPrices.push(val);
      }
    });
  }

  // 3. Flat price properties if matrix prices are empty
  if (validPrices.length === 0) {
    [product.startingPrice, product.price, product.Actual_Price, product.Discounted_Price, product.discountPrice].forEach((p) => {
      const val = Number(p);
      if (Number.isFinite(val) && val > 0) {
        validPrices.push(val);
      }
    });
  }

  if (validPrices.length === 0) {
    return null;
  }

  return Math.min(...validPrices);
}
