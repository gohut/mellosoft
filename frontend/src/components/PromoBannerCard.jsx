"use client";

import React from "react";

/**
 * Reusable PromoBannerCard component for both User Homepage Promotional Banner Slider and Admin Live Preview.
 * Follows the Mellosoft Promo Banner design system:
 * - Cover banner image with dark horizontal gradient overlay
 * - Vertically centered, left-aligned content
 * - Uppercase Subtitle / Category badge pill
 * - Large bold Title heading
 * - Optional subtitle / description
 * - Green CTA button with subtle pill shadow
 * - Full responsive adaptations for Desktop, Tablet, and Mobile
 */
export default function PromoBannerCard({
  banner,
  preview = false,
  onClick,
  style = {},
  className = ""
}) {
  if (!banner) return null;

  const title = banner.title ?? "";
  const subtitle = banner.subtitle ?? "";
  const type = banner.type ?? "Promotion";
  const description = banner.description ?? "";
  const ctaRaw = banner.ctaText !== undefined ? banner.ctaText : "Shop Now";
  const ctaText = typeof ctaRaw === "string" ? ctaRaw : String(ctaRaw || "");
  const hasCta = ctaText.trim().length > 0;

  const image = banner.image || "/asset/img2.jpg";

  // Label to show on top: subtitle or type
  const displayLabel = (subtitle || type || "PROMOTION").toUpperCase();

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

  const cardStyle = {
    position: "relative",
    width: "100%",
    height: preview ? "220px" : style.height || "240px",
    minHeight: "0px",
    borderRadius: preview ? "14px" : "12px",
    overflow: "hidden",
    cursor: preview ? "default" : "pointer",
    backgroundColor: "#1B1F8C",
    boxShadow: preview ? "none" : "0 4px 20px rgba(0, 0, 0, 0.08)",
    boxSizing: "border-box",
    ...style
  };

  return (
    <div
      className={`promo-banner-card ${preview ? "admin-promo-preview" : ""} ${className}`}
      style={cardStyle}
      onClick={handleCardClick}
      role={preview ? "img" : "region"}
      aria-label={title || "Promotional banner"}
      tabIndex={preview ? -1 : 0}
    >
      {/* Background Banner Image */}
      <img
        src={image}
        alt={title || "Promotional Banner"}
        style={bannerImgStyle}
      />

      {/* Dark Horizontal Gradient Overlay for Text Legibility */}
      <div style={overlayStyle} />

      {/* Banner Content Overlay */}
      <div style={contentOverlayStyle} className="banner-content-overlay">
        {/* Category / Subtitle Badge */}
        {displayLabel && (
          <span style={categoryLabelStyle} className="banner-category-label">
            {displayLabel}
          </span>
        )}

        {/* Main Heading */}
        <h2 style={titleHeadingStyle} className="banner-title-heading">
          {title || "Promotional Banner"}
        </h2>

        {/* Optional Description */}
        {description && description.trim() !== "" && (
          <p style={descriptionTextStyle} className="banner-desc-text">
            {description}
          </p>
        )}

        {/* CTA Button */}
        {hasCta && (
          <button
            type="button"
            onClick={(e) => {
              if (!preview && onClick) {
                onClick(e);
              }
            }}
            style={ctaBtnStyle}
            className="banner-cta-btn"
            tabIndex={preview ? -1 : 0}
          >
            {ctaText}
          </button>
        )}
      </div>

      <style>{`
        .banner-cta-btn {
          transition: transform 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
        }
        .banner-cta-btn:hover {
          background-color: #15803D !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(22, 163, 74, 0.4) !important;
        }
        @media (max-width: 1024px) {
          .promo-banner-card {
            height: 210px !important;
          }
          .banner-content-overlay {
            padding-left: 36px !important;
            padding-bottom: 20px !important;
            justify-content: flex-end !important;
          }
          .banner-category-label {
            font-size: 12.5px !important;
          }
          .banner-title-heading {
            font-size: 24px !important;
          }
        }
        @media (max-width: 767px) {
          .promo-banner-card {
            height: 180px !important;
            border-radius: 10px !important;
          }
          .banner-content-overlay {
            padding-left: 20px !important;
            padding-right: 18px !important;
            padding-bottom: 14px !important;
            justify-content: flex-end !important;
            gap: 4px !important;
          }
          .banner-category-label {
            font-size: 11px !important;
          }
          .banner-title-heading {
            font-size: 18px !important;
          }
          .banner-desc-text {
            font-size: 11px !important;
            line-height: 1.25 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .banner-cta-btn {
            padding: 6px 16px !important;
            font-size: 12px !important;
            margin-top: 2px !important;
          }
        }
      `}</style>
    </div>
  );
}

const bannerImgStyle = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
  display: "block",
  transition: "transform 0.4s ease"
};

const overlayStyle = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(20, 21, 26, 0.02) 15%, rgba(20, 21, 26, 0.55) 60%, rgba(20, 21, 26, 0.90) 100%), linear-gradient(90deg, rgba(20, 21, 26, 0.75) 0%, rgba(20, 21, 26, 0.45) 50%, rgba(20, 21, 26, 0.06) 100%)"
};

const contentOverlayStyle = {
  position: "relative",
  zIndex: 2,
  height: "100%",
  paddingLeft: "50px",
  paddingRight: "32px",
  paddingBottom: "24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-end",
  gap: "6px",
  maxWidth: "1000px",
  boxSizing: "border-box"
};

const categoryLabelStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#E0E7FF",
  textTransform: "uppercase",
  letterSpacing: "0.06em"
};

const titleHeadingStyle = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#FFFFFF",
  lineHeight: "1.15",
  margin: 0,
  letterSpacing: "-0.01em"
};

const descriptionTextStyle = {
  fontSize: "13px",
  color: "#D1D5DB",
  margin: 0,
  lineHeight: "1.35",
  maxWidth: "460px"
};

const ctaBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "999px",
  padding: "8px 22px",
  fontSize: "13.5px",
  fontWeight: "700",
  cursor: "pointer",
  marginTop: "4px",
  boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)"
};
