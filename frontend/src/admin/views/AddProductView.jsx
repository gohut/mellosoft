"use client";

import React, { useState, useRef } from "react";
import { useAdmin } from "../context/AdminContext";
import { Upload, X, Plus, Save, ChevronLeft, Tag, Percent } from "lucide-react";
import { formatPrice, calculateDiscountedPrice } from "../../utils/currency";
import { reconcileVariants } from "../../utils/variantHelpers";

const categoryOptions = ["mattress", "pillows", "bed frames", "protectors", "accessories"];
const sizeOptions = ["Twin", "Full", "Queen", "King", "Standard"];
const firmnessOptions = ["Soft", "Medium", "Firm", "Standard"];
const statusOptions = ["Active", "Inactive", "Low Stock", "Out of Stock"];

function buildInitialForm() {
  const generatedId = `PROD-${Math.floor(100 + Math.random() * 900)}`;

  return {
    id: "",
    Product_Id: generatedId,
    Product_Name: "",
    name: "",
    description: "",
    category: "mattress",
    brand: "",
    material: "",
    specs: "",
    tagline: "",
    status: "Active",
    rating: "5.0",
    discountPercent: "0",
    basePrice: 999,
    sizes: [],
    firmness: [],
    images: [],
    features: [],
    sizePrices: {},
    firmnessPrices: {},
    variants: [],
  };
}

