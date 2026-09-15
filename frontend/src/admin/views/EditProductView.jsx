"use client";

import React, { useState, useRef, useMemo } from "react";
import { useAdmin } from "../context/AdminContext";
import { Upload, X, Plus, Save, ChevronLeft, Tag, Percent, Star, Trash2 } from "lucide-react";
import { formatPrice } from "../../utils/currency";
import { ensureProductPricing, normalizeDimensionKey, normalizeVariantKey, validateMatrixPricing } from "../../utils/pricingEngine";
import { saveImageBlob, getResolvedImageUrlSync } from "../../utils/imageStorage";
import { getProductCategoryLabel, getProductReviewStats } from "../../utils/productHelpers";
import MatrixPricingManager from "../components/MatrixPricingManager";

const DEFAULT_BED_SIZES = {
  Single: {
    enabled: true,
    dimensions: ["72 X 30", "72 X 36", "75 X 30", "75 X 36", "78 X 30", "78 X 36", "84 X 36"]
  },
  Double: {
    enabled: true,
    dimensions: ["72 X 42", "72 X 44", "72 X 48", "75 X 44", "75 X 48", "78 X 48", "84 X 48"]
  },
  Queen: {
    enabled: true,
    dimensions: ["72 X 60", "75 X 60", "78 X 60", "84 X 60"]
  },
  King: {
    enabled: true,
    dimensions: ["72 X 72", "75 X 72", "78 X 72", "84 X 72"]
  }
};

