"use client";

import React, { useState, useEffect, useMemo } from "react";
import { STANDARD_SIZES, getCalculatedPrice } from "../data/mattressData";
import { formatPrice, getEffectivePrice } from "../utils/currency";

function getBedCat(dim) {
  if (!dim || typeof dim !== "string") return null;
  const d = dim.toLowerCase().replace(/\s+/g, "");
  if (d.includes("single") || d.includes("x30") || d.includes("x36")) return "Single";
  if (d.includes("double") || d.includes("x42") || d.includes("x44") || d.includes("x48")) return "Double";
  if (d.includes("queen") || d.includes("x60")) return "Queen";
  if (d.includes("king") || d.includes("x72")) return "King";
  return null;
}

export default function MattressSelector({ product, onSelectionChange, onEnquire, discountPercent = 0 }) {
  // 1. Variant options (only real variants that exist in the product)
  const variantOptions = useMemo(() => {
    if (product?.variants && product.variants.length > 0) {
      const list = Array.from(new Set(product.variants.map((v) => v.Firmness || v.VariantName).filter(Boolean)));
      if (list.length > 0) return list;
    }
    if (Array.isArray(product?.variantsList) && product.variantsList.length > 0) return product.variantsList;
    if (Array.isArray(product?.thicknessOptions) && product.thicknessOptions.length > 0) return product.thicknessOptions;
    if (Array.isArray(product?.firmnessOptions) && product.firmnessOptions.length > 0) return product.firmnessOptions;
    if (product?.prices && typeof product.prices === "object" && Object.keys(product.prices).length > 0) {
      return Object.keys(product.prices);
    }
    return ["Standard"];
  }, [product]);

  const [selectedVariant, setSelectedVariant] = useState(() => variantOptions[0] || "Standard");

  useEffect(() => {
    if (variantOptions.length > 0 && !variantOptions.includes(selectedVariant)) {
      setSelectedVariant(variantOptions[0]);
    }
  }, [variantOptions, selectedVariant]);

  // 2. Available Bed Size Categories (Single, Double, Queen, King)
  // Only include categories that actually exist and have dimensions
  const availableCategories = useMemo(() => {
    if (product?.variants && product.variants.length > 0) {
      const cats = [];
      product.variants.forEach((v) => {
        const cat = v.SizeCategory || getBedCat(v.Size);
        if (cat && cat !== "Standard" && !cats.includes(cat)) {
          cats.push(cat);
        }
      });
      if (cats.length > 0) return cats;
    }

    if (product?.bedSizes) {
      const enabledCats = Object.keys(product.bedSizes).filter((cat) => {
        const c = product.bedSizes[cat];
        return c?.enabled && Array.isArray(c?.dimensions) && c.dimensions.length > 0;
      });
      if (enabledCats.length > 0) return enabledCats;
    }

    if (Array.isArray(product?.sizeOptions) && product.sizeOptions.length > 0) {
      const standardBedCats = ["Single", "Double", "Queen", "King"];
      const matched = product.sizeOptions.filter((s) => standardBedCats.includes(s));
      if (matched.length > 0) return matched;
    }

    return [];
  }, [product]);

  const [selectedCategory, setSelectedCategory] = useState(() => availableCategories[0] || "");

  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(selectedCategory)) {
      setSelectedCategory(availableCategories[0]);
    } else if (availableCategories.length === 0 && selectedCategory !== "") {
      setSelectedCategory("");
    }
  }, [availableCategories, selectedCategory]);

  // 3. Active dimensions for selected category or product
  const getDimensionsForCategory = (catName) => {
    if (catName && product?.bedSizes && product.bedSizes[catName]?.dimensions?.length > 0) {
      return product.bedSizes[catName].dimensions;
    }

    if (catName && product?.variants && product.variants.length > 0) {
      const matched = product.variants.filter((v) => {
        const cat = v.SizeCategory || getBedCat(v.Size);
        return cat === catName;
      });
      const uniqueDims = Array.from(new Set(matched.map((v) => v.Size).filter(Boolean)));
      if (uniqueDims.length > 0) return uniqueDims;
    }

    // Default catalogue mattress without explicit variants or bedSizes
    if (catName && STANDARD_SIZES[catName] && !product?.variants && !product?.bedSizes) {
      return STANDARD_SIZES[catName] || [];
    }

    // Fallback: If no category (accessory, standard size, or single combination)
    if (product?.variants && product.variants.length > 0) {
      return Array.from(new Set(product.variants.map((v) => v.Size).filter(Boolean)));
    }
    if (Array.isArray(product?.sizeOptions) && product.sizeOptions.length > 0) {
      return product.sizeOptions;
    }
    return ["Standard"];
  };

  const currentDimensions = getDimensionsForCategory(selectedCategory);
  const [selectedDimension, setSelectedDimension] = useState(() => currentDimensions[0] || "Standard");

  // Update dimension when category changes
  useEffect(() => {
    const dims = getDimensionsForCategory(selectedCategory);
    if (dims.length > 0 && !dims.includes(selectedDimension)) {
      setSelectedDimension(dims[0]);
    }
  }, [selectedCategory, product]);

  // Calculate dynamic price from matrix or catalogue helper
  const calculatePrice = () => {
    if (!product) return null;

    // 1. Match in product.variants
    if (product.variants && product.variants.length > 0) {
      const match = product.variants.find(
        (v) => (v.Firmness === selectedVariant || v.VariantName === selectedVariant) &&
               v.Size === selectedDimension
      ) || product.variants.find(
        (v) => v.Size === selectedDimension
      ) || product.variants[0];

      if (match?.Actual_Price !== undefined) {
        return Number(match.Actual_Price);
      }
    }

    // 2. Direct matrix pricing object lookup
    if (product.prices) {
      if (product.prices[selectedVariant] && product.prices[selectedVariant][selectedDimension] !== undefined) {
        const p = product.prices[selectedVariant][selectedDimension];
        if (typeof p === "number" && p > 0) return p;
      }
      if (product.prices[selectedDimension] !== undefined) {
        const p = product.prices[selectedDimension];
        if (typeof p === "number" && p > 0) return p;
      }
    }

    // 3. Fallback to catalogue helper function
    return getCalculatedPrice(product.id, selectedVariant, selectedDimension) ?? product.price ?? product.startingPrice ?? product.Actual_Price;
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
      {variantOptions.length > 0 && (
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
      )}

      {/* 2. LAYER COMPOSITION / SPECS FOR SELECTED VARIANT */}
      {product?.layers && product.layers[selectedVariant] && (
        <div style={layerInfoBoxStyle}>
          <span style={layerInfoLabelStyle}>Layer Details ({selectedVariant}):</span>
          <span style={layerInfoValueStyle}>{product.layers[selectedVariant]}</span>
        </div>
      )}

      {/* 3. SIZE CATEGORY SELECTOR - ONLY SHOWN IF MULTIPLE BED CATEGORIES EXIST */}
      {availableCategories.length > 1 && (
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
      )}

      {/* 4. DIMENSIONS SELECTOR */}
      {currentDimensions.length > 0 && (
        <div style={sectionStyle}>
          <label style={labelStyle}>
            DIMENSION{currentDimensions.length === 1 && currentDimensions[0].toLowerCase() === "standard" ? "" : " (inches)"}: <strong style={{ color: "#1B1F8C" }}>{selectedDimension}</strong>
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
      )}

      {/* 5. DYNAMIC PRICE DISPLAY */}
      <div style={priceCardStyle} className="mattress-price-card">
        <div>
          <span style={priceLabelStyle}>Price</span>
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
