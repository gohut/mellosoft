"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../context/StoreContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PromotionalBannerSlider() {
  const { activeBanners, navigateTo, setActiveFilters, setSearchQuery } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const touchStartXRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bannersCount = activeBanners?.length || 0;

  // Auto-slide every 5 seconds unless hovered
  useEffect(() => {
    if (bannersCount <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannersCount);
    }, 5000);

    return () => clearInterval(timer);
  }, [bannersCount, isHovered]);

  // Keep index valid if activeBanners change dynamically
  useEffect(() => {
    if (currentIndex >= bannersCount && bannersCount > 0) {
      setCurrentIndex(0);
    }
  }, [bannersCount, currentIndex]);

  if (!activeBanners || bannersCount === 0) {
    return null;
  }

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + bannersCount) % bannersCount);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % bannersCount);
  };

  const handleCtaClick = (e) => {
    e?.stopPropagation();
    const destination = currentBanner.ctaLink || "All";
    setSearchQuery("");
    setActiveFilters({
      category: destination,
      firmness: "All",
      size: "All",
      sort: "Recommended"
    });
    navigateTo("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartXRef.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  // Determine display label from banner data (subtitle or type)
  const displayLabel = (
    currentBanner.subtitle ||
    currentBanner.type ||
    "PROMOTION"
  ).toUpperCase();

  return (
    <section style={sectionWrapperStyle} className="promotional-banner-section">
      <div style={containerStyle}>
        <div
          style={bannerCardStyle}
          className="promo-banner-card"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleCtaClick}
          role="region"
          aria-label="Promotional banner slider"
        >
          {/* Admin Uploaded Banner Image */}
          <img
            src={currentBanner.image || "/asset/img2.jpg"}
            alt={currentBanner.title || "Promotional Banner"}
            style={bannerImgStyle}
          />

          {/* Dark Gradient Overlay for Text Legibility */}
          <div style={overlayStyle} />

          {/* Banner Content Overlay - Vertically Centered Left Aligned */}
          <div style={contentOverlayStyle} className="banner-content-overlay">
            {/* Category / Subtitle Label */}
            <span style={categoryLabelStyle} className="banner-category-label">
              {displayLabel}
            </span>

            {/* Main Heading */}
            <h2 style={titleHeadingStyle} className="banner-title-heading">
              {currentBanner.title}
            </h2>

            {/* CTA Button */}
            {currentBanner.ctaText && (
              <button
                type="button"
                onClick={handleCtaClick}
                style={ctaBtnStyle}
                className="banner-cta-btn"
              >
                {currentBanner.ctaText}
              </button>
            )}
          </div>

          {/* Previous / Next Arrow Buttons */}
          {bannersCount > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                style={leftArrowBtnStyle}
                className="banner-arrow-btn"
                aria-label="Previous banner"
              >
                <ChevronLeft size={18} color="#14151A" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                style={rightArrowBtnStyle}
                className="banner-arrow-btn"
                aria-label="Next banner"
              >
                <ChevronRight size={18} color="#14151A" />
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {mounted && bannersCount > 1 && (
          <div style={dotsRowStyle} className="banner-dots-row" suppressHydrationWarning>
            {activeBanners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                style={index === currentIndex ? { ...dotStyle, ...activeDotStyle } : dotStyle}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .banner-cta-btn {
          transition: transform 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
        }
        .banner-cta-btn:hover {
          background-color: #121560 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(27, 31, 140, 0.35) !important;
        }
        .banner-arrow-btn {
          opacity: 0.85;
          transition: opacity 0.18s ease, transform 0.18s ease, background-color 0.18s ease;
        }
        .promo-banner-card:hover .banner-arrow-btn {
          opacity: 1;
        }
        .banner-arrow-btn:hover {
          background-color: #FFFFFF !important;
          transform: translateY(-50%) scale(1.08) !important;
        }
        @media (max-width: 1024px) {
          .promo-banner-card {
            height: 210px !important;
          }
          .banner-content-overlay {
            padding-left: 46px !important;
          }
          .banner-category-label {
            font-size: 14px !important;
          }
          .banner-title-heading {
            font-size: 28px !important;
          }
        }
        @media (max-width: 767px) {
          .promo-banner-card {
            height: 180px !important;
            border-radius: 10px !important;
          }
          .promotional-banner-section {
            padding: 12px 0 !important;
          }
          .banner-content-overlay {
            padding-left: 36px !important;
            padding-right: 18px !important;
            gap: 6px !important;
          }
          .banner-category-label {
            font-size: 12px !important;
          }
          .banner-title-heading {
            font-size: 22px !important;
          }
          .banner-cta-btn {
            padding: 6px 16px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </section>
  );
}

const sectionWrapperStyle = {
  padding: "16px 0 10px",
  width: "100%",
  boxSizing: "border-box"
};

const containerStyle = {
  width: "100%",
  padding: "0 12px",
  boxSizing: "border-box"
};

const bannerCardStyle = {
  position: "relative",
  width: "100%",
  height: "240px",
  minHeight: "0px",
  borderRadius: "12px",
  overflow: "hidden",
  cursor: "pointer",
  backgroundColor: "#1B1F8C",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
};

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
  background: "linear-gradient(90deg, rgba(20, 21, 26, 0.72) 0%, rgba(20, 21, 26, 0.45) 50%, rgba(20, 21, 26, 0.05) 100%)"
};

const contentOverlayStyle = {
  position: "relative",
  zIndex: 2,
  height: "100%",
  paddingLeft: "55px",
  paddingRight: "34px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: "8px",
  maxWidth: "520px",
  boxSizing: "border-box"
};

const categoryLabelStyle = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#FFFFFF",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const titleHeadingStyle = {
  fontSize: "34px",
  fontWeight: "700",
  color: "#FFFFFF",
  lineHeight: "1.1",
  margin: 0,
  letterSpacing: "-0.01em"
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
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  marginTop: "2px",
  boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)"
};

const leftArrowBtnStyle = {
  position: "absolute",
  top: "50%",
  left: "14px",
  transform: "translateY(-50%)",
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: 3,
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
};

const rightArrowBtnStyle = {
  position: "absolute",
  top: "50%",
  right: "14px",
  transform: "translateY(-50%)",
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: 3,
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
};

const dotsRowStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  marginTop: "8px"
};

const dotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "999px",
  border: "none",
  backgroundColor: "#D1D5DB",
  cursor: "pointer",
  padding: 0,
  transition: "all 0.2s ease"
};

const activeDotStyle = {
  width: "22px",
  backgroundColor: "#16A34A"
};