function buildInitialForm(rawProduct) {
  if (!rawProduct) return {};
  const product = ensureProductPricing(rawProduct);
  const baseActualPrice = Number(product.Actual_Price ?? product.startingPrice ?? product.price ?? 999);

  const initialBedSizes = product.bedSizes
    ? JSON.parse(JSON.stringify(product.bedSizes))
    : JSON.parse(JSON.stringify(DEFAULT_BED_SIZES));

  // Extract variants list
  let rawVariants = [];
  if (Array.isArray(product.variantsList) && product.variantsList.length > 0) {
    rawVariants = [...product.variantsList];
  } else if (Array.isArray(product.thicknessOptions) && product.thicknessOptions.length > 0) {
    rawVariants = [...product.thicknessOptions];
  } else if (product.prices && Object.keys(product.prices).length > 0) {
    rawVariants = Object.keys(product.prices);
  } else {
    rawVariants = ["DEFAULT VARIANT"];
  }

  const variantsList = rawVariants.map((v) => normalizeVariantKey(v));

  // Deep clone & normalize matrix prices
  const rawPrices = product.prices ? JSON.parse(JSON.stringify(product.prices)) : {};
  const matrixPrices = {};

  if (rawPrices && typeof rawPrices === "object") {
    Object.entries(rawPrices).forEach(([vKey, dimMap]) => {
      const normV = normalizeVariantKey(vKey);
      matrixPrices[normV] = matrixPrices[normV] || {};
      if (dimMap && typeof dimMap === "object") {
        Object.entries(dimMap).forEach(([dKey, dVal]) => {
          const normD = normalizeDimensionKey(dKey);
          matrixPrices[normV][normD] = dVal;
        });
      }
    });
  }

  const matrixStocks = {};
  if (product?.matrixStocks && typeof product.matrixStocks === "object") {
    Object.entries(product.matrixStocks).forEach(([vKey, dimMap]) => {
      const normV = normalizeVariantKey(vKey);
      matrixStocks[normV] = matrixStocks[normV] || {};
      if (dimMap && typeof dimMap === "object") {
        Object.entries(dimMap).forEach(([dKey, dVal]) => {
          const normD = normalizeDimensionKey(dKey);
          matrixStocks[normV][normD] = dVal;
        });
      }
    });
  } else if (Array.isArray(product?.variants)) {
    product.variants.forEach((v) => {
      const vName = normalizeVariantKey(v.Firmness || v.VariantName || "");
      const dName = normalizeDimensionKey(v.Size || "");
      if (vName && dName) {
        matrixStocks[vName] = matrixStocks[vName] || {};
        matrixStocks[vName][dName] = v.Stock !== undefined ? Number(v.Stock) : (product?.stock ?? 25);
      }
    });
  }

  const defaultFeatures = [
    `Construction: ${product?.construction || "Premium PU Foam"}`,
    `Available Thickness: ${(product?.thicknessOptions || ["4 inch", "5 inch"]).join(" & ")}`,
    "Layer Details: Multi-layer comfort design",
    "100-Night Sleep Trial & Direct Manufacturer Warranty"
  ];
  const initialFeatures = Array.isArray(product?.features) && product.features.length > 0
    ? [...product.features]
    : defaultFeatures;

  const isAcc = (product?.parentCategory === "accessories" || product?.category === "accessories" || product?.mainCategoryId === "CAT-ACCESSORIES");
  const isBedFrame = (product?.parentCategory === "bed-frames" || product?.mainCategoryId === "CAT-BED-FRAMES");

  const defaultPerks = [
    { id: "perk-1", icon: "truck", text: product?.shippingText || "Free shipping on orders over ₹5,000" },
    { id: "perk-2", icon: (isAcc || isBedFrame ? "shield" : "check"), text: product?.trialText || (isAcc || isBedFrame ? "Official Manufacturer Warranty & Easy Returns" : "100-night trial with free pickups and full refunds") }
  ];

  const initialDeliveryPerks = Array.isArray(product?.deliveryPerks) && product.deliveryPerks.length > 0
    ? product.deliveryPerks.map((p, idx) => {
        if (typeof p === "string") {
          const isTruck = /shipping|delivery|dispatch|ship/i.test(p);
          const isShield = /warranty|guarantee|shield/i.test(p);
          const isBox = /return|pickup|refund/i.test(p);
          const isClock = /hour|day|fast|speed|express/i.test(p);
          const icon = isTruck ? "truck" : isShield ? "shield" : isBox ? "box" : isClock ? "clock" : "check";
          return { id: `perk-${idx}`, icon, text: p };
        }
        return { id: p.id || `perk-${idx}`, icon: p.icon || "truck", text: p.text || "" };
      })
    : defaultPerks;

  const d = product?.discountPercent ?? product?.Discount_Percentage;

  return {
    id: product.id ?? "",
    Product_Id: product.Product_Id ?? product.id ?? "",
    Product_Name: product.Product_Name ?? product.name ?? "",
    name: product.name ?? "",
    description: product.description ?? "",
    category: product.category ?? "ortho",
    subCategory: product.subCategory || product.category || "ortho",
    brand: product.brand ?? "Mellosoft",
    material: product.material ?? "",
    specs: product.specs ?? "",
    stock: String(product.stock ?? 25),
    threshold: String(product.threshold ?? 10),
    tagline: product.tagline ?? "",
    status: product.status ?? "Active",
    badge: product.badge ?? "",
    badgeColor: product.badgeColor ?? "#1B1F8C",
    rating: String(product.rating ?? "4.8"),
    discountPercent: typeof d === "number" ? String(d) : "0",
    basePrice: baseActualPrice,
    images: product.images ? [...product.images] : (product.image ? [product.image] : []),
    features: initialFeatures,
    deliveryPerks: initialDeliveryPerks,
    bedSizes: initialBedSizes,
    variantsList,
    matrixPrices,
    matrixStocks
  };
}

