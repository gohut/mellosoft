"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ACCESSORY_PRODUCTS } from "../data/mattressData";
import { ensureProductPricing } from "../utils/pricingEngine";
import { ACCESSORY_CATEGORY_LIST, getAccessoryCategoryMeta } from "../utils/productHelpers";
import { useStore } from "../context/StoreContext";
import { SlidersHorizontal, X } from "lucide-react";
import EmptyState from "../components/EmptyState";
import ProductCard from "../components/ProductCard";
import AccessoryFilterPanel from "../components/AccessoryFilterPanel";

export default function AccessoriesView({ categoryParam = "all" }) {
  const { searchQuery, setSearchQuery } = useStore();
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [selectedFirmness, setSelectedFirmness] = useState("All");
  const [priceAvailability, setPriceAvailability] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hydratedAccessories = useMemo(() => {
    return (ACCESSORY_PRODUCTS || []).map((item) => ensureProductPricing(item));
  }, []);

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

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    const targetUrl = slug === "all" ? "/accessories" : `/accessories/${slug}`;
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", targetUrl);
    }
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedFirmness("All");
    setPriceAvailability("All");
    setSortBy("Recommended");
    setSearchQuery("");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/accessories");
    }
  };

  const filteredAccessories = useMemo(() => {
    return hydratedAccessories.filter((item) => {
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

      // 2. Category Filter
      if (selectedCategory !== "all" && selectedCategory !== "All") {
        if (item.category !== selectedCategory) return false;
      }

      // 3. Firmness / Comfort Filter
      if (selectedFirmness !== "All") {
        if (!item.firmness || item.firmness.toLowerCase() !== selectedFirmness.toLowerCase()) {
          return false;
        }
      }

      // 4. Price Availability Filter
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
      if (sortBy === "Rating") {
        return (b.rating || 5) - (a.rating || 5);
      }
      return 0;
    });
  }, [hydratedAccessories, searchQuery, selectedCategory, selectedFirmness, priceAvailability, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts = { all: ACCESSORY_PRODUCTS.length };
    ACCESSORY_CATEGORY_LIST.forEach((c) => {
      counts[c.slug] = ACCESSORY_PRODUCTS.filter((p) => p.category === c.slug).length;
    });
    return counts;
  }, []);

  // Secondary active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedFirmness !== "All") count++;
    if (priceAvailability !== "All") count++;
    return count;
  }, [selectedFirmness, priceAvailability]);

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
      {/* ── FILTERING & CONTROLS BAR ──────────────────────────────────── */}
      <div style={filterBarContainerStyle}>
        
        {/* Category Pills & Filter Button in Single Flex Row */}
        <div style={categoryRowWrapStyle}>
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

          {/* Filter Toggle Button in same row after Travel Bed */}
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="filter-toggle-btn"
            style={{
              ...filterToggleBtnStyle,
              backgroundColor: (isFilterOpen || activeFilterCount > 0) ? "#1B1F8C" : "#FFFFFF",
              color: (isFilterOpen || activeFilterCount > 0) ? "#FFFFFF" : "#1E293B",
              borderColor: (isFilterOpen || activeFilterCount > 0) ? "#1B1F8C" : "#E2E8F0"
            }}
          >
            <SlidersHorizontal size={15} />
            <span>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</span>
          </button>
        </div>

        {/* Results Count Line */}
        <div style={resultsCountStyle}>
          Showing <strong>{filteredAccessories.length}</strong> {filteredAccessories.length === ACCESSORY_PRODUCTS.length ? "accessories" : <>of <strong>{ACCESSORY_PRODUCTS.length}</strong> accessories</>}
        </div>

        {/* Active Filter Badges Summary */}
        {activeFilterCount > 0 && (
          <div style={activeBadgesRowStyle}>
            <span style={activeBadgesLabelStyle}>Active Filters:</span>
            {selectedFirmness !== "All" && (
              <span style={activeBadgeStyle}>
                {selectedFirmness}
                <button type="button" onClick={() => setSelectedFirmness("All")} style={removeBadgeBtnStyle} aria-label="Remove firmness filter">
                  <X size={12} />
                </button>
              </span>
            )}
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
          selectedFirmness={selectedFirmness}
          setSelectedFirmness={setSelectedFirmness}
          priceAvailability={priceAvailability}
          setPriceAvailability={setPriceAvailability}
          sortBy={sortBy}
          setSortBy={setSortBy}
          resetFilters={resetFilters}
        />

      </div>

      {/* ── ACCESSORIES GRID ─────────────────────────────────────────────────── */}
      {filteredAccessories.length > 0 ? (
        <div className="catalog-grid" style={gridStyle}>
          {filteredAccessories.map((item) => (
            <div key={item.id} style={{ height: "100%" }}>
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      ) : (
        <div style={emptyWrapperStyle}>
          <EmptyState
            iconType="search"
            title="No matching accessories found"
            message="No accessory products match your search or filter selection. Try clearing your filters."
            actionLabel="Reset Filters"
            onAction={resetFilters}
          />
        </div>
      )}

      <style>{`
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

// ── STYLING OBJECTS ──────────────────────────────────────────────────────────
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
  border: "1.5px solid #E7E7E2",
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
  border: "1.5px solid #E2E8F0",
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

