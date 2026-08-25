"use client";

import React from "react";

/**
 * Reusable HeroSlideCard component for both User Homepage Hero Slider and Admin Live Preview.
 * Follows the Mellosoft Hero Slider specification:
 * - Top-Left Badge (pill shape, dark translucent background)
 * - Bottom-Left Subtitle & Large Bold Title & Description
 * - Bottom-Right CTA Button (green pill button, conditionally rendered)
 * - Full cover background image with bottom gradient overlay
 */
export default function HeroSlideCard({
  slide,
  preview = false,
  onClick,
  style = {},
  className = ""
}) {
  if (!slide) return null;

  // Extract properties without forcing hardcoded fallbacks when explicitly empty
  const badge = slide.type ?? slide.badge ?? slide.tag ?? "";
  const subtitle = slide.subtitle ?? slide.deal ?? "";
  const title = slide.title ?? slide.headline ?? slide.name ?? "";
  const description = slide.description ?? "";
  const ctaRaw = slide.ctaText !== undefined ? slide.ctaText : (slide.ctaButtonText !== undefined ? slide.ctaButtonText : "Shop Now");
  const ctaText = typeof ctaRaw === "string" ? ctaRaw : String(ctaRaw);
  const hasCta = ctaText.trim().length > 0;
  
  // Image handling
  const image =
    slide.image ||
    (slide.product?.images && slide.product.images[0]) ||
    "/asset/img2.jpg";

  // Card container styles
  const cardStyle = {
    position: "relative",
    width: preview ? "100%" : style.width || "560px",
    height: preview ? "230px" : style.height || "260px",
    borderRadius: preview ? "16px" : "22px",
    overflow: "hidden",
    backgroundColor: "#14151A",
    border: "none",
    textAlign: "left",
    boxSizing: "border-box",
    cursor: preview ? "default" : "pointer",
    flex: preview ? "none" : style.flex || "0 0 auto",
    scrollSnapAlign: style.scrollSnapAlign || "start",
    ...style
  };

  const handleCardClick = (e) => {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={`hero-slide-card ${preview ? "admin-hero-preview" : "peek-slide"} ${className}`}
      style={cardStyle}
      onClick={handleCardClick}
      role={preview ? "img" : "button"}
      tabIndex={preview ? -1 : 0}
      aria-label={title || "Hero slide"}
    >
      {/* Cover Image */}
      <img
        src={image}
        alt={title || "Hero slide"}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block"
        }}
      />

      {/* Dark Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(20,21,26,0.08) 30%, rgba(20,21,26,0.78) 100%)",
          pointerEvents: "none"
        }}
      />

      {/* Top-Left Badge */}
      {badge && badge.trim() !== "" && (
        <span
          className="peek-badge"
          style={{
            position: "absolute",
            top: preview ? "12px" : "16px",
            left: preview ? "12px" : "16px",
            backgroundColor: "rgba(20, 21, 26, 0.65)",
            color: "#FFFFFF",
            borderRadius: "999px",
            padding: preview ? "4px 10px" : "6px 12px",
            fontSize: preview ? "11px" : "12px",
            fontWeight: "700",
            backdropFilter: "blur(4px)",
            zIndex: 2,
            letterSpacing: "0.02em"
          }}
        >
          {badge}
        </span>
      )}

      {/* Bottom-Left Subtitle, Title & Description */}
      <div
        className="peek-slide-content"
        style={{
          position: "absolute",
          left: preview ? "14px" : "18px",
          right: hasCta ? (preview ? "100px" : "110px") : (preview ? "14px" : "18px"),
          bottom: preview ? "14px" : "18px",
          display: "flex",
          flexDirection: "column",
          gap: "3px",
          zIndex: 2
        }}
      >
        {subtitle && subtitle.trim() !== "" && (
          <span
            className="peek-deal-text"
            style={{
              color: "#FFFFFF",
              fontSize: preview ? "12px" : "13px",
              fontWeight: "600",
              opacity: 0.9,
              lineHeight: 1.2
            }}
          >
            {subtitle}
          </span>
        )}
        {title && title.trim() !== "" && (
          <h3
            className="peek-headline"
            style={{
              color: "#FFFFFF",
              fontSize: preview ? "18px" : "22px",
              fontWeight: "800",
              lineHeight: "1.15",
              margin: 0,
              letterSpacing: "-0.01em"
            }}
          >
            {title}
          </h3>
        )}
        {description && description.trim() !== "" && (
          <p
            className="peek-description-text"
            style={{
              color: "rgba(255, 255, 255, 0.88)",
              fontSize: preview ? "11px" : "12px",
              fontWeight: "400",
              lineHeight: "1.3",
              margin: "2px 0 0 0",
              maxWidth: "100%",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Bottom-Right CTA Button (Rendered ONLY if ctaText is non-empty) */}
      {hasCta && (
        <span
          className="peek-shop-btn"
          style={{
            position: "absolute",
            right: preview ? "12px" : "16px",
            bottom: preview ? "12px" : "16px",
            backgroundColor: "#16A34A",
            color: "#FFFFFF",
            borderRadius: "999px",
            padding: preview ? "7px 14px" : "9px 16px",
            fontSize: preview ? "11px" : "12px",
            fontWeight: "800",
            zIndex: 2,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)"
          }}
        >
          {ctaText}
        </span>
      )}
    </div>
  );
}
