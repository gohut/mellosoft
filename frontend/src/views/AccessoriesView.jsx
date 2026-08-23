"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ACCESSORY_PRODUCTS, ACCESSORY_FALLBACK_IMAGES } from "../data/mattressData";
import { ACCESSORY_CATEGORY_LIST, getAccessoryCategoryMeta } from "../utils/productHelpers";
import { useStore } from "../context/StoreContext";
import { Search, RefreshCw } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function AccessoriesView({ categoryParam = "all" }) {
  const { navigateTo } = useStore();
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync state if categoryParam changes via router
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam.toLowerCase().trim());
    }
  }, [categoryParam]);

  const isValidCategoryParam = useMemo(() => {
    if (!categoryParam || categoryParam.toLowerCase() === "all") return true;
    return !!getAccessoryCategoryMeta(categoryParam);
  }, [categoryParam]);

  const currentCategoryMeta = useMemo(() => {
    return getAccessoryCategoryMeta(selectedCategory);
  }, [selectedCategory]);

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    const targetUrl = slug === "all" ? "/accessories" : `/accessories/${slug}`;
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", targetUrl);
    }
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/accessories");
    }
  };

  const filteredAccessories = useMemo(() => {
    return (ACCESSORY_PRODUCTS || []).filter((item) => {
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesTagline = (item.tagline || "").toLowerCase().includes(q);
        const matchesCategory = (item.categoryName || item.category || "").toLowerCase().includes(q);
        const matchesType = (item.type || "").toLowerCase().includes(q);
        if (!matchesName && !matchesTagline && !matchesCategory && !matchesType) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== "all" && selectedCategory !== "All") {
        if (item.category !== selectedCategory) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts = { all: ACCESSORY_PRODUCTS.length };
    ACCESSORY_CATEGORY_LIST.forEach((c) => {
      counts[c.slug] = ACCESSORY_PRODUCTS.filter((p) => p.category === c.slug).length;
    });
    return counts;
  }, []);

  if (!isValidCategoryParam) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <EmptyState
          iconType="search"
          title="Category Not Found"
          message="The accessory category you are looking for does not exist or has been moved."
          actionLabel="View All Accessories"
          onAction={resetFilters}
        />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      
      {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
      <div style={heroBannerStyle}>
        <span style={heroEyebrowStyle}>
          {currentCategoryMeta ? currentCategoryMeta.name.toUpperCase() : "MELLOSOFT SLEEP ACCESSORIES"}
        </span>
        <h1 style={heroTitleStyle}>
          {currentCategoryMeta ? currentCategoryMeta.title : "Sleep Better Beyond the Mattress"}
        </h1>
        <p style={heroSubtextStyle}>
          {currentCategoryMeta
            ? currentCategoryMeta.description
            : "Complete your sleep experience with thoughtfully selected pillows, protectors, bedding and travel essentials."}
        </p>
      </div>

      {/* ── FILTER & SEARCH BAR ──────────────────────────────────────────────── */}
      <div style={filterBarContainerStyle}>
        
        {/* Category Pills */}
        <div style={categoryPillsWrapStyle}>
          <button
            type="button"
            onClick={() => handleCategorySelect("all")}
            style={{
              ...categoryPillBtnStyle,
              backgroundColor: (selectedCategory === "all" || selectedCategory === "All") ? "#1B1F8C" : "#FFFFFF",
              color: (selectedCategory === "all" || selectedCategory === "All") ? "#FFFFFF" : "#14151A",
              borderColor: (selectedCategory === "all" || selectedCategory === "All") ? "#1B1F8C" : "#E7E7E2"
            }}
          >
            All Accessories ({categoryCounts.all})
          </button>

          {ACCESSORY_CATEGORY_LIST.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const count = categoryCounts[cat.slug] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                style={{
                  ...categoryPillBtnStyle,
                  backgroundColor: isSelected ? "#1B1F8C" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "#14151A",
                  borderColor: isSelected ? "#1B1F8C" : "#E7E7E2"
                }}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Reset */}
        <div style={searchRowStyle}>
          <div style={searchWrapStyle}>
            <Search size={16} color="#6B6B75" />
            <input
              type="text"
              placeholder={currentCategoryMeta ? `Search in ${currentCategoryMeta.name}...` : "Search accessories (e.g. CloudContour, AquaGuard, Duvet)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchInputStyle}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} style={clearSearchBtnStyle}>
                ×
              </button>
            )}
          </div>

          <button type="button" onClick={resetFilters} style={resetBtnStyle}>
            <RefreshCw size={14} /> Reset
          </button>
        </div>

        <div style={resultsCountStyle}>
          Showing <strong>{filteredAccessories.length}</strong> of <strong>{selectedCategory === "all" ? ACCESSORY_PRODUCTS.length : (categoryCounts[selectedCategory] || filteredAccessories.length)}</strong> accessory products
        </div>

      </div>

      {/* ── ACCESSORIES GRID ─────────────────────────────────────────────────── */}
      {filteredAccessories.length > 0 ? (
        <div style={gridStyle}>
          {filteredAccessories.map((item) => (
            <AccessoryProductCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div style={emptyWrapperStyle}>
          <EmptyState
            iconType="search"
            title="No matching accessories found"
            message="No accessory products match your search or category filter. Try clearing your filters."
            actionLabel="Reset Filters"
            onAction={resetFilters}
          />
        </div>
      )}
    </div>
  );
}

function AccessoryProductCard({ item }) {
  const { navigateTo } = useStore();
  const [imgSrc, setImgSrc] = useState(
    item.images?.[0] || ACCESSORY_FALLBACK_IMAGES[item.category] || "/images/accessories/fallback/memory-foam-pillow.svg"
  );
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    const targetId = item.slug || item.id;
    navigateTo("detail", targetId);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/product/${targetId}`);
    }
  };

  const handleImageError = () => {
    const fallback = ACCESSORY_FALLBACK_IMAGES[item.category] || "/images/accessories/fallback/memory-foam-pillow.svg";
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  const handleEnquireClick = (e) => {
    e.stopPropagation();
    const params = new URLSearchParams({
      product: item.name,
      category: item.categoryName || item.category,
      type: item.type || ""
    });
    window.location.href = `/contact?${params.toString()}`;
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...cardStyle,
        cursor: "pointer",
        transform: isHovered ? "translateY(-4px) scale(1.015)" : "none",
        boxShadow: isHovered ? "0 12px 28px rgba(0, 0, 0, 0.12)" : "0 2px 10px rgba(0,0,0,0.04)"
      }}
    >
      <div style={imageWrapStyle}>
        <img
          src={imgSrc}
          alt={`Mellosoft ${item.name} ${item.categoryName || item.category}`}
          onError={handleImageError}
          loading="lazy"
          style={{
            ...imageStyle,
            transform: isHovered ? "scale(1.05)" : "scale(1)"
          }}
        />
        <span style={badgeStyle}>
          {item.categoryName || "ACCESSORY"}
        </span>
      </div>

      <div style={cardBodyStyle}>
        <div>
          <span style={categoryTagStyle}>{item.categoryName || item.category}</span>
          <h3 style={itemTitleStyle}>{item.name}</h3>
          {item.tagline && <p style={taglineStyle}>"{item.tagline}"</p>}
        </div>

        {/* TYPE / SPEC BADGE */}
        {item.type && (
          <div style={typeBadgeStyle}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#1B1F8C" }}>
              {item.type}
            </span>
          </div>
        )}

        {/* FIRMNESS OR MATERIAL */}
        {(item.firmness || item.material) && (
          <div style={specRowStyle}>
            {item.firmness && <span style={specPillStyle}>Feel: {item.firmness}</span>}
            {item.material && <span style={specPillStyle}>Material: {item.material}</span>}
          </div>
        )}

        <div style={cardFooterStyle}>
          <div>
            <span style={priceLabelStyle}>Pricing</span>
            <div style={contactPriceStyle}>Contact for Price</div>
          </div>

          <button
            type="button"
            onClick={handleEnquireClick}
            style={enquireBtnStyle}
          >
            ENQUIRE NOW
          </button>
        </div>
      </div>
    </div>
  );
}

// ── STYLING OBJECTS ──────────────────────────────────────────────────────────
const containerStyle = {
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "32px 24px 80px 24px",
  width: "100%"
};

const heroBannerStyle = {
  textAlign: "center",
  marginBottom: "32px",
  padding: "36px 24px",
  backgroundColor: "#FAFAFA",
  borderRadius: "20px",
  border: "1px solid #E7E7E2"
};

const heroEyebrowStyle = {
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "1px",
  color: "#16A34A",
  display: "block",
  marginBottom: "8px"
};

const heroTitleStyle = {
  fontSize: "34px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: "0 0 10px 0"
};

const heroSubtextStyle = {
  fontSize: "15px",
  color: "#6B6B75",
  maxWidth: "680px",
  margin: "0 auto"
};

const filterBarContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  marginBottom: "32px",
  backgroundColor: "#FFFFFF",
  padding: "20px",
  borderRadius: "16px",
  border: "1px solid #E7E7E2"
};

const categoryPillsWrapStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px"
};

const categoryPillBtnStyle = {
  padding: "8px 16px",
  borderRadius: "999px",
  border: "1.5px solid #E7E7E2",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const searchRowStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  flexWrap: "wrap"
};

const searchWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  backgroundColor: "#F8F9FA",
  border: "1px solid #E2E8F0",
  borderRadius: "10px",
  padding: "0 12px",
  flex: "1 1 300px",
  height: "42px"
};

const searchInputStyle = {
  border: "none",
  background: "none",
  outline: "none",
  fontSize: "13px",
  width: "100%",
  color: "#14151A"
};

const clearSearchBtnStyle = {
  border: "none",
  background: "none",
  fontSize: "16px",
  cursor: "pointer",
  color: "#94A3B8"
};

const resetBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  height: "42px",
  padding: "0 14px",
  borderRadius: "10px",
  border: "1px solid #E2E8F0",
  backgroundColor: "#F1F5F9",
  color: "#475569",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer"
};

const resultsCountStyle = {
  fontSize: "13px",
  color: "#6B6B75"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "24px"
};

const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  border: "1px solid #E7E7E2",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
};

const imageWrapStyle = {
  position: "relative",
  width: "100%",
  aspectRatio: "1 / 0.75",
  backgroundColor: "#FAFAFA",
  overflow: "hidden"
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
  fontSize: "10px",
  fontWeight: "800",
  padding: "4px 10px",
  borderRadius: "999px",
  textTransform: "uppercase"
};

const cardBodyStyle = {
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  flex: 1
};

const categoryTagStyle = {
  fontSize: "10px",
  fontWeight: "800",
  color: "#16A34A",
  textTransform: "uppercase",
  letterSpacing: "0.04em"
};

const itemTitleStyle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: "2px 0 0 0",
  lineHeight: "1.25"
};

const taglineStyle = {
  fontSize: "12px",
  color: "#6B6B75",
  margin: "2px 0 0 0",
  fontStyle: "italic"
};

const typeBadgeStyle = {
  backgroundColor: "#F0F4FF",
  border: "1px solid #DBE5FF",
  borderRadius: "6px",
  padding: "4px 8px",
  alignSelf: "flex-start"
};

const specRowStyle = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap"
};

const specPillStyle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#334155",
  backgroundColor: "#F1F5F9",
  borderRadius: "6px",
  padding: "4px 8px"
};

const cardFooterStyle = {
  marginTop: "auto",
  paddingTop: "10px",
  borderTop: "1px solid #F1F5F9",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
};

const priceLabelStyle = {
  display: "block",
  fontSize: "10px",
  fontWeight: "600",
  color: "#6B6B75",
  textTransform: "uppercase"
};

const contactPriceStyle = {
  fontSize: "14px",
  fontWeight: "800",
  color: "#D97706"
};

const enquireBtnStyle = {
  padding: "8px 14px",
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "8px",
  fontSize: "11px",
  fontWeight: "800",
  cursor: "pointer",
  letterSpacing: "0.04em"
};

const emptyWrapperStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  padding: "60px 0"
};
