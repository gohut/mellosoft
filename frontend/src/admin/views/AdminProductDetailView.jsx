"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAdmin } from "../context/AdminContext";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusBadge from "../components/StatusBadge";
import { formatPrice, calculateDiscountedPrice } from "../../utils/currency";
import { buildVariants, getVariantForSelection } from "../../utils/variantHelpers";
import { getProductPrimaryImage, getProductGalleryImages, getProductCategoryLabel } from "../../utils/productHelpers";
import {
  Pencil, Trash2, Star, Package, ChevronLeft, ChevronRight,
  Tag, Layers, Ruler, Shield, Clock, Hash, Calendar, Thermometer,
  BarChart2, Users, CheckCircle, AlertTriangle,
} from "lucide-react";

function Stars({ rating }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={16}
          fill={s <= Math.round(rating) ? "#F59E0B" : "none"}
          color={s <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"}
        />
      ))}
    </div>
  );
}

export default function AdminProductDetailView() {
  const { products, selectedProductId, navigateTo, deleteProduct, hasPermission } = useAdmin();
  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const [activeImg, setActiveImg] = useState(0);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState(null);

  // Available size and firmness options
  const sizes = useMemo(() => product?.availableSizes || product?.sizeOptions || product?.sizes || ["Twin", "Full", "Queen", "King"], [product]);
  const firmnessList = useMemo(() => product?.availableFirmness || product?.firmnessOptions || product?.firmness || ["Soft", "Medium", "Firm"], [product]);

  // Selected Size + Firmness state
  const [selectedSize, setSelectedSize] = useState(() => sizes[0] || "Twin");
  const [selectedFirmness, setSelectedFirmness] = useState(() => firmnessList[0] || "Soft");

  // Reset image index & selection when selected product changes
  useEffect(() => {
    setActiveImg(0);
    if (sizes.length > 0) setSelectedSize(sizes[0]);
    if (firmnessList.length > 0) setSelectedFirmness(firmnessList[0]);
  }, [selectedProductId, sizes, firmnessList]);

  if (!product) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "#6B6B75" }}>
        Product not found.{" "}
        <button onClick={() => navigateTo("products")} style={{ color: "#1B1F8C", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
          ← Back to Products
        </button>
      </div>
    );
  }

  const primaryImage = getProductPrimaryImage(product);
  const images = useMemo(() => {
    return getProductGalleryImages(product);
  }, [product]);

  const discountPct = typeof product.discountPercent === "number"
    ? product.discountPercent
    : (Number(product.Discount_Percentage) || 10);

  const effectiveVariants = product.variants && product.variants.length > 0
    ? product.variants
    : buildVariants(
        sizes,
        firmnessList,
        [],
        Number(product.Actual_Price ?? product.price) || 999
      );

  // Dynamic selection lookup
  const selectedVariant = getVariantForSelection(product, selectedSize, selectedFirmness);

  const selectedActualPrice = selectedVariant?.Actual_Price !== undefined
    ? Number(selectedVariant.Actual_Price)
    : Number(product.Actual_Price ?? product.price ?? 999);

  const selectedDiscountedPrice = calculateDiscountedPrice(selectedActualPrice, discountPct);

  const selectedStock = selectedVariant?.Stock !== undefined
    ? Number(selectedVariant.Stock)
    : (typeof product.stock === "number" ? product.stock : 15);

  const selectedThreshold = selectedVariant?.Threshold !== undefined
    ? Number(selectedVariant.Threshold)
    : (product.threshold ?? 10);

  const selectedStatus = selectedVariant?.Status || (selectedStock === 0 ? "Out of Stock" : (selectedStock <= selectedThreshold ? "Low Stock" : "Active"));

  const isLowStock = selectedStock <= selectedThreshold && selectedStock > 0;

  const handleDelete = () => {
    setShowDelete(false);
    deleteProduct(product.id);
    setToast({ msg: `Product "${product.name}" deleted.` });
    setTimeout(() => {
      setToast(null);
      navigateTo("products");
    }, 1200);
  };

  const prevImg = () => setActiveImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImg = () => setActiveImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {toast && (
        <div style={{
          position: "fixed", top: "80px", right: "24px", zIndex: 2000,
          backgroundColor: "#16A34A", color: "#FFF", padding: "12px 20px",
          borderRadius: "10px", fontWeight: 600, fontSize: "14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          animation: "adminFadeIn 0.25s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header row: title + action buttons */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#14151A", margin: 0 }}>{product.Product_Name || product.name}</h2>
          <p style={{ fontSize: "13px", color: "#6B6B75", margin: "4px 0 0" }}>
            ID: <code style={{ fontFamily: "monospace", backgroundColor: "#F0F0EC", padding: "1px 6px", borderRadius: "4px" }}>{product.Product_Id || product.id}</code>
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
          {hasPermission("products", "edit") && (
            <button
              onClick={() => navigateTo("edit-product", product.id)}
              style={editBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#14176C"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1B1F8C"; }}
            >
              <Pencil size={15} />
              Edit Product
            </button>
          )}
          {hasPermission("products", "delete") && (
            <button
              onClick={() => setShowDelete(true)}
              style={deleteBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#B91C1C"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#DC2626"; }}
            >
              <Trash2 size={15} />
              Delete Product
            </button>
          )}
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="admin-product-detail-grid" style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
        gap: "24px",
        alignItems: "start",
      }}>

        {/* LEFT: Image gallery, Key Features & Customer Reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Main image */}
          <div style={{ position: "relative", backgroundColor: "#F7F7F2", borderRadius: "16px", border: "1px solid #E7E7E2", overflow: "hidden", aspectRatio: "1 / 1", width: "100%" }}>
            <img
              src={images[activeImg] || primaryImage}
              alt={product.name || product.Product_Name || "Product image"}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/mattresses/foam/haven.jpg";
              }}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {images.length > 1 && (
              <>
                <button onClick={prevImg} style={arrowBtnStyle("left")}>
                  <ChevronLeft size={18} color="#14151A" />
                </button>
                <button onClick={nextImg} style={arrowBtnStyle("right")}>
                  <ChevronRight size={18} color="#14151A" />
                </button>
                <div style={{
                  position: "absolute", bottom: "10px", right: "10px",
                  backgroundColor: "rgba(0,0,0,0.5)", color: "#FFF",
                  fontSize: "12px", fontWeight: 600, padding: "3px 8px",
                  borderRadius: "999px",
                }}>
                  {activeImg + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail rail */}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: "64px", height: "64px", padding: 0, border: "2px solid",
                    borderColor: activeImg === i ? "#1B1F8C" : "#E7E7E2",
                    borderRadius: "8px", overflow: "hidden", cursor: "pointer",
                    transition: "border-color 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={img}
                    alt={`View ${i + 1}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/mattresses/foam/haven.jpg";
                    }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div style={cardStyle}>
              <h4 style={cardTitleStyle}>Key Features</h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {product.features.map((f, i) => (
                  <li key={i} style={{ display: "flex", gap: "8px", fontSize: "14px", color: "#4B5563", lineHeight: 1.5 }}>
                    <span style={{ color: "#16A34A", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reviews summary */}
          {product.reviews && product.reviews.length > 0 && (
            <div style={cardStyle}>
              <h4 style={cardTitleStyle}><Users size={15} style={{ marginRight: "6px", verticalAlign: "middle" }} />Customer Reviews ({product.reviews.length})</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "260px", overflowY: "auto" }}>
                {product.reviews.slice(0, 4).map((r) => (
                  <div key={r.id} style={{ borderBottom: "1px solid #F0F0EC", paddingBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600, fontSize: "13px", color: "#14151A" }}>{r.author}</span>
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{r.date}</span>
                    </div>
                    <Stars rating={r.rating} />
                    <p style={{ fontSize: "13px", color: "#6B6B75", margin: "6px 0 0", lineHeight: 1.5 }}>{r.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specs & metadata (Moved to Left Column) */}
          {(product.specs || product.id) && (
            <div style={cardStyle}>
              <h4 style={cardTitleStyle}>Specifications & Metadata</h4>
              {product.specs && (
                <div style={rowStyle}>
                  <span style={labelStyle}>Specs</span>
                  <span style={{ fontSize: "14px", color: "#14151A" }}>{product.specs}</span>
                </div>
              )}
              <div style={rowStyle}>
                <span style={labelStyle}><Hash size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} />Product ID</span>
                <code style={{ fontSize: "13px", fontFamily: "monospace", backgroundColor: "#F0F0EC", padding: "2px 8px", borderRadius: "4px", color: "#1B1F8C" }}>{product.id}</code>
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}><Calendar size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} />Category</span>
                <span style={{ fontSize: "14px", color: "#14151A" }}>{getProductCategoryLabel(product)}</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Product info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Core info card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6B6B75" }}>
                {getProductCategoryLabel(product)}
              </span>
              {product.badge && (
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#1B1F8C", backgroundColor: "#E8E9F8", padding: "2px 8px", borderRadius: "999px" }}>
                  {product.badge}
                </span>
              )}
              <StatusBadge status={selectedStatus} />
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#14151A", margin: "8px 0 4px", lineHeight: 1.25 }}>{product.name}</h3>
            {product.tagline && (
              <p style={{ fontSize: "14px", color: "#6B6B75", margin: "0 0 12px", fontStyle: "italic" }}>{product.tagline}</p>
            )}

            {/* Rating */}
            {product.rating && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Stars rating={product.rating} />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#14151A" }}>{product.rating}</span>
                {product.reviewCount && (
                  <span style={{ fontSize: "13px", color: "#6B6B75" }}>({product.reviewCount} reviews)</span>
                )}
              </div>
            )}

            {/* Variant Selectors: Size & Firmness */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px", padding: "14px", backgroundColor: "#FAFAF7", borderRadius: "10px", border: "1px solid #E7E7E2" }}>
              {/* Size Selector */}
              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#6B6B75", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Size
                </span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      style={{
                        height: "32px", padding: "0 14px", borderRadius: "999px",
                        fontSize: "12px", fontWeight: 600, border: "1px solid", cursor: "pointer",
                        backgroundColor: selectedSize === s ? "#1B1F8C" : "#FFFFFF",
                        color: selectedSize === s ? "#FFFFFF" : "#14151A",
                        borderColor: selectedSize === s ? "#1B1F8C" : "#E7E7E2",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Firmness Selector */}
              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#6B6B75", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Firmness
                </span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {firmnessList.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFirmness(f)}
                      style={{
                        height: "32px", padding: "0 14px", borderRadius: "999px",
                        fontSize: "12px", fontWeight: 600, border: "1px solid", cursor: "pointer",
                        backgroundColor: selectedFirmness === f ? "#1B1F8C" : "#FFFFFF",
                        color: selectedFirmness === f ? "#FFFFFF" : "#14151A",
                        borderColor: selectedFirmness === f ? "#1B1F8C" : "#E7E7E2",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Price block for selected combination */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "16px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#14151A" }}>{formatPrice(selectedDiscountedPrice)}</span>
              {discountPct > 0 && selectedActualPrice > selectedDiscountedPrice && (
                <span style={{ fontSize: "15px", color: "#6B6B75", textDecoration: "line-through" }}>
                  MRP: {formatPrice(selectedActualPrice)}
                </span>
              )}
              {discountPct > 0 && (
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#16A34A", backgroundColor: "#DCFCE7", padding: "3px 8px", borderRadius: "999px" }}>
                  {discountPct}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p style={{ fontSize: "14px", color: "#4B5563", lineHeight: 1.7, marginTop: "12px" }}>{product.description}</p>
            )}
          </div>

          {/* Variants card with row selection & highlight */}
          {effectiveVariants.length > 0 && (
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={cardTitleStyle}>Size & Firmness Variants ({effectiveVariants.length} Combinations)</h4>
                <span style={{ fontSize: "11px", color: "#6B6B75" }}>Click row to select</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#FAFAF7", borderBottom: "1px solid #E7E7E2" }}>
                      <th style={{ textAlign: "left", padding: "8px", fontSize: "11px", color: "#6B6B75", textTransform: "uppercase" }}>Variant</th>
                      <th style={{ textAlign: "left", padding: "8px", fontSize: "11px", color: "#6B6B75", textTransform: "uppercase" }}>Actual Price</th>
                      <th style={{ textAlign: "left", padding: "8px", fontSize: "11px", color: "#6B6B75", textTransform: "uppercase" }}>Discount Price</th>
                      <th style={{ textAlign: "center", padding: "8px", fontSize: "11px", color: "#6B6B75", textTransform: "uppercase" }}>Stock</th>
                      <th style={{ textAlign: "right", padding: "8px", fontSize: "11px", color: "#6B6B75", textTransform: "uppercase" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {effectiveVariants.map((v, i) => {
                      const isSelected = v.Size === selectedSize && v.Firmness === selectedFirmness;
                      const vDiscPrice = calculateDiscountedPrice(v.Actual_Price, discountPct);
                      return (
                        <tr
                          key={i}
                          onClick={() => {
                            setSelectedSize(v.Size);
                            setSelectedFirmness(v.Firmness);
                          }}
                          style={{
                            borderBottom: "1px solid #F0F0EC",
                            backgroundColor: isSelected ? "#F0F4FF" : "transparent",
                            borderLeft: isSelected ? "4px solid #1B1F8C" : "4px solid transparent",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <td style={{ padding: "8px", fontWeight: isSelected ? 700 : 600, color: "#14151A" }}>
                            {v.Size} + {v.Firmness}
                          </td>
                          <td style={{ padding: "8px", color: "#4B5563" }}>
                            {formatPrice(v.Actual_Price)}
                          </td>
                          <td style={{ padding: "8px", fontWeight: 700, color: "#16A34A" }}>
                            {formatPrice(vDiscPrice)}
                          </td>
                          <td style={{ padding: "8px", textAlign: "center", fontWeight: 600 }}>
                            {v.Stock}
                          </td>
                          <td style={{ padding: "8px", textAlign: "right" }}>
                            <StatusBadge status={v.Status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dynamic Inventory & Logistics card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={cardTitleStyle}>Inventory & Logistics ({selectedSize} + {selectedFirmness})</h4>
              {isLowStock && (
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#D97706", backgroundColor: "#FEF3C7", padding: "3px 8px", borderRadius: "999px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <AlertTriangle size={12} /> Low Stock Alert
                </span>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <InfoItem icon={<Package size={15} />} label="Stock Quantity" value={selectedStock} />
              <InfoItem icon={<BarChart2 size={15} />} label="Low-Stock Threshold" value={selectedThreshold} />
              <InfoItem icon={<CheckCircle size={15} />} label="Status" value={<StatusBadge status={selectedStatus} />} />
              {product.brand && <InfoItem icon={<Layers size={15} />} label="Brand" value={product.brand} />}
              {product.material && <InfoItem icon={<Layers size={15} />} label="Material" value={product.material} />}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Product?"
        message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        confirmLabel="Delete Product"
        confirmColor="#DC2626"
      />

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .admin-product-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", backgroundColor: "#FAFAF7", borderRadius: "8px", padding: "10px 12px", border: "1px solid #F0F0EC" }}>
      <span style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "4px" }}>
        {icon}{label}
      </span>
      <span style={{ fontSize: "14px", fontWeight: 600, color: "#14151A" }}>{value}</span>
    </div>
  );
}

const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  border: "1px solid #E7E7E2",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const cardTitleStyle = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#14151A",
  margin: 0,
  display: "flex",
  alignItems: "center",
};

const rowStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#6B6B75",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const editBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  height: "42px",
  padding: "0 18px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background-color 0.15s ease",
};

const deleteBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  height: "42px",
  padding: "0 18px",
  backgroundColor: "#DC2626",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background-color 0.15s ease",
};

function arrowBtnStyle(side) {
  return {
    position: "absolute",
    top: "50%",
    [side]: "8px",
    transform: "translateY(-50%)",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.88)",
    border: "1px solid #E7E7E2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  };
}
