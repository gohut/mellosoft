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
      <div style={containerStyle}>
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
        .promo-banners-static-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (max-width: 767px) {
          .promotional-banner-section {
            padding: 14px 0 !important;
          }
          .promo-banners-static-list {
            gap: 14px !important;
          }
        }
      `}</style>
    </section>
  );
}

const sectionWrapperStyle = {
  padding: "20px 0 16px",
  width: "100%",
  boxSizing: "border-box"
};

const containerStyle = {
  width: "100%",
  padding: "0 48px",
  boxSizing: "border-box"
};

const bannersColumnStyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};
