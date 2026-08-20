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
