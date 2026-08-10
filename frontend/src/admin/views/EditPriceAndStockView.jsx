"use client";

import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { Package, DollarSign, Save, ChevronLeft, Tag, Percent } from "lucide-react";
import { formatPrice, calculateDiscountedPrice } from "../../utils/currency";
import { buildVariants } from "../../utils/variantHelpers";

const statusOptions = ["Active", "Inactive", "Low Stock", "Out of Stock"];

function buildInitialVariantOverrides(product) {
  const overrides = {};
  const actual = Number(product.Actual_Price ?? product.price ?? 0);
  if (product.variants && Array.isArray(product.variants)) {
    product.variants.forEach((v) => {
      const key = `${v.Size || v.size}__${v.Firmness || v.firmness}`;
      overrides[key] = {
        Stock: v.Stock ?? v.stock ?? 15,
        Threshold: v.Threshold ?? v.threshold ?? 2,
        Status: v.Status ?? v.status ?? "Active",
        Actual_Price: v.Actual_Price ?? v.price ?? actual,
      };
    });
  }
  return overrides;
}

export default function EditPriceAndStockView() {
  const { products, selectedProductId, navigateTo, updateProduct } = useAdmin();
  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const [discountPercent, setDiscountPercent] = useState(() => {
    const d = product?.discountPercent ?? product?.Discount_Percentage;
    return typeof d === "number" ? d : 10;
  });

  const [variantOverrides, setVariantOverrides] = useState(() =>
    buildInitialVariantOverrides(product)
  );
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  if (!product) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "#6B6B75" }}>
        Product not found.{" "}
        <button
          onClick={() => navigateTo("products")}
          style={{ color: "#1B1F8C", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  // Active variants derived from the product's configured sizeOptions & firmnessOptions
  const activeVariants = buildVariants(
    product.sizeOptions || ["Queen"],
    product.firmnessOptions || ["Medium"],
    product.variants || [],
    Number(product.Actual_Price ?? product.price) || 999,
    product.sizePrices || {},
    product.firmnessPrices || {},
    variantOverrides
  );

  const updateVariantField = (size, firmness, field, value) => {
    const key = `${size}__${firmness}`;
    setVariantOverrides((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value,
      },
    }));
  };

  const validate = () => {
    const errs = {};

    if (isNaN(Number(discountPercent)) || Number(discountPercent) < 0 || Number(discountPercent) > 100) {
      errs.discount = "Discount Percentage must be a valid number between 0 and 100.";
    }

    const invalidPrice = activeVariants.find((v) => isNaN(v.Actual_Price) || Number(v.Actual_Price) <= 0);
    if (invalidPrice) {
      errs.price = `Variant ${invalidPrice.Size} + ${invalidPrice.Firmness} must have a valid price > 0.`;
    }

    const invalidStock = activeVariants.find((v) => isNaN(v.Stock) || Number(v.Stock) < 0);
    if (invalidStock) {
      errs.stock = `Variant ${invalidStock.Size} + ${invalidStock.Firmness} must have valid stock >= 0.`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const discNum = Number(discountPercent) || 0;
    const totalStock = activeVariants.reduce((sum, v) => sum + Number(v.Stock || 0), 0);

    const updatedProduct = {
      ...product,
      discountPercent: discNum,
      Discount_Percentage: discNum,
      variants: activeVariants,
      stock: totalStock,
    };

    updateProduct(updatedProduct);
    setToast({ msg: `Price, Stock & Discount for "${product.name}" updated successfully.` });

    setTimeout(() => {
      setToast(null);
      navigateTo("product-details", product.id);
    }, 1500);
  };

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#14151A", margin: 0 }}>
            Edit Price & Stock: {product.Product_Name || product.name}
          </h2>
          <p style={{ fontSize: "13px", color: "#6B6B75", margin: "4px 0 0" }}>
            Configure product discount and individual price, stock quantity, low-stock threshold, and status for each variant combination.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigateTo("product-details", product.id)}
          style={cancelBtnStyle}
        >
          <ChevronLeft size={16} /> Back to Details
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Validation Banner */}
          {(errors.discount || errors.price || errors.stock) && (
            <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#DC2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600 }}>
              {errors.discount || errors.price || errors.stock}
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
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
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
              {errors.discount && <span style={errStyle}>{errors.discount}</span>}
              <span style={{ fontSize: "11px", color: "#6B6B75" }}>
                Applies to all size + firmness variants (0% – 100%)
              </span>
            </div>
          </div>

          {/* Price & Stock Management Table Card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h4 style={cardTitleStyle}>
                <Tag size={18} style={{ marginRight: "8px", verticalAlign: "middle", color: "#1B1F8C" }} />
                Variant Price & Stock Management
              </h4>
              <span style={{ fontSize: "12px", color: "#6B6B75", fontWeight: 600, backgroundColor: "#F0F0EC", padding: "4px 10px", borderRadius: "999px" }}>
                {activeVariants.length} Variant Combinations
              </span>
            </div>

            {activeVariants.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
                No active sizes or firmness options configured for this product. Use "Edit Product" to enable size and firmness options first.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#FAFAF7", borderBottom: "1px solid #E7E7E2" }}>
                      <th style={thStyle}>Size</th>
                      <th style={thStyle}>Firmness</th>
                      <th style={thStyle}>Price (₹)</th>
                      <th style={thStyle}>Discounted Price (₹)</th>
                      <th style={thStyle}>Stock</th>
                      <th style={thStyle}>Threshold</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeVariants.map((v) => {
                      const discPrice = calculateDiscountedPrice(v.Actual_Price, discountPercent);
                      return (
                        <tr key={`${v.Size}__${v.Firmness}`} style={{ borderBottom: "1px solid #F0F0EC" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 700, color: "#14151A" }}>{v.Size}</td>
                          <td style={{ padding: "8px 10px", color: "#4B5563" }}>{v.Firmness}</td>
                          <td style={{ padding: "8px 10px", width: "120px" }}>
                            <input
                              type="number"
                              value={v.Actual_Price}
                              onChange={(e) => updateVariantField(v.Size, v.Firmness, "Actual_Price", e.target.value)}
                              style={{ ...inputStyle, height: "36px", padding: "0 10px", fontWeight: 700, color: "#14151A" }}
                              placeholder="699"
                              min="1"
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
                              onChange={(e) => updateVariantField(v.Size, v.Firmness, "Stock", e.target.value)}
                              style={{ ...inputStyle, height: "36px", padding: "0 8px" }}
                              min="0"
                              required
                            />
                          </td>
                          <td style={{ padding: "8px 10px", width: "80px" }}>
                            <input
                              type="number"
                              value={v.Threshold}
                              onChange={(e) => updateVariantField(v.Size, v.Firmness, "Threshold", e.target.value)}
                              style={{ ...inputStyle, height: "36px", padding: "0 8px" }}
                              min="0"
                            />
                          </td>
                          <td style={{ padding: "8px 10px", width: "120px" }}>
                            <select
                              value={v.Status}
                              onChange={(e) => updateVariantField(v.Size, v.Firmness, "Status", e.target.value)}
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

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => navigateTo("product-details", product.id)}
              style={cancelBtnStyle}
            >
              Cancel
            </button>
            <button type="submit" className="admin-btn-hover" style={saveBtnStyle}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const cardStyle = { backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E7E2", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" };
const cardTitleStyle = { fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 };
const labelStyle = { fontSize: "13px", fontWeight: 600, color: "#6B6B75" };
const errStyle = { fontSize: "12px", color: "#DC2626", fontWeight: 500 };
const inputStyle = { height: "42px", padding: "0 14px", border: "1px solid #E7E7E2", borderRadius: "10px", fontSize: "14px", color: "#14151A", backgroundColor: "#FFFFFF", fontFamily: "inherit", outline: "none", transition: "border-color 0.2s ease", width: "100%", boxSizing: "border-box" };
const cancelBtnStyle = { height: "44px", padding: "0 24px", border: "1px solid #E7E7E2", borderRadius: "10px", backgroundColor: "#FFFFFF", color: "#14151A", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" };
const saveBtnStyle = { height: "44px", padding: "0 28px", border: "none", borderRadius: "10px", backgroundColor: "#1B1F8C", color: "#FFFFFF", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" };
const thStyle = { textAlign: "left", padding: "8px 10px", fontSize: "11px", fontWeight: 700, color: "#6B6B75", textTransform: "uppercase", letterSpacing: "0.05em" };
