"use client";

import React from "react";
import { useStore } from "../context/StoreContext";
import { formatPrice, calculateDiscountedPrice } from "../utils/currency";

export default function ProductCard({ product, variant }) {
  const { wishlist, toggleWishlist, navigateTo } = useStore();
  const isWishlisted = wishlist.includes(product.id);
  const specHighlights = getSpecHighlights(product.specs);
  const optionSummary = getOptionSummary(product);
  const primaryFeature = product.features?.[0];

  const handleWishlistClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    toggleWishlist(product.id);
  };

  const isBestSeller = variant === "bestSeller";

  return (
    <article
      onClick={() => navigateTo("detail", product.id)}
      style={isBestSeller ? bestSellerCardStyle : cardStyle}
      className={isBestSeller ? "product-card best-seller-card" : "product-card"}
    >
      <div style={isBestSeller ? bestSellerImageWrapperStyle : imageWrapperStyle}>
        <img src={product.images[0]} alt={product.name} style={imageStyle} />
        {product.badge && (
          <span style={isBestSeller ? bestSellerBadgeStyle : badgeStyle} className="pc-badge">
            {product.badge}
          </span>
        )}

        <button
          onClick={handleWishlistClick}
          style={isBestSeller ? bestSellerWishlistBtnStyle : wishlistBtnStyle}
          className="pc-wishlist-btn"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "#16A34A" : "none"}
            stroke={isWishlisted ? "#16A34A" : "#1B1F8C"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div style={isBestSeller ? bestSellerInfoWrapperStyle : infoWrapperStyle} className="pc-info">
        <div style={isBestSeller ? bestSellerTitleBlockStyle : titleBlockStyle}>
          {product.category && (
            <span style={isBestSeller ? bestSellerCategoryStyle : categoryStyle} className="pc-category">
              {product.category}
            </span>
          )}
          <h4 style={isBestSeller ? bestSellerTitleStyle : titleStyle}>{product.name}</h4>
          {product.tagline && <p style={taglineStyle} className="pc-tagline">{product.tagline}</p>}
        </div>

        {specHighlights.length > 0 && (
          <div style={specGridStyle} className="pc-spec-grid">
            {specHighlights.map((spec) => (
              <span key={spec} style={isBestSeller ? bestSellerSpecChipStyle : specChipStyle} className="pc-spec-chip">
                {spec}
              </span>
            ))}
          </div>
        )}

        {primaryFeature && <p style={featureStyle} className="pc-feature">{primaryFeature}</p>}

        <div style={detailsRowStyle} className="pc-details-row">
          <span style={isBestSeller ? bestSellerDetailPillStyle : detailPillStyle} className="pc-detail-pill">
            {optionSummary.sizes}
          </span>
          <span style={isBestSeller ? bestSellerDetailPillStyle : detailPillStyle} className="pc-detail-pill">
            {optionSummary.firmness}
          </span>
        </div>

        <div style={isBestSeller ? bestSellerMetaRowStyle : metaRowStyle}>
          <span style={isBestSeller ? bestSellerPriceStyle : priceStyle} className="pc-price">
            {formatPrice(product.price)}
          </span>
          <span style={compactRatingStyle} className="pc-rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#16A34A" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </article>
  );
}

function getSpecHighlights(specs) {
  if (!specs) return [];
  return specs
    .split(/\s*(?:•|â€¢)\s*/)
    .map((spec) => spec.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function getOptionSummary(product) {
  const sizeCount = product.sizeOptions?.length || 0;
  const firmnessCount = product.firmnessOptions?.length || 0;
  return {
    sizes: sizeCount > 1 ? `${sizeCount} sizes` : product.sizeOptions?.[0] || "Standard size",
    firmness: firmnessCount > 1 ? `${firmnessCount} feels` : product.firmnessOptions?.[0] || "Standard feel"
  };
}

/* Default standard card styles (used across catalog, search, etc.) */
const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: 0,
  overflow: "hidden",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  transition: "all 0.25s ease"
};

const imageWrapperStyle = {
  position: "relative",
  width: "100%",
  aspectRatio: "1 / 0.82",
  backgroundColor: "#F3F3F0",
  overflow: "hidden"
};

const badgeStyle = {
  position: "absolute",
  top: "10px",
  left: "10px",
  maxWidth: "calc(100% - 56px)",
  backgroundColor: "rgba(27, 31, 140, 0.9)",
  color: "#FFFFFF",
  borderRadius: "999px",
  padding: "5px 9px",
  fontSize: "10px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block"
};

const wishlistBtnStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  backgroundColor: "#FFFFFF",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 1px 4px rgba(20, 21, 26, 0.15)"
};

