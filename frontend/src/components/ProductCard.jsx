"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "../context/StoreContext";
import { formatPrice, getMinimumProductPrice } from "../utils/currency";
import { getProductUrl } from "../utils/productHelpers";
import { ensureProductPricing } from "../utils/pricingEngine";
import { CATEGORY_FALLBACK_IMAGES, ACCESSORY_FALLBACK_IMAGES } from "../data/mattressData";
import { useRouter } from "next/navigation";

export default function ProductCard({
  product: rawProduct,
  showContactForPrice = true,
  hideUnpricedLabel = false
}) {
  const router = useRouter();
  const { wishlist, toggleWishlist, navigateTo } = useStore();

  const product = useMemo(() => {
    return ensureProductPricing(rawProduct);
  }, [rawProduct]);

  const isWishlisted = wishlist ? wishlist.includes(product.id) : false;

  const fallbackImg =
    CATEGORY_FALLBACK_IMAGES[product.category] ||
    ACCESSORY_FALLBACK_IMAGES[product.category] ||
    "/images/mattresses/fallback/foam.svg";

  const [imgSrc, setImgSrc] = useState(
    product.images?.[0] || product.image || fallbackImg
  );
  const [isHovered, setIsHovered] = useState(false);

  let minPrice = getMinimumProductPrice(product);
  if (minPrice === null || minPrice === undefined || isNaN(minPrice) || minPrice <= 0) {
    minPrice = product.startingPrice || product.price || 499;
  }

  const handleWishlistClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    toggleWishlist(product.id);
  };

  const handleImageError = () => {
    if (imgSrc !== fallbackImg) {
      setImgSrc(fallbackImg);
    }
  };

  const specLabel = product.construction || product.type || product.material || null;

  const isSvg = typeof imgSrc === "string" && (
    imgSrc.toLowerCase().endsWith(".svg") ||
    imgSrc.includes("/fallback/") ||
    imgSrc.includes("/mattresses/fallback/") ||
    imgSrc.includes(".svg")
  );

  const handleCardClick = () => {
    const targetId = product.slug || product.id || product.Product_Id;
    navigateTo("detail", targetId);
    const targetUrl = getProductUrl(product);
    if (router && typeof router.push === "function") {
      router.push(targetUrl);
    } else if (typeof window !== "undefined") {
      window.location.href = targetUrl;
    }
  };

  return (
    <article
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${product.name}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...cardStyle,
        transform: isHovered ? "translateY(-4px) scale(1.01)" : "none",
        boxShadow: isHovered ? "0 12px 28px rgba(0, 0, 0, 0.12)" : "0 2px 10px rgba(0,0,0,0.04)"
      }}
      className="product-card"
    >
      {/* IMAGE WRAPPER */}
      <div style={imageWrapperStyle}>
        <img
          src={imgSrc}
          alt={`Mellosoft ${product.name} ${product.categoryName || product.category || "Product"}`}
          onError={handleImageError}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: isSvg ? "contain" : "cover",
            padding: isSvg ? "12px" : "0",
            display: "block",
            transition: "transform 0.35s ease",
            transform: isHovered ? "scale(1.05)" : "scale(1)"
          }}
        />

        {/* CATEGORY / NEW ARRIVAL BADGE */}
        {product.isNewArrival ? (
          <span style={{ ...badgeStyle, backgroundColor: "#16A34A" }}>
            NEW
          </span>
        ) : (
          <span style={badgeStyle}>
            {product.categoryName || (product.category ? product.category.toUpperCase() : "SLEEP")}
          </span>
        )}

        {/* WISHLIST BUTTON */}
        <button
          type="button"
          onClick={handleWishlistClick}
          style={wishlistBtnStyle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "#16A34A" : "none"}
            stroke={isWishlisted ? "#16A34A" : "#1B1F8C"}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* CONTENT INFO */}
      <div style={infoWrapperStyle}>
        <div style={titleBlockStyle}>
          <span style={categoryTagStyle}>{product.categoryName || product.category}</span>
          <h4 style={titleStyle}>{product.name}</h4>
          <p style={taglineStyle}>{product.tagline ? `"${product.tagline}"` : "\u00A0"}</p>
        </div>

        {/* CONSTRUCTION / SPEC */}
        <div style={specWrapperStyle}>
          {specLabel ? (
            <div style={constructionBadgeStyle}>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#1B1F8C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {specLabel}
              </span>
            </div>
          ) : (
            <span style={{ height: "24px" }} />
          )}
        </div>

        {/* PRICE ROW */}
        <div style={metaRowStyle}>
          <div>
            <span style={priceLabelStyle}>STARTING FROM</span>
            <div style={priceValueStyle}>
              {formatPrice(minPrice)}
            </div>
          </div>

          <span style={viewDetailsIndicatorStyle}>
            View Details &rarr;
          </span>
        </div>
      </div>
    </article>
  );
}

// ─── CARD STYLES ─────────────────────────────────────────────────────────────
const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  border: "1px solid #E7E7E2",
  overflow: "hidden",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: "450px",
  boxSizing: "border-box",
  transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
};

const imageWrapperStyle = {
  position: "relative",
  width: "100%",
  aspectRatio: "1 / 0.82",
  minHeight: "210px",
  backgroundColor: "#FAFAFA",
  overflow: "hidden",
  flexShrink: 0
};

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  transition: "transform 0.35s ease"
};

const badgeStyle = {
  position: "absolute",
  top: "12px",
  left: "12px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  borderRadius: "999px",
  padding: "4px 10px",
  fontSize: "10px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  maxWidth: "calc(100% - 60px)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const wishlistBtnStyle = {
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
  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  zIndex: 2
};

const infoWrapperStyle = {
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  flex: 1
};

const titleBlockStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const categoryTagStyle = {
  fontSize: "10px",
  fontWeight: "800",
  color: "#16A34A",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const titleStyle = {
  fontSize: "17px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0,
  lineHeight: "1.25",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  minHeight: "42px"
};

const taglineStyle = {
  fontSize: "12px",
  color: "#6B6B75",
  margin: 0,
  fontStyle: "italic",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  minHeight: "36px"
};

const specWrapperStyle = {
  minHeight: "26px",
  display: "flex",
  alignItems: "center"
};

const constructionBadgeStyle = {
  backgroundColor: "#F0F4FF",
  border: "1px solid #DBE5FF",
  borderRadius: "6px",
  padding: "4px 8px",
  maxWidth: "100%",
  display: "inline-flex",
  alignItems: "center"
};

const metaRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: "auto",
  paddingTop: "12px",
  borderTop: "1px solid #F1F5F9"
};

const priceLabelStyle = {
  display: "block",
  fontSize: "10px",
  fontWeight: "600",
  color: "#6B6B75",
  textTransform: "uppercase"
};

const priceValueStyle = {
  fontSize: "16px",
  fontWeight: "800",
  color: "#14151A"
};

const viewDetailsIndicatorStyle = {
  fontSize: "11px",
  fontWeight: "800",
  color: "#1B1F8C",
  letterSpacing: "0.02em"
};

