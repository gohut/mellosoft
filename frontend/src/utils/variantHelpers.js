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
    const clean = (s) => (s || "").toString().trim().toLowerCase().replace(/\s+/g, " ");
    const sTarget = clean(selectedSize);
    const fTarget = clean(selectedFirmness);

    // 1. Exact or cleaned string match
    const exact = variants.find(
      (v) =>
        clean(v.Size || v.size) === sTarget &&
        clean(v.Firmness || v.firmness || v.VariantName || v.thickness) === fTarget
    );
    if (exact) return exact;

    // 2. Normalized alphanumeric match (e.g. "72 X 30" -> "72x30", "4 INCH" -> "4inch")
    const norm = (s) => (s || "").toString().toLowerCase().replace(/[^0-9a-z]/g, "");
    const sNorm = norm(selectedSize);
    const fNorm = norm(selectedFirmness);

    const normMatch = variants.find((v) => {
      const vSize = norm(v.Size || v.size);
      const vFirm = norm(v.Firmness || v.firmness || v.VariantName || v.thickness);
      return vSize === sNorm && vFirm === fNorm;
    });
    if (normMatch) return normMatch;

    // 3. Fallback: match size
    if (sNorm) {
      const sizeMatch = variants.find(
        (v) => clean(v.Size || v.size) === sTarget || norm(v.Size || v.size) === sNorm
      );
      if (sizeMatch) return sizeMatch;
    }

    // 4. Fallback: match firmness
    if (fNorm) {
      const firmMatch = variants.find(
        (v) =>
          clean(v.Firmness || v.firmness || v.VariantName || v.thickness) === fTarget ||
          norm(v.Firmness || v.firmness || v.VariantName || v.thickness) === fNorm
      );
      if (firmMatch) return firmMatch;
    }

    return variants[0] || null;
  }
  return null;
}
