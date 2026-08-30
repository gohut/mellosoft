"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useAdmin } from "../context/AdminContext";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusBadge from "../components/StatusBadge";
import { formatPrice, calculateDiscountedPrice } from "../../utils/currency";
import { buildVariants, getVariantForSelection } from "../../utils/variantHelpers";
import { getProductPrimaryImage, getProductGalleryImages, getProductCategoryLabel, getProductReviewStats } from "../../utils/productHelpers";
import {
  Pencil, Trash2, Star, Package, ChevronLeft, ChevronRight,
  Tag, Layers, Ruler, Shield, Clock, Hash, Calendar, Thermometer,
  BarChart2, Users, CheckCircle, AlertTriangle, LayoutGrid, List, Search, Sparkles, Check,
} from "lucide-react";

function Stars({ rating }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          fill={s <= Math.round(rating) ? "#F59E0B" : "none"}
          color={s <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"}
        />
      ))}
    </div>
  );
}

function getBedCategoryForDimension(dim) {
  if (!dim || typeof dim !== "string") return "Standard";
  const d = dim.toLowerCase().replace(/\s+/g, "");
  if (d.includes("single") || d.includes("x30") || d.includes("x36")) return "Single";
  if (d.includes("double") || d.includes("x42") || d.includes("x44") || d.includes("x48")) return "Double";
  if (d.includes("queen") || d.includes("x60")) return "Queen";
  if (d.includes("king") || d.includes("x72")) return "King";
  return "Standard";
}