export default function EditProductView({ productId }) {
  const { products, selectedProductId, navigateTo, updateProduct, categories, reviews = [] } = useAdmin();
  const targetId = productId || selectedProductId;
  const product = products.find((p) => String(p.id) === String(targetId) || String(p.Product_Id) === String(targetId)) || products[0];

  const { averageRating, reviewCount, hasReviews } = useMemo(() => {
    return getProductReviewStats(product?.id || product?.Product_Id, reviews);
  }, [product?.id, product?.Product_Id, reviews]);

  const [form, setForm] = useState(() => buildInitialForm(product));

  React.useEffect(() => {
    if (product) {
      setForm(buildInitialForm(product));
    }
  }, [product?.id, product]);

  const [errors, setErrors] = useState({});
  const [invalidCellKeys, setInvalidCellKeys] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addImages = async (files) => {
    const fileList = Array.from(files);
    for (const file of fileList) {
      if (typeof file === "string") {
        setForm((prev) => ({ ...prev, images: [...prev.images, file] }));
      } else if (file instanceof File || file instanceof Blob) {
        const idbKey = `idb:img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await saveImageBlob(idbKey, file);
        setForm((prev) => ({ ...prev, images: [...prev.images, idbKey] }));
      }
    }
  };

  const removeImage = (idx) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addImages(e.dataTransfer.files);
    }
  };

  const addFeature = () => setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));
  const updateFeature = (idx, val) => {
    setForm((prev) => {
      const next = [...prev.features];
      next[idx] = val;
      return { ...prev, features: next };
    });
  };
  const removeFeature = (idx) => {
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  };

  const addPerk = (icon = "truck", text = "") => {
    setForm((prev) => ({
      ...prev,
      deliveryPerks: [
        ...(prev.deliveryPerks || []),
        { id: `perk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, icon, text }
      ]
    }));
  };

  const updatePerk = (idx, key, val) => {
    setForm((prev) => {
      const next = [...(prev.deliveryPerks || [])];
      next[idx] = { ...next[idx], [key]: val };
      return { ...prev, deliveryPerks: next };
    });
  };

  const removePerk = (idx) => {
    setForm((prev) => ({
      ...prev,
      deliveryPerks: (prev.deliveryPerks || []).filter((_, i) => i !== idx)
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Product Name is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (!form.variantsList || form.variantsList.length === 0) {
      errs.variants = "At least one Variant must be created.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) return;

    // Validate Matrix Pricing for active product
    const matrixValidation = validateMatrixPricing(form.bedSizes, form.variantsList, form.matrixPrices);
    if (!matrixValidation.isValid) {
      setInvalidCellKeys(matrixValidation.invalidCellKeys);
      setToast({
        type: "error",
        msg: `❌ Pricing Incomplete — ${matrixValidation.errorMsg}`
      });

      // Scroll to first missing cell
      if (matrixValidation.firstMissing) {
        const cellId = `matrix-cell-${matrixValidation.firstMissing.variant.replace(/[^a-zA-Z0-9]/g, '-')}-${matrixValidation.firstMissing.dimension.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const el = document.getElementById(cellId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => el.focus(), 300);
        }
      }
      return;
    }

    setInvalidCellKeys(new Set());
    setIsSubmitting(true);

    const activeBedCategories = Object.keys(form.bedSizes).filter(
      (k) => form.bedSizes[k].enabled && form.bedSizes[k].dimensions.length > 0
    );

    let lowestPrice = 999;
    const pricesList = [];
    Object.values(form.matrixPrices || {}).forEach((dimMap) => {
      Object.values(dimMap || {}).forEach((val) => {
        if (typeof val === "number" && val > 0) {
          pricesList.push(val);
        }
      });
    });
    if (pricesList.length > 0) {
      lowestPrice = Math.min(...pricesList);
    }

    const formattedVariants = [];
    (form.variantsList || []).forEach((vName) => {
      activeBedCategories.forEach((catName) => {
        const dims = form.bedSizes[catName]?.dimensions || [];
        dims.forEach((dim) => {
          const priceVal = form.matrixPrices[vName]?.[dim] ?? lowestPrice;
          const stockVal = form.matrixStocks?.[vName]?.[dim] !== undefined && form.matrixStocks[vName][dim] !== ""
            ? Number(form.matrixStocks[vName][dim])
            : (Number(form.stock) || 25);
          const threshVal = Number(form.threshold) || 10;

          formattedVariants.push({
            Variant_Id: `VAR-${vName.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${dim.replace(/[^A-Z0-9]/g, "")}`,
            SKU: `MEL-${vName.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${dim.replace(/[^A-Z0-9]/g, "")}`,
            Size: dim,
            SizeCategory: catName,
            Firmness: vName,
            VariantName: vName,
            Actual_Price: Number(priceVal) || lowestPrice,
            Stock: stockVal,
            Threshold: threshVal,
            Status: stockVal === 0 ? "Out of Stock" : (stockVal <= threshVal ? "Low Stock" : "Active")
          });
        });
      });
    });

    const isAcc = form.category === "accessories" || ["memory-foam-pillow", "latex-pillow", "fiber-pillow", "mattress-protector", "fitted-bedspread", "blanket-duvet", "travel-bed"].includes(form.subCategory);
    const parentCat = isAcc ? "accessories" : "mattresses";
    const subCat = form.subCategory || (isAcc ? "memory-foam-pillow" : (form.category && form.category !== "accessories" ? form.category : "ortho"));

    const catLabel = getProductCategoryLabel({ parentCategory: parentCat, subCategory: subCat, category: subCat });
    const cleanFeatures = (form.features || []).filter((f) => f && typeof f === "string" && f.trim().length > 0);

    const updatedProduct = {
      ...product,
      id: form.id || product.id,
      Product_Id: form.Product_Id || product.Product_Id,
      Product_Name: form.name,
      name: form.name,
      description: form.description,
      parentCategory: parentCat,
      parentCategoryId: parentCat,
      subCategory: subCat,
      subcategory: subCat,
      subcategoryId: subCat,
      category: isAcc ? "accessories" : subCat,
      categoryName: catLabel,
      categoryLabel: catLabel,
      brand: form.brand || "Mellosoft",
      material: form.material,
      specs: form.specs || `${catLabel.toUpperCase()} • ${form.variantsList.join(" / ")} Variants`,
      stock: Number(form.stock) || 25,
      threshold: Number(form.threshold) || 10,
      features: cleanFeatures,
      tagline: form.tagline,
      status: form.status,
      badge: form.badge ? form.badge.trim() : "",
      badgeColor: form.badgeColor || "#1B1F8C",
      rating: hasReviews ? averageRating : (Number(form.rating) || 4.8),
      reviewCount: hasReviews ? reviewCount : (Number(product?.reviewCount) || 0),
      discountPercent: Number(form.discountPercent) || 0,
      price: lowestPrice,
      Actual_Price: lowestPrice,
      startingPrice: lowestPrice,
      thicknessOptions: form.variantsList,
      firmnessOptions: form.variantsList,
      sizeOptions: activeBedCategories,
      bedSizes: form.bedSizes,
      variantsList: form.variantsList,
      prices: form.matrixPrices,
      matrixStocks: form.matrixStocks,
      variants: formattedVariants,
      image: form.images.length > 0 ? form.images[0] : "/images/mattresses/foam/haven.jpg",
      images: form.images.length > 0 ? form.images : ["/images/mattresses/foam/haven.jpg"],
      imageUrl: form.images.length > 0 ? form.images[0] : "/images/mattresses/foam/haven.jpg",
      thumbnail: form.images.length > 0 ? form.images[0] : "/images/mattresses/foam/haven.jpg",
      features: form.features.filter((f) => f.trim() !== ""),
      deliveryPerks: (form.deliveryPerks || []).filter((p) => p && p.text && p.text.trim().length > 0)
    };

    updateProduct(updatedProduct);

    setToast({ msg: `Product "${updatedProduct.name}" updated successfully!` });
    setTimeout(() => {
      setToast(null);
      navigateTo("products");
    }, 1200);
  };

  return (
    <div className="admin-fade-in">
      {toast && (
        <div style={toastStyle}>
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* BASIC INFORMATION & DETAILS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }} className="admin-add-product-grid">
            <div style={cardStyle}>
              <h4 style={cardTitleStyle}>Edit Product Information</h4>

              <div style={fieldGroup}>
                <label style={labelStyle}>Product ID</label>
                <input
                  value={form.Product_Id}
                  disabled
                  style={{ ...inputStyle, backgroundColor: "#F7F7F2", color: "#6B6B75" }}
                />
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Product Name *</label>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} style={inputStyle} placeholder="Enter product name" required />
                {errors.name && <span style={errStyle}>{errors.name}</span>}
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Tagline / Subtitle</label>
                <input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} style={inputStyle} placeholder="Enter tagline" />
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, height: "auto", padding: "10px 14px", resize: "vertical" }}
                  placeholder="Describe product..."
                  required
                />
                {errors.description && <span style={errStyle}>{errors.description}</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Main Category *</label>
                  <select
                    value={form.mainCategoryId || (categories.find((c) => c.slug === form.category || c.id === form.category)?.id) || categories[0]?.id || "CAT-MATTRESSES"}
                    onChange={(e) => {
                      const selectedMainId = e.target.value;
                      const mainCat = categories.find((c) => c.id === selectedMainId || c.slug === selectedMainId);
                      const firstSub = mainCat?.subcategories?.[0];
                      setForm((prev) => ({
                        ...prev,
                        mainCategoryId: selectedMainId,
                        parentCategory: mainCat?.slug || selectedMainId,
                        category: mainCat?.slug || selectedMainId,
                        subCategory: firstSub?.slug || firstSub?.id || "ortho",
                        subCategoryId: firstSub?.id || "SUB-ORTHO"
                      }));
                    }}
                    style={inputStyle}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={fieldGroup}>
                  <label style={labelStyle}>Subcategory *</label>
                  <select
                    value={form.subCategoryId || (categories.flatMap((c) => c.subcategories || []).find((s) => s.slug === form.subCategory || s.id === form.subCategory)?.id) || "SUB-ORTHO"}
                    onChange={(e) => {
                      const selectedSubId = e.target.value;
                      const activeMainId = form.mainCategoryId || categories.find((c) => c.slug === form.category || c.id === form.category)?.id || categories[0]?.id;
                      const activeMainCat = categories.find((c) => c.id === activeMainId);
                      const selectedSub = (activeMainCat?.subcategories || []).find((s) => s.id === selectedSubId || s.slug === selectedSubId);
                      setForm((prev) => ({
                        ...prev,
                        subCategory: selectedSub?.slug || selectedSubId,
                        subCategoryId: selectedSubId
                      }));
                    }}
                    style={inputStyle}
                  >
                    {(() => {
                      const activeMainId = form.mainCategoryId || (categories.find((c) => c.slug === form.category || c.id === form.category)?.id) || categories[0]?.id;
                      const activeMainCat = categories.find((c) => c.id === activeMainId) || categories[0];
                      const subs = activeMainCat?.subcategories || [];
                      return subs.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ));
                    })()}
                  </select>
                </div>

                <div style={fieldGroup}>
                  <label style={labelStyle}>Status *</label>
                  <select value={form.status} onChange={(e) => update("status", e.target.value)} style={inputStyle}>
                    {["Active", "Inactive", "Low Stock", "Out of Stock"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* PRODUCT BADGE */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Product Badge (shown on card)</label>
                  <input
                    value={form.badge || ""}
                    onChange={(e) => update("badge", e.target.value)}
                    style={inputStyle}
                    placeholder="e.g. Best Seller, New, Trending, Sale..."
                  />
                  {form.badge && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      <span style={{ fontSize: "11px", color: "#6B6B75" }}>Live Preview:</span>
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 700,
                          color: "#FFFFFF",
                          backgroundColor: form.badgeColor || "#1B1F8C",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                          display: "inline-block",
                        }}
                      >
                        {form.badge}
                      </span>
                    </div>
                  )}
                </div>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Badge Color (Pick Color)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        position: "relative",
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        border: "1px solid #E7E7E2",
                        overflow: "hidden",
                        backgroundColor: form.badgeColor || "#1B1F8C",
                        cursor: "pointer",
                        flexShrink: 0,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}
                      title="Click to open color picker"
                    >
                      <input
                        type="color"
                        value={form.badgeColor?.startsWith("#") && form.badgeColor.length === 7 ? form.badgeColor : "#1B1F8C"}
                        onChange={(e) => update("badgeColor", e.target.value)}
                        style={{
                          position: "absolute",
                          top: "-10px",
                          left: "-10px",
                          width: "60px",
                          height: "60px",
                          opacity: 0,
                          cursor: "pointer",
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      value={form.badgeColor || "#1B1F8C"}
                      onChange={(e) => update("badgeColor", e.target.value)}
                      style={{ ...inputStyle, fontFamily: "monospace", textTransform: "uppercase", flex: 1 }}
                      placeholder="#1B1F8C"
                    />
                  </div>
                  {/* Preset Quick Swatches */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    {["#1B1F8C", "#16A34A", "#0D9488", "#D97706", "#DC2626", "#7C3AED", "#14151A"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => update("badgeColor", c)}
                        title={c}
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: c,
                          border: form.badgeColor === c ? "2px solid #14151A" : "1px solid rgba(0,0,0,0.15)",
                          cursor: "pointer",
                          padding: 0,
                          transform: form.badgeColor === c ? "scale(1.2)" : "scale(1)",
                          transition: "transform 0.15s ease",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={cardStyle}>
                <h4 style={cardTitleStyle}>Product Specifications</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={fieldGroup}>
                    <label style={labelStyle}>Brand</label>
                    <input value={form.brand} onChange={(e) => update("brand", e.target.value)} style={inputStyle} placeholder="Mellosoft" />
                  </div>
                  <div style={fieldGroup}>
                    <label style={labelStyle}>Material</label>
                    <input value={form.material} onChange={(e) => update("material", e.target.value)} style={inputStyle} placeholder="SS + ORTHO" />
                  </div>
                </div>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Specifications</label>
                  <textarea
                    value={form.specs}
                    onChange={(e) => update("specs", e.target.value)}
                    rows={2}
                    style={{ ...inputStyle, height: "auto", padding: "10px 14px", resize: "vertical" }}
                    placeholder="Enter specifications..."
                  />
                </div>

                {/* STOCK & THRESHOLD */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={fieldGroup}>
                    <label style={labelStyle}>Stock Quantity (Default)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => update("stock", e.target.value)}
                      style={inputStyle}
                      placeholder="25"
                    />
                  </div>
                  <div style={fieldGroup}>
                    <label style={labelStyle}>Low-Stock Alert Threshold</label>
                    <input
                      type="number"
                      min="0"
                      value={form.threshold}
                      onChange={(e) => update("threshold", e.target.value)}
                      style={inputStyle}
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>

              {/* Product Images */}
              <div style={cardStyle}>
                <h4 style={cardTitleStyle}>Product Images</h4>
                <div
                  style={{
                    border: dragOver ? "2px dashed #1B1F8C" : "2px dashed #E7E7E2",
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                    backgroundColor: dragOver ? "#F7F8FF" : "#FAFAF7",
                    cursor: "pointer"
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && addImages(e.target.files)}
                    multiple
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <Upload size={24} color="#9CA3AF" style={{ marginBottom: "6px" }} />
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#14151A", margin: 0 }}>
                    Click or drag images to upload
                  </p>
                </div>

                {form.images.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: "8px", marginTop: "10px" }}>
                    {form.images.map((img, i) => (
                      <div key={i} style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: "8px", overflow: "hidden", border: "1px solid #E7E7E2" }}>
                        <img src={getResolvedImageUrlSync(img)} alt={`Img ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          style={removeImgBtnStyle}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Delivery & Guarantee Perks Card (Shown under Buy Now on Product Page) */}
          <div style={{ ...cardStyle, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h4 style={cardTitleStyle}>Delivery & Guarantee Perks</h4>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#16A34A", backgroundColor: "#DCFCE7", padding: "2px 8px", borderRadius: "12px" }}>
                    Shown under Buy Now
                  </span>
                </div>
                <p style={{ fontSize: "12.5px", color: "#6B6B75", margin: "4px 0 0" }}>
                  Highlights displayed directly below the purchase button on the product details page (e.g. Free shipping, 100-night trial, warranty).
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({
                    ...prev,
                    deliveryPerks: [
                      { id: `perk-${Date.now()}-1`, icon: "truck", text: "Free shipping on orders over ₹5,000" },
                      { id: `perk-${Date.now()}-2`, icon: "check", text: "100-night trial with free pickups and full refunds" }
                    ]
                  }))}
                  style={{
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#FFFFFF",
                    color: "#475569",
                    padding: "6px 12px",
                    borderRadius: "7px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  title="Load standard mattress perks"
                >
                  Reset Mattress Perks
                </button>

                <button
                  type="button"
                  onClick={() => setForm((prev) => ({
                    ...prev,
                    deliveryPerks: [
                      { id: `perk-${Date.now()}-1`, icon: "truck", text: "Free shipping on orders over ₹5,000" },
                      { id: `perk-${Date.now()}-2`, icon: "shield", text: "Official Manufacturer Warranty & Easy Returns" }
                    ]
                  }))}
                  style={{
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#FFFFFF",
                    color: "#475569",
                    padding: "6px 12px",
                    borderRadius: "7px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  title="Load accessory perks"
                >
                  Reset Accessory Perks
                </button>

                <button
                  type="button"
                  onClick={() => addPerk("truck", "")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "1px solid #1B1F8C",
                    backgroundColor: "#EEF0FF",
                    color: "#1B1F8C",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Add Perk
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
              {form.deliveryPerks && form.deliveryPerks.length > 0 ? (
                form.deliveryPerks.map((perk, idx) => (
                  <div
                    key={perk.id || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      backgroundColor: "#FAFAF7",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #F0F0EC",
                      flexWrap: "wrap"
                    }}
                  >
                    {/* Icon selector */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#6B6B75" }}>Icon:</span>
                      <select
                        value={perk.icon || "truck"}
                        onChange={(e) => updatePerk(idx, "icon", e.target.value)}
                        style={{
                          ...inputStyle,
                          height: "36px",
                          width: "auto",
                          padding: "4px 10px",
                          fontSize: "13px",
                          cursor: "pointer",
                          backgroundColor: "#FFFFFF"
                        }}
                      >
                        <option value="truck">🚚 Truck (Shipping)</option>
                        <option value="check">✓ Checkmark (Trial / Guarantee)</option>
                        <option value="shield">🛡️ Shield (Warranty)</option>
                        <option value="box">📦 Box (Return / Pickup)</option>
                        <option value="clock">⏱️ Clock (Express / Dispatch)</option>
                      </select>
                    </div>

                    {/* Text input */}
                    <input
                      type="text"
                      value={perk.text || ""}
                      onChange={(e) => updatePerk(idx, "text", e.target.value)}
                      style={{
                        ...inputStyle,
                        flex: 1,
                        minWidth: "240px",
                        height: "36px",
                        fontSize: "13.5px",
                        backgroundColor: "#FFFFFF"
                      }}
                      placeholder="e.g. Free shipping on orders over ₹5,000"
                    />

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removePerk(idx)}
                      style={{
                        border: "1px solid #FCA5A5",
                        backgroundColor: "#FEF2F2",
                        color: "#DC2626",
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                      title="Remove perk"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: "16px", textAlign: "center", backgroundColor: "#FAFAF7", borderRadius: "8px", border: "1px dashed #E7E7E2" }}>
                  <p style={{ fontSize: "13px", color: "#6B6B75", margin: "0 0 8px" }}>No delivery or guarantee perks added.</p>
                  <button
                    type="button"
                    onClick={() => addPerk("truck", "Free shipping on orders over ₹5,000")}
                    style={{
                      border: "none",
                      backgroundColor: "#1B1F8C",
                      color: "#FFFFFF",
                      padding: "7px 16px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    + Add First Perk
                  </button>
                </div>
              )}
            </div>

            {/* Live Storefront Preview */}
            {form.deliveryPerks && form.deliveryPerks.filter((p) => p.text && p.text.trim()).length > 0 && (
              <div style={{ marginTop: "16px", padding: "12px 16px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #E7E7E2" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
                  Live Storefront Preview (How buyers see it)
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {form.deliveryPerks.filter((p) => p.text && p.text.trim()).map((p, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {p.icon === "truck" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                          <rect x="1" y="3" width="15" height="13" />
                          <polygon points="16 8 20 8 23 11 23 16 16 16" />
                          <circle cx="5.5" cy="18.5" r="2.5" />
                          <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                      ) : p.icon === "shield" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      ) : p.icon === "box" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                          <polyline points="1 4 1 10 7 10" />
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                      ) : p.icon === "clock" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span style={{ fontSize: "13px", color: "#6B6B75", fontWeight: 500 }}>{p.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Key Features & Highlights Card (Full Width with Left-Right 2-Column Grid) */}
          <div style={{ ...cardStyle, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <div>
                <h4 style={cardTitleStyle}>Key Features & Highlights</h4>
                <p style={{ fontSize: "12.5px", color: "#6B6B75", margin: "2px 0 0" }}>
                  Bullet points shown on product details and promotional cards.
                </p>
              </div>
              <button
                type="button"
                onClick={addFeature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  border: "1px solid #1B1F8C",
                  backgroundColor: "#EEF0FF",
                  color: "#1B1F8C",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Plus size={14} /> Add Feature
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "12px", marginTop: "12px" }}>
              {form.features && form.features.length > 0 ? (
                form.features.map((feat, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#FAFAF7", padding: "6px 10px", borderRadius: "8px", border: "1px solid #F0F0EC" }}>
                    <span style={{ color: "#16A34A", fontWeight: 800, fontSize: "14px", flexShrink: 0, width: "20px", textAlign: "center" }}>✓</span>
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => updateFeature(idx, e.target.value)}
                      style={{ ...inputStyle, flex: 1, height: "38px", fontSize: "13.5px", backgroundColor: "#FFFFFF" }}
                      placeholder={`Feature ${idx + 1} (e.g., Construction: Premium PU Foam)`}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      style={{
                        border: "1px solid #FCA5A5",
                        backgroundColor: "#FEF2F2",
                        color: "#DC2626",
                        width: "36px",
                        height: "38px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                      title="Remove feature"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: "1 / -1", padding: "16px", textAlign: "center", backgroundColor: "#FAFAF7", borderRadius: "8px", border: "1px dashed #E7E7E2" }}>
                  <p style={{ fontSize: "13px", color: "#6B6B75", margin: "0 0 8px" }}>No key features added yet.</p>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({
                      ...prev,
                      features: [
                        `Construction: ${prev.material || "Premium PU Foam"}`,
                        `Available Thickness: ${(prev.variantsList || ["4 inch", "5 inch"]).join(" & ")}`,
                        "Layer Details: Multi-layer comfort design",
                        "100-Night Sleep Trial & Direct Manufacturer Warranty"
                      ]
                    }))}
                    style={{
                      border: "none",
                      backgroundColor: "#1B1F8C",
                      color: "#FFFFFF",
                      padding: "7px 16px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    + Add Default Features
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── MATRIX PRICING & SIZES & VARIANTS MANAGER ────────────────────── */}
          {errors.variants && (
            <div style={errorBannerStyle}>
              {errors.variants}
            </div>
          )}

          <MatrixPricingManager
            bedSizes={form.bedSizes}
            onBedSizesChange={(updatedSizes) => update("bedSizes", updatedSizes)}
            variants={form.variantsList}
            onVariantsChange={(updatedVariants) => update("variantsList", updatedVariants)}
            prices={form.matrixPrices}
            onPricesChange={(updatedPrices) => {
              update("matrixPrices", updatedPrices);
              if (invalidCellKeys && invalidCellKeys.size > 0) {
                const nextInvalid = new Set(invalidCellKeys);
                let changed = false;
                invalidCellKeys.forEach((key) => {
                  const [v, d] = key.split("::");
                  if (v && d) {
                    const val = getMatrixCellValue(updatedPrices, v, d);
                    const num = Number(val);
                    if (val !== "" && val !== null && val !== undefined && !isNaN(num) && num > 0 && isFinite(num)) {
                      nextInvalid.delete(key);
                      changed = true;
                    }
                  }
                });
                if (changed) {
                  setInvalidCellKeys(nextInvalid);
                }
              }
            }}
            stocks={form.matrixStocks}
            onStocksChange={(updatedStocks) => update("matrixStocks", updatedStocks)}
            discountPercent={form.discountPercent}
            onDiscountPercentChange={(val) => update("discountPercent", val)}
            defaultStock={Number(form.stock) || 25}
            categoryName={form.name || form.category || "ORTHO MATTRESS"}
            invalidCellKeys={invalidCellKeys}
          />

          {/* BUTTONS */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
            <button
              type="button"
              onClick={() => navigateTo("products")}
              style={cancelBtnStyle}
              disabled={isSubmitting}
            >
              <ChevronLeft size={16} /> Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...saveBtnStyle,
                opacity: isSubmitting ? 0.65 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer"
              }}
            >
              <Save size={16} /> {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}

const cardStyle = { backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E7E2", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" };
const cardTitleStyle = { fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 };
const fieldGroup = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = { fontSize: "13px", fontWeight: 600, color: "#6B6B75" };
const inputStyle = { height: "42px", padding: "0 14px", border: "1px solid #E7E7E2", borderRadius: "10px", fontSize: "14px", color: "#14151A", backgroundColor: "#FFFFFF", outline: "none", width: "100%", boxSizing: "border-box" };
const errStyle = { fontSize: "12px", color: "#DC2626", fontWeight: 500 };
const cancelBtnStyle = { height: "44px", padding: "0 24px", border: "1px solid #E7E7E2", borderRadius: "10px", backgroundColor: "#FFFFFF", color: "#14151A", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" };
const saveBtnStyle = { height: "44px", padding: "0 28px", border: "none", borderRadius: "10px", backgroundColor: "#1B1F8C", color: "#FFFFFF", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" };
const removeImgBtnStyle = { position: "absolute", top: "4px", right: "4px", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "rgba(220, 38, 38, 0.9)", color: "#FFF", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
const toastStyle = { position: "fixed", top: "80px", right: "24px", zIndex: 2000, backgroundColor: "#16A34A", color: "#FFF", padding: "12px 20px", borderRadius: "10px", fontWeight: 600, fontSize: "14px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" };
const errorBannerStyle = { backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#DC2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600 };
