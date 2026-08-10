export function generateVariantId(size, firmness) {
  const s = (size || "STD").toUpperCase().replace(/\s+/g, "");
  const f = (firmness || "STD").toUpperCase().replace(/\s+/g, "");
  return `VAR-${s}-${f}`;
}

export function generateSKU(productCode = "MEL", size, firmness) {
  const s = (size || "STD").toUpperCase().replace(/\s+/g, "");
  const f = (firmness || "STD").toUpperCase().replace(/\s+/g, "");
  return `${productCode}-${s}-${f}`;
}

export function reconcileVariants(
  sizes = [],
  firmnessList = [],
  existingVariants = [],
  basePrice = 999,
  sizePrices = {},
  firmnessPrices = {}
) {
  const result = [];
  sizes.forEach((size) => {
    firmnessList.forEach((firmness) => {
      const existing = (existingVariants || []).find(
        (v) => (v.Size || v.size) === size && (v.Firmness || v.firmness) === firmness
      );

      if (existing) {
        let actualPrice = Number(existing.Actual_Price ?? existing.price ?? basePrice);
        if (isNaN(actualPrice) || actualPrice < 0) actualPrice = Number(basePrice) || 0;

        result.push({
          Variant_Id: existing.Variant_Id || existing.id || generateVariantId(size, firmness),
          SKU: existing.SKU || existing.sku || generateSKU("MEL", size, firmness),
          Size: size,
          Firmness: firmness,
          Actual_Price: actualPrice,
          Stock: Number(existing.Stock ?? existing.stock ?? 15),
          Threshold: Number(existing.Threshold ?? existing.threshold ?? 2),
          Status: existing.Status || existing.status || "Active",
        });
      } else {
        let defaultPrice = Number(
          firmnessPrices[firmness] ??
          sizePrices[size] ??
          basePrice
        );
        if (isNaN(defaultPrice) || defaultPrice < 0) defaultPrice = Number(basePrice) || 999;

        result.push({
          Variant_Id: generateVariantId(size, firmness),
          SKU: generateSKU("MEL", size, firmness),
          Size: size,
          Firmness: firmness,
          Actual_Price: defaultPrice,
          Stock: 15,
          Threshold: 2,
          Status: "Active",
        });
      }
    });
  });
  return result;
}

export function buildVariants(
  sizes = [],
  firmnessList = [],
  existingVariants = [],
  basePrice = 999,
  sizePrices = {},
  firmnessPrices = {},
  variantOverrides = {}
) {
  // Alias to reconcileVariants for backward compatibility
  const reconciled = reconcileVariants(sizes, firmnessList, existingVariants, basePrice, sizePrices, firmnessPrices);
  if (!variantOverrides || Object.keys(variantOverrides).length === 0) {
    return reconciled;
  }
  return reconciled.map((v) => {
    const key = `${v.Size}__${v.Firmness}`;
    const override = variantOverrides[key];
    if (!override) return v;
    return {
      ...v,
      Actual_Price: override.Actual_Price !== undefined ? Number(override.Actual_Price) : v.Actual_Price,
      Stock: override.Stock !== undefined ? Number(override.Stock) : v.Stock,
      Threshold: override.Threshold !== undefined ? Number(override.Threshold) : v.Threshold,
      Status: override.Status || v.Status,
    };
  });
}

export function getVariantForSelection(product, selectedSize, selectedFirmness) {
  if (!product) return null;
  const variants = product.variants || [];
  if (variants.length > 0) {
    const match = variants.find(
      (v) =>
        (v.Size || v.size) === selectedSize &&
        (v.Firmness || v.firmness) === selectedFirmness
    );
    if (match) return match;
    const sizeMatch = variants.find((v) => (v.Size || v.size) === selectedSize);
    if (sizeMatch) return sizeMatch;
  }
  return null;
}
