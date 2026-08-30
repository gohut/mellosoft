"use client";

import React, { useState, useEffect } from "react";
import { STANDARD_SIZES, getCalculatedPrice } from "../data/mattressData";
import { formatPrice, getEffectivePrice } from "../utils/currency";

export default function MattressSelector({ product, onSelectionChange, onEnquire, discountPercent = 0 }) {
  // Variants (e.g. BLOOM 6', BLOOM 8' or thickness options)
  const variantOptions = product?.variantsList || product?.thicknessOptions || ["4 inch", "5 inch"];
  const [selectedVariant, setSelectedVariant] = useState(variantOptions[0]);

  // Size Category: Single, Double, Queen, King
  const availableCategories = product?.sizeOptions || ["Single", "Double", "Queen", "King"];
  const [selectedCategory, setSelectedCategory] = useState(availableCategories[0] || "Queen");

  // Get active dimensions for selected category
  const getDimensionsForCategory = (catName) => {
    if (product?.bedSizes && product.bedSizes[catName]?.dimensions) {
      return product.bedSizes[catName].dimensions;
    }
    return STANDARD_SIZES[catName] || [];
  };

  const currentDimensions = getDimensionsForCategory(selectedCategory);
  const [selectedDimension, setSelectedDimension] = useState(currentDimensions[0] || "78 x 60");

  // Update dimension when category changes
  useEffect(() => {
    const dims = getDimensionsForCategory(selectedCategory);
    if (dims.length > 0 && !dims.includes(selectedDimension)) {
      setSelectedDimension(dims[0]);
    }
  }, [selectedCategory]);

  // Calculate dynamic price from matrix or catalogue helper
  const calculatePrice = () => {
    if (!product) return null;

    // 1. Direct matrix pricing object lookup
    if (product.prices && product.prices[selectedVariant] && product.prices[selectedVariant][selectedDimension] !== undefined) {
      const p = product.prices[selectedVariant][selectedDimension];
      if (typeof p === "number" && p > 0) return p;
    }

    // 2. Fallback to catalogue helper function
    return getCalculatedPrice(product.id, selectedVariant, selectedDimension);
  };

  const price = calculatePrice();

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange({
        thickness: selectedVariant,
        variantName: selectedVariant,
        sizeCategory: selectedCategory,
        dimension: selectedDimension,
        price: price
      });
    }
  }, [selectedVariant, selectedCategory, selectedDimension, price]);

  return (
    <div style={selectorContainerStyle}>
      {/* 1. VARIANT SELECTOR */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          VARIANT: <strong style={{ color: "#1B1F8C" }}>{selectedVariant}</strong>
        </label>
        <div style={optionsGridStyle}>
          {variantOptions.map((opt) => {
            const isSelected = opt === selectedVariant;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setSelectedVariant(opt)}
                style={{
                  ...optionButtonStyle,
                  backgroundColor: isSelected ? "#1B1F8C" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "#14151A",
                  borderColor: isSelected ? "#1B1F8C" : "#E7E7E2"
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. LAYER COMPOSITION / SPECS FOR SELECTED VARIANT */}
      {product?.layers && product.layers[selectedVariant] && (
        <div style={layerInfoBoxStyle}>
          <span style={layerInfoLabelStyle}>Layer Details ({selectedVariant}):</span>
          <span style={layerInfoValueStyle}>{product.layers[selectedVariant]}</span>
        </div>
      )}

      {/* 3. SIZE CATEGORY SELECTOR */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          BED SIZE: <strong style={{ color: "#1B1F8C" }}>{selectedCategory.toUpperCase()}</strong>
        </label>
        <div style={optionsGridStyle}>
          {availableCategories.map((cat) => {
            const isSelected = cat === selectedCategory;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...optionButtonStyle,
                  backgroundColor: isSelected ? "#1B1F8C" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "#14151A",
                  borderColor: isSelected ? "#1B1F8C" : "#E7E7E2"
                }}
              >
                {cat.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. DIMENSIONS SELECTOR */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          DIMENSION (inches): <strong style={{ color: "#1B1F8C" }}>{selectedDimension}</strong>
        </label>
        <div style={dimensionsGridStyle}>
          {currentDimensions.map((dim) => {
            const isSelected = dim === selectedDimension;
            return (
              <button
                key={dim}
                type="button"
                onClick={() => setSelectedDimension(dim)}
                style={{
                  ...dimButtonStyle,
                  backgroundColor: isSelected ? "#F0F3FF" : "#FFFFFF",
                  color: isSelected ? "#1B1F8C" : "#14151A",
                  borderColor: isSelected ? "#1B1F8C" : "#E7E7E2",
                  fontWeight: isSelected ? "700" : "500"
                }}
              >
                {dim}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. DYNAMIC PRICE DISPLAY */}
      <div style={priceCardStyle} className="mattress-price-card">
        <div>
          <span style={priceLabelStyle}>Calculated Price</span>
          {price !== null && price !== undefined ? (() => {
            const pct = Number(discountPercent) || 0;
            const { hasDiscount, discountedPrice, discountedPrice: dp } = getEffectivePrice(price, pct);
            return (
              <div>
                {hasDiscount && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                    <span style={{ fontSize: "13px", color: "#9CA3AF", textDecoration: "line-through", fontWeight: 500 }}>
                      {formatPrice(price)}
                    </span>
                    <span style={{ backgroundColor: "#DCFCE7", color: "#15803D", fontSize: "11px", fontWeight: 800, padding: "2px 8px", borderRadius: "999px" }}>
                      {pct}% OFF
                    </span>
                  </div>
                )}
                <div style={priceValueStyle}>{formatPrice(hasDiscount ? dp : price)}</div>
              </div>
            );
          })() : (
            <div style={contactPriceStyle}>Contact for Price</div>
          )}
        </div>

        {price === null || price === undefined ? (
          <button
            type="button"
            onClick={() => onEnquire && onEnquire({ variant: selectedVariant, size: selectedDimension })}
            style={enquireBtnStyle}
          >
            Enquire Now
          </button>
        ) : null}
      </div>
    </div>
  );
}

const selectorContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  backgroundColor: "transparent",
  padding: "0",
  border: "none",
  outline: "none",
  boxShadow: "none"
};

const sectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.8px",
  color: "#6B6B75",
  textTransform: "uppercase"
};

const optionsGridStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px"
};

const optionButtonStyle = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "1.5px solid #E7E7E2",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const dimensionsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
  gap: "8px"
};

const dimButtonStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #E7E7E2",
  fontSize: "13px",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const layerInfoBoxStyle = {
  backgroundColor: "#EFF6FF",
  border: "1px solid #BFDBFE",
  borderRadius: "10px",
  padding: "12px 16px",
  display: "flex",
  gap: "8px",
  fontSize: "13px"
};

const layerInfoLabelStyle = {
  fontWeight: "700",
  color: "#1E40AF"
};

const layerInfoValueStyle = {
  color: "#1E3A8A"
};

const priceCardStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "transparent",
  padding: "0",
  borderRadius: "0",
  border: "none",
  boxShadow: "none",
  outline: "none",
  marginTop: "2px"
};

const priceLabelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  color: "#6B6B75"
};

const priceValueStyle = {
  fontSize: "26px",
  fontWeight: "800",
  color: "#1B1F8C",
  marginTop: "2px"
};

const contactPriceStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#D97706",
  marginTop: "2px"
};

const enquireBtnStyle = {
  padding: "12px 24px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "999px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer"
};