const BED_CATEGORY_BADGE_COLORS = {
  Single: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  Double: { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" },
  Queen: { bg: "#FDF2F8", color: "#BE185D", border: "#FBCFE8" },
  King: { bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" },
  Standard: { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
};

export default function AdminProductDetailView() {
  const { products, selectedProductId, navigateTo, updateProduct, deleteProduct, hasPermission, reviews = [] } = useAdmin();
  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const reviewStats = useMemo(() => {
    return getProductReviewStats(product, reviews);
  }, [product, reviews]);

  const displayedReviews = useMemo(() => {
    if (!product?.id) return [];
    const normId = String(product.id || "").toLowerCase().trim();
    const adminMatching = (reviews || []).filter((r) => {
      const rProdId = String(r.productId || r.product_id || r.product || "").toLowerCase().trim();
      const isApproved = (r.status || "Approved").toLowerCase() === "approved";
      return isApproved && (rProdId === normId || (rProdId && normId && (rProdId.includes(normId) || normId.includes(rProdId))));
    });

    if (adminMatching.length > 0) {
      return adminMatching.map((r) => ({
        id: r.id,
        author: r.customerName || r.author || r.name || "Verified Customer",
        rating: Number(r.rating) || 5,
        date: r.date || r.createdAt || "Recently",
        content: r.comment || r.content || r.title || "Great product quality!",
      }));
    }

    if (Array.isArray(product.reviews) && product.reviews.length > 0) {
      return product.reviews;
    }

    return [];
  }, [product, reviews]);

  const [activeImg, setActiveImg] = useState(0);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedBedCategory, setSelectedBedCategory] = useState("All");
  const [matrixSearch, setMatrixSearch] = useState("");
  const [matrixViewMode, setMatrixViewMode] = useState("matrix"); // "matrix" | "table"

  // Quick Stock Management Modal State
  const [mounted, setMounted] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingStockMap, setEditingStockMap] = useState({});
  const [bulkModalStock, setBulkModalStock] = useState("");
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [isSavingStock, setIsSavingStock] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when Quick Stock Modal is active
  useEffect(() => {
    if (showStockModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showStockModal]);

  // Available size and firmness options
  const sizes = useMemo(() => product?.availableSizes || product?.sizeOptions || product?.sizes || ["Twin", "Full", "Queen", "King"], [product]);
  const firmnessList = useMemo(() => product?.availableFirmness || product?.firmnessOptions || product?.firmness || ["Soft", "Medium", "Firm"], [product]);

  const effectiveVariants = useMemo(() => {
    return product?.variants && product.variants.length > 0
      ? product.variants
      : buildVariants(
          sizes,
          firmnessList,
          [],
          Number(product?.Actual_Price ?? product?.price) || 999
        );
  }, [product, sizes, firmnessList]);

  // Dynamic collections for the User-like product selector
  const variantOptions = useMemo(() => {
    const list = Array.from(new Set(effectiveVariants.map((v) => v.Firmness || v.VariantName || "Standard")));
    return list.length > 0 ? list : (product?.thicknessOptions || ["4 INCH", "5 INCH"]);
  }, [effectiveVariants, product]);

  const bedCategoryOptions = ["Single", "Double", "Queen", "King"];

  const [selectedVariantOption, setSelectedVariantOption] = useState(() => variantOptions[0] || "4 INCH");
  const [selectedBedSizeCategory, setSelectedBedSizeCategory] = useState("Single");

  const dimensionsForSelectedCategory = useMemo(() => {
    const matched = effectiveVariants.filter((v) => {
      const cat = getBedCategoryForDimension(v.Size);
      return cat === selectedBedSizeCategory;
    });
    const uniqueDims = Array.from(new Set(matched.map((v) => v.Size)));
    if (uniqueDims.length > 0) return uniqueDims;
    if (selectedBedSizeCategory === "Single") return ["72 X 30", "72 X 36", "75 X 30", "75 X 36", "78 X 30", "78 X 36", "84 X 36"];
    if (selectedBedSizeCategory === "Double") return ["72 X 42", "72 X 44", "72 X 48", "75 X 44", "75 X 48", "78 X 48", "84 X 48"];
    if (selectedBedSizeCategory === "Queen") return ["72 X 60", "75 X 60", "78 X 60", "84 X 60"];
    if (selectedBedSizeCategory === "King") return ["72 X 72", "75 X 72", "78 X 72", "84 X 72"];
    return [];
  }, [effectiveVariants, selectedBedSizeCategory]);

  const [selectedDimension, setSelectedDimension] = useState(() => dimensionsForSelectedCategory[0] || "72 X 30");

  // Selected Size + Firmness state
  const [selectedSize, setSelectedSize] = useState(() => dimensionsForSelectedCategory[0] || "72 X 30");
  const [selectedFirmness, setSelectedFirmness] = useState(() => variantOptions[0] || "4 INCH");

  // Keep dimensions and variant synced when category or options change
  useEffect(() => {
    if (dimensionsForSelectedCategory.length > 0 && !dimensionsForSelectedCategory.includes(selectedDimension)) {
      setSelectedDimension(dimensionsForSelectedCategory[0]);
    }
  }, [selectedBedSizeCategory, dimensionsForSelectedCategory, selectedDimension]);

  useEffect(() => {
    if (variantOptions.length > 0 && !variantOptions.includes(selectedVariantOption)) {
      setSelectedVariantOption(variantOptions[0]);
    }
  }, [variantOptions, selectedVariantOption]);

  // Sync to selectedSize and selectedFirmness so matrix table and inventory card track active selection
  useEffect(() => {
    setSelectedSize(selectedDimension);
    setSelectedFirmness(selectedVariantOption);
  }, [selectedDimension, selectedVariantOption]);

  // When clicking cells in the bottom matrix, reverse sync the top selectors
  const handleMatrixSelect = (dim, firm) => {
    setSelectedSize(dim);
    setSelectedFirmness(firm);
    setSelectedDimension(dim);
    setSelectedVariantOption(firm);
    const cat = getBedCategoryForDimension(dim);
    if (cat && cat !== "Standard") {
      setSelectedBedSizeCategory(cat);
    }
  };

  // Reset image index & selection when selected product changes
  useEffect(() => {
    setActiveImg(0);
  }, [selectedProductId]);

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

  // Dynamic selection lookup
  const selectedVariant = getVariantForSelection(product, selectedSize, selectedFirmness);

  const selectedActualPrice = selectedVariant?.Actual_Price !== undefined
    ? Number(selectedVariant.Actual_Price)
    : Number(product.Actual_Price ?? product.price ?? 999);

  const selectedDiscountedPrice = calculateDiscountedPrice(selectedActualPrice, discountPct);

  const selectedStock = selectedVariant?.Stock !== undefined
    ? Number(selectedVariant.Stock)
    : (typeof product.stock === "number" ? product.stock : 25);

  const selectedThreshold = selectedVariant?.Threshold !== undefined
    ? Number(selectedVariant.Threshold)
    : (product.threshold ?? 10);

  const selectedStatus = selectedVariant?.Status || (selectedStock === 0 ? "Out of Stock" : (selectedStock <= selectedThreshold ? "Low Stock" : "Active"));

  const isLowStock = selectedStock <= selectedThreshold && selectedStock > 0;

  // Matrix Pricing 2D Data Collections
  const distinctDimensions = useMemo(() => {
    return Array.from(new Set(effectiveVariants.map((v) => v.Size)));
  }, [effectiveVariants]);

  const distinctFirmness = useMemo(() => {
    return Array.from(new Set(effectiveVariants.map((v) => v.Firmness)));
  }, [effectiveVariants]);

  const variantMap = useMemo(() => {
    const map = new Map();
    effectiveVariants.forEach((v) => {
      const key = `${v.Size}:::${v.Firmness}`;
      map.set(key, v);
    });
    return map;
  }, [effectiveVariants]);

  const filteredDimensions = useMemo(() => {
    return distinctDimensions.filter((dim) => {
      const cat = getBedCategoryForDimension(dim);
      const matchesCat = selectedBedCategory === "All" || cat === selectedBedCategory;
      const matchesSearch = !matrixSearch || 
        dim.toLowerCase().includes(matrixSearch.toLowerCase()) || 
        cat.toLowerCase().includes(matrixSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [distinctDimensions, selectedBedCategory, matrixSearch]);

  const filteredTableRows = useMemo(() => {
    return effectiveVariants.filter((v) => {
      const cat = getBedCategoryForDimension(v.Size);
      const matchesCat = selectedBedCategory === "All" || cat === selectedBedCategory;
      const matchesSearch = !matrixSearch || 
        v.Size.toLowerCase().includes(matrixSearch.toLowerCase()) || 
        v.Firmness.toLowerCase().includes(matrixSearch.toLowerCase()) ||
        cat.toLowerCase().includes(matrixSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [effectiveVariants, selectedBedCategory, matrixSearch]);

  const categoryCounts = useMemo(() => {
    const counts = { All: distinctDimensions.length, Single: 0, Double: 0, Queen: 0, King: 0 };
    distinctDimensions.forEach((dim) => {
      const cat = getBedCategoryForDimension(dim);
      if (counts[cat] !== undefined) counts[cat]++;
    });
    return counts;
  }, [distinctDimensions]);

  const handleDelete = () => {
    setShowDelete(false);
    deleteProduct(product.id);
    setToast({ msg: `Product "${product.name}" deleted.` });
    setTimeout(() => {
      setToast(null);
      navigateTo("products");
    }, 1200);
  };

  // Quick Stock Management Handlers
  const handleOpenStockModal = () => {
    const initialMap = {};
    effectiveVariants.forEach((v) => {
      const key = `${v.Size}__${v.Firmness}`;
      initialMap[key] = {
        stock: v.Stock ?? 15,
        threshold: v.Threshold ?? 2,
        size: v.Size,
        firmness: v.Firmness,
      };
    });
    setEditingStockMap(initialMap);
    setBulkModalStock("");
    setModalSearchQuery("");
    setShowStockModal(true);
  };

  const handleApplyModalBulkStock = (presetVal) => {
    const targetVal = presetVal !== undefined ? presetVal : bulkModalStock;
    if (targetVal === "" || targetVal === undefined) return;
    const val = Math.max(0, parseInt(targetVal, 10) || 0);
    const updated = { ...editingStockMap };
    Object.keys(updated).forEach((k) => {
      updated[k] = { ...updated[k], stock: val };
    });
    setEditingStockMap(updated);
    if (presetVal !== undefined) setBulkModalStock(String(presetVal));
  };

  const handleStepStock = (key, delta) => {
    const current = Number(editingStockMap[key]?.stock ?? 15);
    const nextVal = Math.max(0, current + delta);
    setEditingStockMap((prev) => ({
      ...prev,
      [key]: { ...prev[key], stock: nextVal },
    }));
  };

  const handleStockInputChange = (key, val) => {
    const num = val === "" ? "" : Math.max(0, parseInt(val, 10) || 0);
    setEditingStockMap((prev) => ({
      ...prev,
      [key]: { ...prev[key], stock: num },
    }));
  };

  const handleThresholdInputChange = (key, val) => {
    const num = val === "" ? "" : Math.max(0, parseInt(val, 10) || 0);
    setEditingStockMap((prev) => ({
      ...prev,
      [key]: { ...prev[key], threshold: num },
    }));
  };

  const handleSaveStockModal = () => {
    setIsSavingStock(true);
    const updatedVariants = (effectiveVariants || []).map((v) => {
      const key = `${v.Size}__${v.Firmness}`;
      const override = editingStockMap[key];
      if (override) {
        const s = typeof override.stock === "number" ? override.stock : (parseInt(override.stock, 10) || 0);
        const th = typeof override.threshold === "number" ? override.threshold : (parseInt(override.threshold, 10) || 2);
        const status = s === 0 ? "Out of Stock" : (s <= th ? "Low Stock" : "Active");
        return {
          ...v,
          Stock: s,
          stock: s,
          Threshold: th,
          threshold: th,
          Status: status,
          status: status,
        };
      }
      return v;
    });

    const updatedProduct = {
      ...product,
      variants: updatedVariants,
    };

    updateProduct(updatedProduct);
    setIsSavingStock(false);
    setShowStockModal(false);
    setToast({ msg: "✓ Stock inventory updated successfully!" });
    setTimeout(() => setToast(null), 3000);
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
        <div style={{ display: "flex", gap: "10px", flexShrink: 0, flexWrap: "wrap" }}>
          {hasPermission("products", "edit") && (
            <button
              onClick={handleOpenStockModal}
              style={stockBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#047857"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#059669"; }}
              title="Quickly view and update variant stock quantities"
            >
              <Package size={16} />
              Manage Stock
            </button>
          )}
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

          {/* Customer Reviews (Occupies the Left Column Space) */}
          {displayedReviews.length > 0 && (
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={cardTitleStyle}>
                  <Users size={15} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                  Customer Reviews ({displayedReviews.length})
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Stars rating={reviewStats.averageRating} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#14151A", marginLeft: "4px" }}>
                    {reviewStats.averageRating}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
                {displayedReviews.map((r) => (
                  <div key={r.id} style={{ borderBottom: "1px solid #F0F0EC", paddingBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 700, fontSize: "13.5px", color: "#14151A" }}>{r.author}</span>
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{r.date}</span>
                    </div>
                    <Stars rating={r.rating} />
                    <p style={{ fontSize: "13px", color: "#4B5563", margin: "6px 0 0", lineHeight: 1.55 }}>{r.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Product info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Core info card (Styled like Storefront User UI) */}
          <div style={cardStyle}>
            {/* Subtitle / Brand Series & Badges */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "11.5px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#16A34A" }}>
                MELLOSOFT PREMIUM SERIES
              </span>
              {product.badge && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    backgroundColor: product.badgeColor || "#DC2626",
                    padding: "2px 10px",
                    borderRadius: "999px",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em"
                  }}
                >
                  {product.badge}
                </span>
              )}
              <StatusBadge status={selectedStatus} />
            </div>

            {/* Product Title */}
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1B1F8C", margin: "6px 0 2px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              {product.name}
            </h2>

            {/* Tagline */}
            {product.tagline && (
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "0 0 6px", fontStyle: "italic" }}>
                "{product.tagline}"
              </p>
            )}

            {/* Construction */}
            <p style={{ fontSize: "13.5px", color: "#374151", margin: "0 0 8px" }}>
              Construction: <strong style={{ color: "#1B1F8C", fontWeight: 700 }}>{product.construction || product.material || "Premium PU Foam"}</strong>
            </p>

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingBottom: "14px", borderBottom: "1px solid #E7E7E2" }}>
              <span style={{ color: "#F59E0B", fontSize: "14px" }}>⭐</span>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "#14151A" }}>{reviewStats.averageRating}</span>
              <span style={{ fontSize: "13px", color: "#6B6B75" }}>
                ({displayedReviews.length} {displayedReviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>

            {/* 1. VARIANT Selection */}
            {variantOptions.length > 0 && (
              <div style={{ marginTop: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 800, color: "#6B6B75", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  VARIANT: <strong style={{ color: "#1B1F8C" }}>{selectedVariantOption}</strong>
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {variantOptions.map((opt) => {
                    const isSelected = opt === selectedVariantOption;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedVariantOption(opt)}
                        style={{
                          height: "36px",
                          padding: "0 18px",
                          borderRadius: "8px",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          border: "1px solid",
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#1B1F8C" : "#FFFFFF",
                          color: isSelected ? "#FFFFFF" : "#14151A",
                          borderColor: isSelected ? "#1B1F8C" : "#E7E7E2",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. BED SIZE Selection */}
            <div style={{ marginTop: "4px" }}>
              <label style={{ fontSize: "12px", fontWeight: 800, color: "#6B6B75", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                BED SIZE: <strong style={{ color: "#1B1F8C" }}>{selectedBedSizeCategory.toUpperCase()}</strong>
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {bedCategoryOptions.map((cat) => {
                  const isSelected = cat === selectedBedSizeCategory;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedBedSizeCategory(cat)}
                      style={{
                        height: "36px",
                        padding: "0 18px",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        border: "1px solid",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#1B1F8C" : "#FFFFFF",
                        color: isSelected ? "#FFFFFF" : "#14151A",
                        borderColor: isSelected ? "#1B1F8C" : "#E7E7E2",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {cat.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. DIMENSION (INCHES) Selection */}
            <div style={{ marginTop: "4px" }}>
              <label style={{ fontSize: "12px", fontWeight: 800, color: "#6B6B75", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                DIMENSION (INCHES): <strong style={{ color: "#1B1F8C" }}>{selectedDimension}</strong>
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {dimensionsForSelectedCategory.map((dim) => {
                  const isSelected = dim === selectedDimension;
                  return (
                    <button
                      key={dim}
                      type="button"
                      onClick={() => setSelectedDimension(dim)}
                      style={{
                        height: "34px",
                        padding: "0 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: isSelected ? 800 : 600,
                        border: "1px solid",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#EEF0FF" : "#FFFFFF",
                        color: isSelected ? "#1B1F8C" : "#14151A",
                        borderColor: isSelected ? "#1B1F8C" : "#E7E7E2",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {dim}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Calculated Price Block */}
            <div style={{ backgroundColor: "#F7F8FF", padding: "16px 20px", borderRadius: "12px", border: "1px solid #DCE4FF", marginTop: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#6B6B75", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Calculated Price
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "2px" }}>
                {discountPct > 0 && selectedActualPrice > selectedDiscountedPrice && (
                  <span style={{ fontSize: "14px", color: "#9CA3AF", textDecoration: "line-through" }}>
                    {formatPrice(selectedActualPrice)}
                  </span>
                )}
                {discountPct > 0 && (
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#16A34A", backgroundColor: "#DCFCE7", padding: "2px 8px", borderRadius: "4px" }}>
                    {discountPct}% OFF
                  </span>
                )}
              </div>
              <div style={{ fontSize: "32px", fontWeight: 900, color: "#1B1F8C", letterSpacing: "-0.02em" }}>
                {formatPrice(selectedDiscountedPrice)}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p style={{ fontSize: "14px", color: "#4B5563", lineHeight: 1.7, margin: "8px 0 0" }}>{product.description}</p>
            )}
          </div>

          {/* Key Features (Placed on Right Column above Inventory & Logistics) */}
          {product.features && product.features.length > 0 && (
            <div style={cardStyle}>
              <h4 style={cardTitleStyle}>Key Features</h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
                {product.features.map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13.5px", color: "#4B5563", lineHeight: 1.45, backgroundColor: "#FAFAF7", padding: "8px 12px", borderRadius: "8px", border: "1px solid #F0F0EC" }}>
                    <span style={{ color: "#16A34A", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
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

      {/* ── FULL WIDTH SIZE & FIRMNESS MATRIX PRICING TABLE (IN LAST) ── */}
      {effectiveVariants.length > 0 && (
        <div style={{ ...cardStyle, width: "100%", overflow: "hidden" }}>
          {/* Card Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", borderBottom: "1px solid #E7E7E2", paddingBottom: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h4 style={{ ...cardTitleStyle, fontSize: "17px" }}>
                  Size & Firmness Pricing Matrix
                </h4>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#1B1F8C", backgroundColor: "#EEF0FF", padding: "2px 10px", borderRadius: "999px" }}>
                  {effectiveVariants.length} Combinations
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#6B6B75", margin: "4px 0 0" }}>
                Interactive matrix pricing based on variant dimensions and firmness / thickness. Click any cell to select.
              </p>
            </div>

            {/* View Mode Toggle & Search */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <Search size={14} color="#9CA3AF" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  value={matrixSearch}
                  onChange={(e) => setMatrixSearch(e.target.value)}
                  placeholder="Search dimension..."
                  style={{
                    height: "34px",
                    paddingLeft: "30px",
                    paddingRight: "10px",
                    borderRadius: "8px",
                    border: "1px solid #E7E7E2",
                    fontSize: "12.5px",
                    backgroundColor: "#FAFAF7",
                    outline: "none",
                    width: "170px",
                  }}
                />
              </div>

              {/* View mode toggle */}
              <div style={{ display: "flex", backgroundColor: "#F7F7F2", padding: "3px", borderRadius: "8px", border: "1px solid #E7E7E2" }}>
                <button
                  type="button"
                  onClick={() => setMatrixViewMode("matrix")}
                  style={{
                    border: "none",
                    backgroundColor: matrixViewMode === "matrix" ? "#FFFFFF" : "transparent",
                    color: matrixViewMode === "matrix" ? "#1B1F8C" : "#6B6B75",
                    fontSize: "12px",
                    fontWeight: matrixViewMode === "matrix" ? 700 : 500,
                    padding: "4px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    boxShadow: matrixViewMode === "matrix" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  <LayoutGrid size={13} />
                  <span>Matrix View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixViewMode("table")}
                  style={{
                    border: "none",
                    backgroundColor: matrixViewMode === "table" ? "#FFFFFF" : "transparent",
                    color: matrixViewMode === "table" ? "#1B1F8C" : "#6B6B75",
                    fontSize: "12px",
                    fontWeight: matrixViewMode === "table" ? 700 : 500,
                    padding: "4px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    boxShadow: matrixViewMode === "table" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  <List size={13} />
                  <span>Table List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bed Category Preset Filter Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", margin: "14px 0 6px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#6B6B75", textTransform: "uppercase", marginRight: "4px" }}>
              Bed Category:
            </span>
            {["All", "Single", "Double", "Queen", "King"].map((cat) => {
              const isActive = selectedBedCategory === cat;
              const count = categoryCounts[cat] || (cat === "All" ? distinctDimensions.length : 0);
              const colorTheme = BED_CATEGORY_BADGE_COLORS[cat] || { bg: "#F3F4F6", color: "#14151A", border: "#E7E7E2" };
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedBedCategory(cat)}
                  style={{
                    border: "1px solid",
                    borderColor: isActive ? "#1B1F8C" : colorTheme.border,
                    backgroundColor: isActive ? "#1B1F8C" : colorTheme.bg,
                    color: isActive ? "#FFFFFF" : colorTheme.color,
                    padding: "5px 12px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: isActive ? 700 : 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{cat === "All" ? "All Sizes" : cat}</span>
                  <span
                    style={{
                      fontSize: "10.5px",
                      padding: "1px 6px",
                      borderRadius: "999px",
                      backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
                      color: isActive ? "#FFFFFF" : "inherit",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── MATRIX VIEW (2D Pivot Table: Dimensions x Firmness/Variants) ── */}
          {matrixViewMode === "matrix" ? (
            <div style={{ overflowX: "auto", marginTop: "12px" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F7F7F2" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#14151A",
                        borderBottom: "2px solid #E7E7E2",
                        borderRight: "1px solid #E7E7E2",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#F7F7F2",
                        zIndex: 2,
                        minWidth: "170px",
                      }}
                    >
                      DIMENSION / SIZE
                    </th>
                    {distinctFirmness.map((f) => (
                      <th
                        key={f}
                        style={{
                          textAlign: "center",
                          padding: "12px 16px",
                          fontSize: "12.5px",
                          fontWeight: 800,
                          color: "#1B1F8C",
                          borderBottom: "2px solid #E7E7E2",
                          borderRight: "1px solid #E7E7E2",
                          minWidth: "180px",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                          <span>{f}</span>
                          <span style={{ fontSize: "10.5px", fontWeight: 600, color: "#6B6B75", textTransform: "uppercase" }}>Variant</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDimensions.map((dim, idx) => {
                    const bedCat = getBedCategoryForDimension(dim);
                    const badgeColor = BED_CATEGORY_BADGE_COLORS[bedCat] || BED_CATEGORY_BADGE_COLORS.Standard;
                    return (
                      <tr
                        key={dim}
                        style={{
                          backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAFAF7",
                        }}
                      >
                        {/* Dimension Row Header */}
                        <td
                          style={{
                            padding: "12px 14px",
                            fontWeight: 700,
                            color: "#14151A",
                            borderBottom: "1px solid #E7E7E2",
                            borderRight: "1px solid #E7E7E2",
                            position: "sticky",
                            left: 0,
                            backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAFAF7",
                            zIndex: 1,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                backgroundColor: badgeColor.bg,
                                color: badgeColor.color,
                                border: `1px solid ${badgeColor.border}`,
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              {bedCat}
                            </span>
                            <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#14151A" }}>{dim}</span>
                          </div>
                        </td>

                        {/* Each Firmness / Variant Cell */}
                        {distinctFirmness.map((f) => {
                          const v = variantMap.get(`${dim}:::${f}`);
                          if (!v) {
                            return (
                              <td
                                key={f}
                                style={{
                                  padding: "12px 16px",
                                  textAlign: "center",
                                  color: "#9CA3AF",
                                  borderBottom: "1px solid #E7E7E2",
                                  borderRight: "1px solid #E7E7E2",
                                  fontSize: "12px",
                                }}
                              >
                                —
                              </td>
                            );
                          }

                          const isSelected = selectedSize === dim && selectedFirmness === f;
                          const vDiscPrice = calculateDiscountedPrice(v.Actual_Price, discountPct);

                          return (
                            <td
                              key={f}
                              onClick={() => {
                                setSelectedSize(dim);
                                setSelectedFirmness(f);
                              }}
                              style={{
                                padding: "10px 14px",
                                borderBottom: "1px solid #E7E7E2",
                                borderRight: "1px solid #E7E7E2",
                                backgroundColor: isSelected ? "#EEF0FF" : "transparent",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                outline: isSelected ? "2px solid #1B1F8C" : "none",
                                outlineOffset: "-2px",
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.backgroundColor = "#F3F4F6";
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "6px" }}>
                                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#16A34A" }}>
                                    {formatPrice(vDiscPrice)}
                                  </span>
                                  {discountPct > 0 && v.Actual_Price > vDiscPrice && (
                                    <span style={{ fontSize: "11px", color: "#9CA3AF", textDecoration: "line-through" }}>
                                      {formatPrice(v.Actual_Price)}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", marginTop: "2px" }}>
                                  <span style={{ fontSize: "11px", color: "#6B6B75", fontWeight: 500 }}>
                                    Stock: <strong style={{ color: "#14151A" }}>{v.Stock ?? 15}</strong>
                                  </span>
                                  {isSelected ? (
                                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#1B1F8C", backgroundColor: "#DBEAFE", padding: "1px 6px", borderRadius: "4px" }}>
                                      ✓ Selected
                                    </span>
                                  ) : (
                                    <StatusBadge status={v.Status || "Active"} />
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* ── TABLE LIST VIEW ── */
            <div style={{ overflowX: "auto", marginTop: "12px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F7F7F2", borderBottom: "2px solid #E7E7E2" }}>
                    <th style={{ textAlign: "left", padding: "10px 14px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase", fontWeight: 700 }}>Bed Category</th>
                    <th style={{ textAlign: "left", padding: "10px 14px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase", fontWeight: 700 }}>Dimension</th>
                    <th style={{ textAlign: "left", padding: "10px 14px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase", fontWeight: 700 }}>Firmness / Variant</th>
                    <th style={{ textAlign: "left", padding: "10px 14px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase", fontWeight: 700 }}>MRP Price</th>
                    <th style={{ textAlign: "left", padding: "10px 14px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase", fontWeight: 700 }}>Discount Price</th>
                    <th style={{ textAlign: "center", padding: "10px 14px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase", fontWeight: 700 }}>Stock</th>
                    <th style={{ textAlign: "center", padding: "10px 14px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase", fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableRows.map((v, i) => {
                    const isSelected = v.Size === selectedSize && v.Firmness === selectedFirmness;
                    const vDiscPrice = calculateDiscountedPrice(v.Actual_Price, discountPct);
                    const bedCat = getBedCategoryForDimension(v.Size);
                    const badgeColor = BED_CATEGORY_BADGE_COLORS[bedCat] || BED_CATEGORY_BADGE_COLORS.Standard;
                    return (
                      <tr
                        key={i}
                        onClick={() => handleMatrixSelect(v.Size, v.Firmness)}
                        style={{
                          borderBottom: "1px solid #F0F0EC",
                          backgroundColor: isSelected ? "#EEF0FF" : (i % 2 === 0 ? "#FFFFFF" : "#FAFAF7"),
                          borderLeft: isSelected ? "4px solid #1B1F8C" : "4px solid transparent",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <td style={{ padding: "10px 14px" }}>
                          <span
                            style={{
                              fontSize: "10.5px",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              backgroundColor: badgeColor.bg,
                              color: badgeColor.color,
                              border: `1px solid ${badgeColor.border}`,
                              padding: "2px 7px",
                              borderRadius: "4px",
                            }}
                          >
                            {bedCat}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: isSelected ? 700 : 600, color: "#14151A" }}>
                          {v.Size}
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1B1F8C" }}>
                          {v.Firmness}
                        </td>
                        <td style={{ padding: "10px 14px", color: "#6B6B75", textDecoration: discountPct > 0 ? "line-through" : "none" }}>
                          {formatPrice(v.Actual_Price)}
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: "#16A34A" }}>
                          {formatPrice(vDiscPrice)}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, color: "#14151A" }}>
                          {v.Stock ?? 15}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "center" }}>
                          <StatusBadge status={v.Status || "Active"} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Quick Stock Management Modal (Centered via Portal directly onto document.body) */}
      {showStockModal && mounted && typeof document !== "undefined" && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowStockModal(false);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 999999,
            backgroundColor: "rgba(255, 255, 255, 0.45)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "880px",
            maxHeight: "86vh",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #CBD5E1",
            boxShadow: "0 25px 70px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0,0,0,0.06)",
            overflow: "hidden",
            position: "relative",
            animation: "adminFadeIn 0.15s ease",
          }}>
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E7E7E2", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAFAF7" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Package size={20} color="#059669" />
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#14151A" }}>Quick Stock Inventory Manager</h3>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6B6B75" }}>
                  {product.Product_Name || product.name} — <code style={{ fontFamily: "monospace" }}>{product.Product_Id || product.id}</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", color: "#9CA3AF", cursor: "pointer", padding: "4px 8px" }}
              >
                ✕
              </button>
            </div>

            {/* Quick Bulk Update Bar */}
            <div style={{ padding: "16px 24px", backgroundColor: "#F0FDF4", borderBottom: "1px solid #DCFCE7", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#166534" }}>⚡ Bulk Set All:</span>
                <input
                  type="number"
                  min="0"
                  placeholder="25"
                  value={bulkModalStock}
                  onChange={(e) => setBulkModalStock(e.target.value)}
                  style={{ width: "65px", height: "32px", padding: "0 8px", borderRadius: "6px", border: "1px solid #86EFAC", fontSize: "13px", fontWeight: 700, textAlign: "center", backgroundColor: "#FFFFFF" }}
                />
                <button
                  type="button"
                  onClick={() => handleApplyModalBulkStock()}
                  style={{ backgroundColor: "#059669", color: "#FFFFFF", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "12.5px", fontWeight: 700, cursor: "pointer" }}
                >
                  Apply to All
                </button>
              </div>

              {/* Quick Presets */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "#15803D", fontWeight: 600 }}>Presets:</span>
                {[
                  { label: "0 (Out)", val: 0 },
                  { label: "10 (Low)", val: 10 },
                  { label: "25 (Default)", val: 25 },
                  { label: "50 (High)", val: 50 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleApplyModalBulkStock(p.val)}
                    style={{ backgroundColor: "#FFFFFF", color: "#166534", border: "1px solid #BBF7D0", borderRadius: "6px", padding: "4px 8px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Search */}
            <div style={{ padding: "12px 24px 0", display: "flex", gap: "10px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input
                  type="text"
                  placeholder="Filter by dimension, size or variant..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px 0 34px", borderRadius: "8px", border: "1px solid #E7E7E2", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Scrollable Variants Stock Table */}
            <div style={{ padding: "16px 24px", overflowY: "auto", flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F7F7F2", borderBottom: "2px solid #E7E7E2" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase" }}>Category</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase" }}>Dimension</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase" }}>Variant</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase", width: "220px" }}>Stock Quantity</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase", width: "110px" }}>Status</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase", width: "100px" }}>Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {effectiveVariants
                    .filter((v) => {
                      if (!modalSearchQuery) return true;
                      const q = modalSearchQuery.toLowerCase();
                      return (
                        (v.Size || "").toLowerCase().includes(q) ||
                        (v.Firmness || "").toLowerCase().includes(q) ||
                        getBedCategoryForDimension(v.Size).toLowerCase().includes(q)
                      );
                    })
                    .map((v, i) => {
                      const key = `${v.Size}__${v.Firmness}`;
                      const override = editingStockMap[key] || { stock: v.Stock ?? 15, threshold: v.Threshold ?? 2 };
                      const s = Number(override.stock) || 0;
                      const th = Number(override.threshold) || 2;
                      const bedCat = getBedCategoryForDimension(v.Size);
                      const badgeColor = BED_CATEGORY_BADGE_COLORS[bedCat] || BED_CATEGORY_BADGE_COLORS.Standard;

                      return (
                        <tr key={key} style={{ borderBottom: "1px solid #F0F0EC", backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#FAFAF7" }}>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ fontSize: "10.5px", fontWeight: 800, textTransform: "uppercase", backgroundColor: badgeColor.bg, color: badgeColor.color, border: `1px solid ${badgeColor.border}`, padding: "2px 6px", borderRadius: "4px" }}>
                              {bedCat}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", fontWeight: 700, color: "#14151A" }}>
                            {v.Size}
                          </td>
                          <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1B1F8C" }}>
                            {v.Firmness}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <button
                                type="button"
                                onClick={() => handleStepStock(key, -5)}
                                style={{ width: "28px", height: "28px", borderRadius: "4px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", fontSize: "11px", fontWeight: 700, color: "#64748B", cursor: "pointer" }}
                                title="Subtract 5"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStepStock(key, -1)}
                                style={{ width: "28px", height: "28px", borderRadius: "4px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", fontSize: "13px", fontWeight: 700, color: "#475569", cursor: "pointer" }}
                                title="Subtract 1"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={override.stock}
                                onChange={(e) => handleStockInputChange(key, e.target.value)}
                                style={{ width: "55px", height: "28px", textAlign: "center", borderRadius: "4px", border: s === 0 ? "1px solid #FCA5A5" : (s <= th ? "1px solid #FCD34D" : "1px solid #CBD5E1"), fontSize: "13px", fontWeight: 700, color: "#14151A" }}
                              />
                              <button
                                type="button"
                                onClick={() => handleStepStock(key, 1)}
                                style={{ width: "28px", height: "28px", borderRadius: "4px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", fontSize: "13px", fontWeight: 700, color: "#475569", cursor: "pointer" }}
                                title="Add 1"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStepStock(key, 5)}
                                style={{ width: "28px", height: "28px", borderRadius: "4px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", fontSize: "11px", fontWeight: 700, color: "#64748B", cursor: "pointer" }}
                                title="Add 5"
                              >
                                +5
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            <StatusBadge status={s === 0 ? "Out of Stock" : (s <= th ? "Low Stock" : "Active")} />
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            <input
                              type="number"
                              min="0"
                              value={override.threshold}
                              onChange={(e) => handleThresholdInputChange(key, e.target.value)}
                              style={{ width: "45px", height: "28px", textAlign: "center", borderRadius: "4px", border: "1px solid #E2E8F0", fontSize: "12px", color: "#6B6B75" }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #E7E7E2", display: "flex", justifyContent: "flex-end", gap: "12px", backgroundColor: "#FAFAF7" }}>
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStockModal}
                disabled={isSavingStock}
                style={{ padding: "10px 22px", borderRadius: "8px", border: "none", backgroundColor: "#059669", color: "#FFFFFF", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Check size={16} /> {isSavingStock ? "Saving..." : "Save Stock Changes"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

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

const stockBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  height: "42px",
  padding: "0 18px",
  backgroundColor: "#059669",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background-color 0.15s ease",
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