const infoWrapperStyle = {
  padding: "12px 13px 13px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  flex: 1
};

const titleBlockStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "6px"
};

const titleStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#1B1F8C",
  lineHeight: "1.3"
};

const taglineStyle = {
  fontSize: "12px",
  color: "#6B6B75",
  lineHeight: "1.45",
  margin: 0,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
};

const categoryStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#6B6B75",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  backgroundColor: "#F3F3F0",
  padding: "2px 7px",
  borderRadius: "999px"
};

const specGridStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px"
};

const specChipStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#1B1F8C",
  backgroundColor: "#F7F7F2",
  border: "1px solid #E7E7E2",
  borderRadius: "999px",
  padding: "5px 8px",
  lineHeight: 1.1
};

const featureStyle = {
  fontSize: "11px",
  color: "#14151A",
  lineHeight: "1.45",
  margin: 0,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
};

const detailsRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px"
};

const detailPillStyle = {
  fontSize: "10px",
  fontWeight: "800",
  color: "#16A34A",
  backgroundColor: "rgba(22, 163, 74, 0.08)",
  borderRadius: "999px",
  padding: "5px 8px",
  lineHeight: 1.1
};

const metaRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  marginTop: "auto"
};

const compactRatingStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  color: "#14151A",
  fontSize: "12px",
  fontWeight: "800",
  flexShrink: 0
};

const priceStyle = {
  fontSize: "15px",
  fontWeight: "800",
  color: "#14151A"
};

/* Best Sellers specific variant styles matching target reference UI */
const bestSellerCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  overflow: "hidden",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
  transition: "transform 0.22s ease, box-shadow 0.22s ease"
};

const bestSellerImageWrapperStyle = {
  position: "relative",
  width: "100%",
  aspectRatio: "1 / 0.74",
  backgroundColor: "#F3F3F0",
  overflow: "hidden"
};

const bestSellerBadgeStyle = {
  position: "absolute",
  top: "12px",
  left: "12px",
  maxWidth: "calc(100% - 60px)",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  borderRadius: "999px",
  padding: "4px 10px",
  fontSize: "10px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)"
};

const bestSellerWishlistBtnStyle = {
  position: "absolute",
  top: "12px",
  right: "12px",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: "#FFFFFF",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.14)",
  zIndex: 2,
  transition: "transform 0.15s ease"
};

const bestSellerInfoWrapperStyle = {
  padding: "14px 16px 15px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  flex: "1 1 auto"
};

const bestSellerTitleBlockStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "4px"
};

const bestSellerCategoryStyle = {
  fontSize: "10px",
  fontWeight: "800",
  color: "#6B6B75",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  backgroundColor: "#F3F3F0",
  padding: "3px 9px",
  borderRadius: "999px",
  display: "inline-block",
  alignSelf: "flex-start"
};

const bestSellerTitleStyle = {
  fontSize: "15px",
  fontWeight: "800",
  color: "#1B1F8C",
  lineHeight: "1.3",
  margin: 0
};

const bestSellerSpecChipStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#1B1F8C",
  backgroundColor: "#F7F7F2",
  border: "1px solid #E7E7E2",
  borderRadius: "999px",
  padding: "4px 8px",
  lineHeight: 1.1
};

const bestSellerDetailPillStyle = {
  fontSize: "10px",
  fontWeight: "800",
  color: "#16A34A",
  backgroundColor: "rgba(22, 163, 74, 0.1)",
  borderRadius: "999px",
  padding: "4px 8px",
  lineHeight: 1.1
};

const bestSellerPriceStyle = {
  fontSize: "16px",
  fontWeight: "800",
  color: "#14151A"
};

const bestSellerMetaRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  marginTop: "2px"
};