export default function AddProductView() {
  const { navigateTo, addProduct, products, categories } = useAdmin();

  const [form, setForm] = useState(() => {
    const nextNum = (products?.length || 8) + 1;
    const generatedId = `PROD-${String(nextNum).padStart(3, "0")}`;
    const initial = buildInitialForm();
    initial.Product_Id = generatedId;
    return initial;
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // ─── Field helpers ────────────────────────────────────────────────
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSize = (size) => {
    setForm((prev) => {
      const isSelected = prev.sizes.includes(size);
      const newSizes = isSelected ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size];
      const newVariants = reconcileVariants(
        newSizes,
        prev.firmness,
        prev.variants,
        prev.basePrice,
        prev.sizePrices,
        prev.firmnessPrices
      ).map((v) => {
        const exists = prev.variants.some(
          (existing) => (existing.Size || existing.size) === v.Size && (existing.Firmness || existing.firmness) === v.Firmness
        );
        if (!exists) {
          return {
            ...v,
            Actual_Price: prev.basePrice || 999,
            Stock: 15,
            Threshold: 2,
            Status: "Active",
          };
        }
        return v;
      });

      return {
        ...prev,
        sizes: newSizes,
        variants: newVariants,
      };
    });
  };

  const toggleFirmness = (firmnessItem) => {
    setForm((prev) => {
      const isSelected = prev.firmness.includes(firmnessItem);
      const newFirmness = isSelected ? prev.firmness.filter((f) => f !== firmnessItem) : [...prev.firmness, firmnessItem];
      const newVariants = reconcileVariants(
        prev.sizes,
        newFirmness,
        prev.variants,
        prev.basePrice,
        prev.sizePrices,
        prev.firmnessPrices
      ).map((v) => {
        const exists = prev.variants.some(
          (existing) => (existing.Size || existing.size) === v.Size && (existing.Firmness || existing.firmness) === v.Firmness
        );
        if (!exists) {
          return {
            ...v,
            Actual_Price: prev.basePrice || 999,
            Stock: 15,
            Threshold: 2,
            Status: "Active",
          };
        }
        return v;
      });

      return {
        ...prev,
        firmness: newFirmness,
        variants: newVariants,
      };
    });
  };

  const updateVariant = (size, firmness, field, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => {
        if ((v.Size || v.size) === size && (v.Firmness || v.firmness) === firmness) {
          const val = field === "Status" ? value : (field === "Actual_Price" || field === "Stock" || field === "Threshold" ? (value === "" ? "" : Number(value)) : value);
          return { ...v, [field]: val };
        }
        return v;
      }),
    }));
  };

  // ─── Image helpers ────────────────────────────────────────────────
  const addImages = (files) => {
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
  };

  const removeImage = (idx) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) addImages(e.dataTransfer.files);
  };

  // ─── Feature helpers ──────────────────────────────────────────────
  const addFeature = () => setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));
  const updateFeature = (i, val) => setForm((prev) => {
    const f = [...prev.features];
    f[i] = val;
    return { ...prev, features: f };
  });
  const removeFeature = (i) => setForm((prev) => ({ ...prev, features: prev.features.filter((_, j) => j !== i) }));

  // ─── Validation ───────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.category) e.category = "Category is required.";
    if (!form.status) e.status = "Status is required.";
    if (form.sizes.length === 0) e.sizes = "At least one size option must be selected.";
    if (form.firmness.length === 0) e.firmness = "At least one firmness option must be selected.";

    const discNum = Number(form.discountPercent);
    if (isNaN(discNum) || discNum < 0 || discNum > 100) {
      e.discountPercent = "Discount percentage must be a number between 0 and 100.";
    }

    const invalidVariantPrice = form.variants.find((v) => isNaN(Number(v.Actual_Price)) || Number(v.Actual_Price) < 0);
    if (invalidVariantPrice) {
      e.variantPrice = `Variant ${invalidVariantPrice.Size} + ${invalidVariantPrice.Firmness} must have a price >= 0.`;
    }

    const invalidVariantStock = form.variants.find((v) => isNaN(Number(v.Stock)) || Number(v.Stock) < 0);
    if (invalidVariantStock) {
      e.variantStock = `Variant ${invalidVariantStock.Size} + ${invalidVariantStock.Firmness} must have stock >= 0.`;
    }

    const invalidVariantThreshold = form.variants.find((v) => isNaN(Number(v.Threshold)) || Number(v.Threshold) < 0);
    if (invalidVariantThreshold) {
      e.variantThreshold = `Variant ${invalidVariantThreshold.Size} + ${invalidVariantThreshold.Firmness} must have threshold >= 0.`;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const discNum = Number(form.discountPercent) || 0;
    const totalCalculatedStock = form.variants.reduce((sum, v) => sum + Number(v.Stock || 0), 0);
    const baseActualPrice = form.variants.length > 0 ? Number(form.variants[0].Actual_Price) : 999;
    const generatedSlugId = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `prod-${Date.now()}`;
    const prodCode = form.Product_Id || `PROD-${String((products?.length || 0) + 1).padStart(3, "0")}`;

    const processedVariants = form.variants.map((v) => {
      const sz = v.Size || v.size;
      const fm = v.Firmness || v.firmness;
      const actualP = Number(v.Actual_Price ?? v.price ?? baseActualPrice);
      const discP = calculateDiscountedPrice(actualP, discNum);
      const stk = Number(v.Stock ?? v.stock ?? 0);
      const thres = Number(v.Threshold ?? v.threshold ?? 10);
      const stat = v.Status || v.status || (stk === 0 ? "Out of Stock" : (stk <= thres ? "Low Stock" : "Active"));

      return {
        Variant_Id: v.Variant_Id || v.id || `VAR-${sz.toUpperCase()}-${fm.toUpperCase()}`,
        SKU: v.SKU || v.sku || `MEL-${sz.toUpperCase()}-${fm.toUpperCase()}`,
        Size: sz,
        size: sz,
        Firmness: fm,
        firmness: fm,
        Actual_Price: actualP,
        price: actualP,
        Discounted_Price: discP,
        discountedPrice: discP,
        Stock: stk,
        stock: stk,
        Threshold: thres,
        threshold: thres,
        Status: stat,
        status: stat,
      };
    });

    const newProduct = {
      id: generatedSlugId,
      Product_Id: prodCode,
      Product_Name: form.name.trim(),
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      category: form.category,
      status: form.status,
      price: baseActualPrice,
      Actual_Price: baseActualPrice,
      discountPercent: discNum,
      Discount_Percentage: discNum,
      discountPercentage: discNum,
      discountPrice: calculateDiscountedPrice(baseActualPrice, discNum),
      Discounted_Price: calculateDiscountedPrice(baseActualPrice, discNum),
      stock: totalCalculatedStock,
      Stock: totalCalculatedStock,
      threshold: 10,
      Threshold: 10,
      brand: form.brand.trim() || "Mellosoft",
      material: form.material.trim() || undefined,
      specs: form.specs.trim() || undefined,
      specifications: form.specs.trim() || undefined,
      rating: Number(form.rating) || 5.0,
      sizeOptions: form.sizes,
      availableSizes: form.sizes,
      sizes: form.sizes,
      firmnessOptions: form.firmness,
      availableFirmness: form.firmness,
      firmness: form.firmness,
      images: form.images.length > 0 ? form.images : ["/asset/img1.jpg"],
      features: form.features.filter((f) => f.trim() !== ""),
      keyFeatures: form.features.filter((f) => f.trim() !== ""),
      variants: processedVariants,
    };

    addProduct(newProduct);
    setForm(buildInitialForm());
    setToast({ msg: `Product "${newProduct.name}" created successfully!` });

    setTimeout(() => {
      setToast(null);
      navigateTo("products");
    }, 1200);
  };

  return (
    <div className="admin-fade-in">
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "80px", right: "24px", zIndex: 2000,
          backgroundColor: "#16A34A", color: "#FFF", padding: "12px 20px",
          borderRadius: "10px", fontWeight: 600, fontSize: "14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)", animation: "adminFadeIn 0.25s ease",
        }}>
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="admin-add-product-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* ── LEFT COLUMN: Basic Information & Available Variants & Options ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Basic Information */}
            <div style={cardStyle}>
              <h4 style={cardTitleStyle}>Basic Information</h4>

              {/* Product ID – auto generated */}
              <div style={fieldGroup}>
                <label style={labelStyle}>Product ID <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(auto-generated)</span></label>
                <input
                  value={form.Product_Id}
                  onChange={(e) => update("Product_Id", e.target.value)}
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
                  rows={4}
                  style={{ ...inputStyle, height: "auto", padding: "10px 14px", resize: "vertical", minHeight: "100px" }}
                  placeholder="Describe the product features and benefits..."
                  required
                />
                {errors.description && <span style={errStyle}>{errors.description}</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Category *</label>
                  <select value={form.category} onChange={(e) => update("category", e.target.value)} style={inputStyle}>
                    {(categories || []).map((c) => {
                      const val = c.slug || c.name.toLowerCase();
                      return (
                        <option key={c.id} value={val}>
                          {c.name}
                        </option>
                      );
                    })}
                  </select>
                  {errors.category && <span style={errStyle}>{errors.category}</span>}
                </div>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Status *</label>
                  <select value={form.status} onChange={(e) => update("status", e.target.value)} style={inputStyle}>
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.status && <span style={errStyle}>{errors.status}</span>}
                </div>
              </div>
            </div>

            {/* Available Variant & Option Selection */}
            <div style={cardStyle}>
              <h4 style={cardTitleStyle}>Available Variants & Options</h4>
              <p style={{ fontSize: "13px", color: "#6B6B75", margin: 0 }}>
                Select which sizes and firmness options are available for this product.
              </p>
              
              {/* Available Sizes */}
              <div style={fieldGroup}>
                <label style={labelStyle}>Available Sizes *</label>
                <div style={chipGroup}>
                  {sizeOptions.map((s) => {
                    const isSelected = form.sizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSize(s)}
                        style={{ ...chipBtnStyle, ...(isSelected ? chipActive : chipInactive) }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {errors.sizes && <span style={errStyle}>{errors.sizes}</span>}
              </div>

              {/* Firmness Options */}
              <div style={{ ...fieldGroup, marginTop: "8px" }}>
                <label style={labelStyle}>Firmness Options *</label>
                <div style={chipGroup}>
                  {firmnessOptions.map((f) => {
                    const isSelected = form.firmness.includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFirmness(f)}
                        style={{ ...chipBtnStyle, ...(isSelected ? chipActive : chipInactive) }}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
                {errors.firmness && <span style={errStyle}>{errors.firmness}</span>}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: Product Details, Images & Key Features ────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Product Details (Top-right) */}
            <div style={cardStyle}>
              <h4 style={cardTitleStyle}>Product Details</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Brand</label>
                  <input value={form.brand} onChange={(e) => update("brand", e.target.value)} style={inputStyle} placeholder="e.g. Mellosoft" />
                </div>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Material</label>
                  <input value={form.material} onChange={(e) => update("material", e.target.value)} style={inputStyle} placeholder="e.g. Memory Foam, Organic Cotton" />
                </div>
              </div>
              <div style={fieldGroup}>
                <label style={labelStyle}>Specifications</label>
                <textarea
                  value={form.specs}
                  onChange={(e) => update("specs", e.target.value)}
                  rows={2}
                  style={{ ...inputStyle, height: "auto", padding: "10px 14px", resize: "vertical" }}
                  placeholder="Enter product specifications"
                />
              </div>
            </div>

            {/* Product Images Management */}
            <div style={cardStyle}>
              <h4 style={cardTitleStyle}>Product Images</h4>
              {errors.images && <span style={errStyle}>{errors.images}</span>}

              {/* Upload Dropzone */}
              <div
                style={{
                  border: dragOver ? "2px dashed #1B1F8C" : "2px dashed #E7E7E2",
                  borderRadius: "12px",
                  padding: "28px 20px",
                  textAlign: "center",
                  backgroundColor: dragOver ? "#F7F8FF" : "#FAFAF7",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
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
                <Upload size={32} color="#9CA3AF" style={{ marginBottom: "8px" }} />
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#14151A", margin: "0 0 2px" }}>
                  Drag and drop images here or click to browse
                </p>
                <p style={{ fontSize: "11px", color: "#6B6B75", margin: 0 }}>
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>

              {/* Thumbnail Gallery List */}
              {form.images.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "10px", marginTop: "10px" }}>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: "8px", overflow: "hidden", border: "1px solid #E7E7E2", backgroundColor: "#F7F7F2" }}>
                      <img src={img} alt={`Product ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        style={{
                          position: "absolute", top: "4px", right: "4px", width: "22px", height: "22px",
                          borderRadius: "50%", backgroundColor: "rgba(220, 38, 38, 0.9)", color: "#FFF",
                          border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      >
                        <X size={12} />
                      </button>
                      {i === 0 && (
                        <span style={{ position: "absolute", bottom: "4px", left: "4px", fontSize: "9px", fontWeight: 700, backgroundColor: "#1B1F8C", color: "#FFF", padding: "1px 4px", borderRadius: "4px" }}>
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Key Features */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={cardTitleStyle}>Key Features</h4>
                <button type="button" onClick={addFeature} style={{ ...outlineBtnStyle, fontSize: "12px", height: "32px", padding: "0 12px" }}>
                  <Plus size={13} /> Add Feature
                </button>
              </div>
              {form.features.length === 0 && (
                <p style={{ fontSize: "13px", color: "#9CA3AF" }}>No features added. Click "Add Feature" to add one.</p>
              )}
              {form.features.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <textarea
                    value={f}
                    onChange={(e) => updateFeature(i, e.target.value)}
                    rows={2}
                    style={{ ...inputStyle, height: "auto", padding: "10px 14px", resize: "vertical", flex: 1 }}
                    placeholder="Describe a key product feature..."
                  />
                  <button type="button" onClick={() => removeFeature(i)} style={{ ...iconBtn, marginTop: "2px" }}>
                    <X size={14} color="#DC2626" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── FULL WIDTH: Price & Stock Management ──────────────────────── */}
        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Validation Banner for Price/Stock */}
          {(errors.variantPrice || errors.variantStock || errors.variantThreshold || errors.discountPercent) && (
            <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#DC2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600 }}>
              {errors.variantPrice || errors.variantStock || errors.variantThreshold || errors.discountPercent}
            </div>
          )}

          {/* Product Discount Card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Percent size={18} color="#16A34A" />
              <h4 style={cardTitleStyle}>Product Discount</h4>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "260px" }}>
              <label style={labelStyle}>Discount Percentage (%)</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  value={form.discountPercent}
                  onChange={(e) => update("discountPercent", e.target.value)}
                  style={{ ...inputStyle, paddingRight: "32px", fontWeight: 700, color: "#14151A" }}
                  min="0"
                  max="100"
                  step="1"
                  required
                />
                <span style={{ position: "absolute", right: "12px", fontSize: "14px", fontWeight: 700, color: "#6B6B75", pointerEvents: "none" }}>
                  %
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "#6B6B75" }}>
                Applies to all size + firmness variants (0% – 100%)
              </span>
            </div>
          </div>

          {/* Variant Price & Stock Management Table Card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h4 style={cardTitleStyle}>
                <Tag size={18} style={{ marginRight: "8px", verticalAlign: "middle", color: "#1B1F8C" }} />
                Variant Price & Stock Management
              </h4>
              <span style={{ fontSize: "12px", color: "#6B6B75", fontWeight: 600, backgroundColor: "#F0F0EC", padding: "4px 10px", borderRadius: "999px" }}>
                {form.variants.length} Variant Combinations
              </span>
            </div>

            {form.variants.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
                No active sizes or firmness options selected. Select available size and firmness options above.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#FAFAF7", borderBottom: "1px solid #E7E7E2" }}>
                      <th style={thStyle}>Size</th>
                      <th style={thStyle}>Firmness</th>
                      <th style={thStyle}>Price (₹)</th>
                      <th style={thStyle}>Discount Price (₹)</th>
                      <th style={thStyle}>Stock</th>
                      <th style={thStyle}>Threshold</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.variants.map((v) => {
                      const sizeName = v.Size || v.size;
                      const firmnessName = v.Firmness || v.firmness;
                      const priceVal = v.Actual_Price;
                      const discPrice = priceVal === "" ? "" : calculateDiscountedPrice(Number(priceVal), Number(form.discountPercent) || 0);

                      return (
                        <tr key={`${sizeName}__${firmnessName}`} style={{ borderBottom: "1px solid #F0F0EC" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 700, color: "#14151A" }}>{sizeName}</td>
                          <td style={{ padding: "8px 10px", color: "#4B5563" }}>{firmnessName}</td>
                          <td style={{ padding: "8px 10px", width: "120px" }}>
                            <input
                              type="number"
                              value={priceVal}
                              onChange={(e) => updateVariant(sizeName, firmnessName, "Actual_Price", e.target.value)}
                              style={{ ...inputStyle, height: "36px", padding: "0 10px", fontWeight: 700, color: "#14151A" }}
                              placeholder="Enter price"
                              min="0"
                              required
                            />
                          </td>
                          <td style={{ padding: "8px 10px", width: "140px", fontWeight: 700, color: "#16A34A", fontSize: "14px" }}>
                            {formatPrice(discPrice)}
                          </td>
                          <td style={{ padding: "8px 10px", width: "90px" }}>
                            <input
                              type="number"
                              value={v.Stock}
                              onChange={(e) => updateVariant(sizeName, firmnessName, "Stock", e.target.value)}
                              style={{ ...inputStyle, height: "36px", padding: "0 8px" }}
                              placeholder="Enter stock"
                              min="0"
                              required
                            />
                          </td>
                          <td style={{ padding: "8px 10px", width: "80px" }}>
                            <input
                              type="number"
                              value={v.Threshold}
                              onChange={(e) => updateVariant(sizeName, firmnessName, "Threshold", e.target.value)}
                              style={{ ...inputStyle, height: "36px", padding: "0 8px" }}
                              placeholder="Enter threshold"
                              min="0"
                              required
                            />
                          </td>
                          <td style={{ padding: "8px 10px", width: "120px" }}>
                            <select
                              value={v.Status || "Active"}
                              onChange={(e) => updateVariant(sizeName, firmnessName, "Status", e.target.value)}
                              style={{ ...inputStyle, height: "36px", padding: "0 6px", fontSize: "12px" }}
                            >
                              {statusOptions.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
          <button
            type="button"
            onClick={() => navigateTo("products")}
            style={cancelBtnStyle}
          >
            <ChevronLeft size={16} /> Cancel
          </button>
          <button type="submit" className="admin-btn-hover" style={saveBtnStyle}>
            <Save size={16} /> Add Product
          </button>
        </div>
      </form>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .admin-add-product-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const cardStyle = { backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E7E2", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" };
const cardTitleStyle = { fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 };
const fieldGroup = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = { fontSize: "13px", fontWeight: 600, color: "#6B6B75" };
const inputStyle = { height: "42px", padding: "0 14px", border: "1px solid #E7E7E2", borderRadius: "10px", fontSize: "14px", color: "#14151A", backgroundColor: "#FFFFFF", fontFamily: "inherit", outline: "none", transition: "border-color 0.2s ease", width: "100%", boxSizing: "border-box", lineHeight: "1.5" };
const errStyle = { fontSize: "12px", color: "#DC2626", fontWeight: 500 };
const chipGroup = { display: "flex", gap: "8px", flexWrap: "wrap" };
const chipBtnStyle = { height: "36px", padding: "0 16px", border: "1px solid", borderRadius: "999px", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s ease", fontFamily: "inherit" };
const chipActive = { backgroundColor: "#1B1F8C", color: "#FFFFFF", borderColor: "#1B1F8C" };
const chipInactive = { backgroundColor: "#FFFFFF", color: "#14151A", borderColor: "#E7E7E2" };
const cancelBtnStyle = { height: "44px", padding: "0 24px", border: "1px solid #E7E7E2", borderRadius: "10px", backgroundColor: "#FFFFFF", color: "#14151A", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" };
const saveBtnStyle = { height: "44px", padding: "0 28px", border: "none", borderRadius: "10px", backgroundColor: "#1B1F8C", color: "#FFFFFF", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" };
const outlineBtnStyle = { display: "flex", alignItems: "center", gap: "4px", border: "1px solid #E7E7E2", borderRadius: "8px", backgroundColor: "#FFFFFF", color: "#14151A", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 };
const iconBtn = { width: "32px", height: "32px", border: "1px solid #FEE2E2", borderRadius: "8px", backgroundColor: "#FFF5F5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 };
const thStyle = { textAlign: "left", padding: "8px 10px", fontSize: "11px", fontWeight: 700, color: "#6B6B75", textTransform: "uppercase", letterSpacing: "0.05em" };
