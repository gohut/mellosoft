"use client";

import React from "react";
import { useStore } from "../context/StoreContext";
import PromoBannerCard from "./PromoBannerCard";

/**
 * PromotionalBannerSlider component — transformed to render static independent banners.
 * Renders each active Promo Banner vertically with zero slider/carousel behavior.
 */
export default function PromotionalBannerSlider({ banners: bannersProp }) {
  const { activePromoBanners, activeBanners, navigateTo, setActiveFilters, setSearchQuery } = useStore();

  // Use explicitly passed banners prop, or fall back to activePromoBanners or activeBanners
  const bannersSource = bannersProp !== undefined ? bannersProp : (activePromoBanners || activeBanners);

  // Filter active banners only and sort by displayOrder
  const promoBannersList = (bannersSource || [])
    .filter((b) => b && (b.type === "Promotion" || bannersProp !== undefined) && b.isActive !== false && b.status !== "Inactive")
    .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

  if (!promoBannersList || promoBannersList.length === 0) {
    return null;
  }

  const handleCtaClick = (banner, e) => {
    e?.stopPropagation();
    const destination = banner.ctaLink || "All";
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

  return (
    <section style={sectionWrapperStyle} className="promotional-banner-section">
      <div style={containerStyle} className="promo-banner-container">
        <div style={bannersColumnStyle} className="promo-banners-static-list">
          {promoBannersList.map((banner) => (
            <PromoBannerCard
              key={banner.id}
              banner={banner}
              onClick={(e) => handleCtaClick(banner, e)}
            />
          ))}
        </div>
      </div>
      <style>{`
        .promotional-banner-section {
          width: 100%;
          display: flex;
          justify-content: center;
          box-sizing: border-box;
        }
        .promo-banner-container {
          width: calc(100% - 32px) !important;
          max-width: none !important;
          margin: 0 auto !important;
          box-sizing: border-box !important;
        }
        .promo-banners-static-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }
        @media (max-width: 1024px) {
          .promo-banner-container {
            width: calc(100% - 24px) !important;
          }
        }
        @media (max-width: 767px) {
          .promotional-banner-section {
            padding: 10px 0 !important;
          }
          .promo-banner-container {
            width: calc(100% - 20px) !important;
          }
          .promo-banners-static-list {
            gap: 12px !important;
          }
        }
      `}</style>
    </section>
  );
}

const sectionWrapperStyle = {
  padding: "16px 0 14px",
  width: "100%",
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "center"
};

const containerStyle = {
  width: "calc(100% - 32px)",
  maxWidth: "none",
  margin: "0 auto",
  padding: "0",
  boxSizing: "border-box"
};

const bannersColumnStyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};
