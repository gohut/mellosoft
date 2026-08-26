"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import { SlidersHorizontal, X } from "lucide-react";
import EmptyState from "../components/EmptyState";
import ProductCard from "../components/ProductCard";
import AccessoryFilterPanel from "../components/AccessoryFilterPanel";
import {
  getProductsByGroup,
  isProductInCategory,
  getCategoryCount,
  getBedFrameCategoryMeta,
  BED_FRAME_CATEGORY_LIST
} from "../utils/productHelpers";
import { ensureProductPricing } from "../utils/pricingEngine";

/**
 * Catalogue view for Bed Frames main category.
 */
export default function BedFramesView({ categoryParam = "all" }) {
  const { searchQuery, setSearchQuery, products, categories } = useStore();

  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [priceAvailability, setPriceAvailability] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sync state when categoryParam changes via router
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam.toLowerCase().trim());
    }
  }, [categoryParam]);

  // Resolve subcategories dynamically from store/admin categories if available, else static default
  const subcategoryList = useMemo(() => {
    const adminCats = Array.isArray(categories) ? categories : [];
    const bedFramesMain = adminCats.find(
      (c) => c.id === "CAT-BED-FRAMES" || c.slug === "bed-frames" || (c.name && c.name.toLowerCase() === "bed frames")
    );
    if (bedFramesMain && Array.isArray(bedFramesMain.subcategories) && bedFramesMain.subcategories.length > 0) {
      return bedFramesMain.subcategories.filter((s) => s.active !== false);
    }
    const flatSubs = adminCats.filter((c) => c.parentId === "CAT-BED-FRAMES" && !c.isParent);
    if (flatSubs.length > 0) return flatSubs;

    return BED_FRAME_CATEGORY_LIST;
  }, [categories]);

  // Hydrate bed frame products from store products
  const hydratedBedFrames = useMemo(() => {
    const allProds = (products && products.length > 0) ? products : [];
    const bedFrameList = getProductsByGroup(allProds, "bed-frames");
    return bedFrameList.map((item) => ensureProductPricing(item));
  }, [products]);

  const isValidCategoryParam = useMemo(() => {
    if (!categoryParam || categoryParam.toLowerCase() === "all") return true;
    return !!getBedFrameCategoryMeta(categoryParam) ||
           subcategoryList.some((s) => s.slug === categoryParam || s.id === categoryParam);
  }, [categoryParam, subcategoryList]);

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    const targetUrl = slug === "all" ? "/bed-frames" : `/bed-frames/${slug}`;
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", targetUrl);
    }
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceAvailability("All");
    setSortBy("Recommended");
    setSearchQuery("");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/bed-frames");
    }
  };

  const filteredBedFrames = useMemo(() => {
    return hydratedBedFrames.filter((item) => {
      // 1. Global Search Query
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

      // 2. Subcategory Filter
      if (selectedCategory !== "all" && selectedCategory !== "All") {
        if (!isProductInCategory(item, selectedCategory)) return false;
      }

      // 3. Price Availability Filter
      const hasPrice = (item.startingPrice && item.startingPrice > 0) || (item.price && item.price > 0);
      if (priceAvailability === "Priced") {
        if (!hasPrice) return false;
      } else if (priceAvailability === "Contact") {
        if (hasPrice) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "Price: Low to High") {
        const priceA = a.startingPrice || a.price || 999999;
        const priceB = b.startingPrice || b.price || 999999;
        return priceA - priceB;
      }
      if (sortBy === "Price: High to Low") {
        const priceA = a.startingPrice || a.price || 0;
        const priceB = b.startingPrice || b.price || 0;
        return priceB - priceA;
      }
      return 0;
    });
  }, [hydratedBedFrames, searchQuery, selectedCategory, priceAvailability, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts = { all: hydratedBedFrames.length };
    subcategoryList.forEach((c) => {
      const slugKey = c.slug || c.id;
      counts[slugKey] = getCategoryCount(hydratedBedFrames, slugKey);
    });
    return counts;
  }, [hydratedBedFrames, subcategoryList]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (priceAvailability !== "All") count++;
    return count;
  }, [priceAvailability]);

  if (!isValidCategoryParam) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <EmptyState
          iconType="search"
          title="Category Not Found"
          message="The bed frame category you are looking for does not exist or has been moved."
          actionLabel="View All Bed Frames"
          onAction={resetFilters}
        />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* ── FILTER & CONTROLS BAR ──────────────────────────────────── */}
      <div style={filterBarContainerStyle}>

        {/* Category Pills & Filter Button */}
        <div style={categoryRowWrapStyle}>
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="filter-toggle-btn"
            style={{
              ...filterToggleBtnStyle,
              backgroundColor: isFilterOpen ? "#15803D" : "#16A34A",
              color: "#FFFFFF",
              borderColor: isFilterOpen ? "#15803D" : "#16A34A"
            }}
          >
            <SlidersHorizontal size={15} color="#FFFFFF" />
            <span>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</span>
          </button>

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
            All Bed Frames ({categoryCounts.all})
          </button>

          {subcategoryList.map((cat) => {
            const slugKey = cat.slug || cat.id;
            const isSelected = selectedCategory === slugKey;
            const count = categoryCounts[slugKey] || 0;
            return (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={() => handleCategorySelect(slugKey)}
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

        {/* Results Count */}
        <div style={resultsCountStyle}>
          Showing <strong>{filteredBedFrames.length}</strong>{" "}
          {filteredBedFrames.length === hydratedBedFrames.length ? "bed frames" : <>of <strong>{hydratedBedFrames.length}</strong> bed frames</>}
        </div>

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div style={activeBadgesRowStyle}>
            <span style={activeBadgesLabelStyle}>Active Filters:</span>
            {priceAvailability !== "All" && (
              <span style={activeBadgeStyle}>
                {priceAvailability === "Priced" ? "Priced Products" : "Contact for Price"}
                <button type="button" onClick={() => setPriceAvailability("All")} style={removeBadgeBtnStyle} aria-label="Remove pricing filter">
                  <X size={12} />
                </button>
              </span>
            )}
            <button type="button" onClick={resetFilters} style={clearAllLinkStyle}>
              Clear all
            </button>
          </div>
        )}

        {/* Collapsible Filter Panel */}
        <AccessoryFilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          selectedFirmness="All"
          setSelectedFirmness={() => {}}
          priceAvailability={priceAvailability}
          setPriceAvailability={setPriceAvailability}
          sortBy={sortBy}
          setSortBy={setSortBy}
          resetFilters={resetFilters}
        />
      </div>

      {/* ── BED FRAMES PRODUCT GRID ─────────────────────────────────────────── */}
      {filteredBedFrames.length > 0 ? (
        <div className="catalog-grid" style={gridStyle}>
          {filteredBedFrames.map((item) => (
            <div key={item.id} style={{ height: "100%" }}>
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      ) : (
        <div style={emptyWrapperStyle}>
          <EmptyState
            iconType="search"
            title="No bed frames found"
            message="No bed frame products match your search or filter selection. Try clearing your filters."
            actionLabel="Reset Filters"
            onAction={resetFilters}
          />
        </div>
      )}

      <style>{`
        .filter-toggle-btn:hover {
          background-color: #15803D !important;
          border-color: #15803D !important;
          color: #FFFFFF !important;
        }
        @media (max-width: 767px) {
          .catalog-grid {
            grid-template-columns: repeat(1, 1fr) !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── STYLING ──────────────────────────────────────────────────────────────────
const containerStyle = {
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "24px 24px 80px 24px",
  width: "100%"
};

const filterBarContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginBottom: "24px",
  padding: "0"
};

const categoryRowWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap"
};

const categoryPillBtnStyle = {
  padding: "8px 16px",
  borderRadius: "999px",
  borderWidth: "1.5px",
  borderStyle: "solid",
  borderColor: "#E7E7E2",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "all 0.2s ease"
};

const filterToggleBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  height: "37px",
  padding: "0 16px",
  borderRadius: "999px",
  borderWidth: "1.5px",
  borderStyle: "solid",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  whiteSpace: "nowrap",
  flex: "0 0 auto",
  transition: "all 0.2s ease"
};

const activeBadgesRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
  paddingTop: "6px"
};

const activeBadgesLabelStyle = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#64748B"
};

const activeBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "4px 10px",
  borderRadius: "999px",
  backgroundColor: "#EEF2FF",
  color: "#1B1F8C",
  border: "1px solid #C7D2FE",
  fontSize: "12px",
  fontWeight: "700"
};

const removeBadgeBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#1B1F8C",
  padding: "2px"
};

const clearAllLinkStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#E11D48",
  fontSize: "12px",
  fontWeight: "700",
  textDecoration: "underline",
  padding: "2px 4px"
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

const emptyWrapperStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  padding: "60px 0"
};
