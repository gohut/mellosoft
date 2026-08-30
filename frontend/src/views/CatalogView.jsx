"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import { MOCK_PRODUCTS } from "../data/products";
import { MATTRESS_CATEGORY_LIST, getMattressCategoryMeta, isProductInCategory, getProductsByGroup, getCategoryCount } from "../utils/productHelpers";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import MattressFilterPanel from "../components/MattressFilterPanel";
import MobileSubcategoryDropdown from "../components/MobileSubcategoryDropdown";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductGridSkeleton } from "../components/skeleton";

export default function CatalogView({ categoryParam = "all" }) {
  const { searchQuery, setSearchQuery, activeFilters, setActiveFilters, products } = useStore();

  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam && categoryParam !== "all" && categoryParam !== "mattress"
      ? categoryParam
      : (activeFilters.category !== "All" && activeFilters.category !== "all" && activeFilters.category !== "mattress" ? activeFilters.category : "all")
  );
  const [selectedThickness, setSelectedThickness] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [priceAvailability, setPriceAvailability] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Hydration guard — show skeleton until client mounts
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Sync state if categoryParam changes via router
  useEffect(() => {
    if (categoryParam) {
      const norm = categoryParam.toLowerCase().trim();
      if (norm === "all" || norm === "mattress") {
        setSelectedCategory("all");
      } else {
        setSelectedCategory(norm);
      }
    }
  }, [categoryParam]);

  const isValidCategoryParam = useMemo(() => {
    if (!categoryParam || categoryParam.toLowerCase() === "all" || categoryParam.toLowerCase() === "mattress") return true;
    return !!getMattressCategoryMeta(categoryParam);
  }, [categoryParam]);

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    setActiveFilters((prev) => ({ ...prev, category: slug }));
    const targetUrl = (slug === "all" || slug === "mattress") ? "/mattresses" : `/mattresses/${slug}`;
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", targetUrl);
    }
  };

  const resetAllFilters = () => {
    setSelectedCategory("all");
    setSelectedThickness("All");
    setSelectedSize("All");
    setPriceAvailability("All");
    setSortBy("Recommended");
    setSearchQuery("");
    setActiveFilters({ category: "all", firmness: "All", size: "All", sort: "Recommended" });
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/mattresses");
    }
  };

  // Master Mattress Products List (strictly excludes accessories)
  const mattressOnlyProducts = useMemo(() => {
    const list = (products && products.length > 0) ? products : MOCK_PRODUCTS;
    return getProductsByGroup(list, "mattresses");
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return mattressOnlyProducts.filter((product) => {
      // 1. Global Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesTagline = (product.tagline || "").toLowerCase().includes(query);
        const matchesCategory = (product.category || "").toLowerCase().includes(query);
        const matchesConstruction = (product.construction || "").toLowerCase().includes(query);
        if (!matchesName && !matchesTagline && !matchesCategory && !matchesConstruction) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== "All" && selectedCategory !== "all" && selectedCategory !== "mattress") {
        if (!isProductInCategory(product, selectedCategory)) return false;
      }

      // 3. Thickness Filter
      if (selectedThickness !== "All") {
        const thicknessList = product.thicknessOptions || [];
        const hasThickness = thicknessList.some((t) => String(t).includes(selectedThickness));
        if (!hasThickness) return false;
      }

      // 4. Size Type Filter
      if (selectedSize !== "All") {
        const sizes = product.sizeOptions || ["Single", "Double", "Queen", "King"];
        if (!sizes.includes(selectedSize)) return false;
      }

      // 5. Price Availability Filter
      const hasPrice = (product.startingPrice && product.startingPrice > 0) || (product.price && product.price > 0);
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
  }, [mattressOnlyProducts, searchQuery, selectedCategory, selectedThickness, selectedSize, priceAvailability, sortBy]);

  // Product counts by category
  const categoryCounts = useMemo(() => {
    const counts = { all: mattressOnlyProducts.length };
    MATTRESS_CATEGORY_LIST.forEach((c) => {
      counts[c.slug] = getCategoryCount(mattressOnlyProducts, c.slug);
    });
    return counts;
  }, [mattressOnlyProducts]);

  // Secondary active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedThickness !== "All") count++;
    if (selectedSize !== "All") count++;
    if (priceAvailability !== "All") count++;
    return count;
  }, [selectedThickness, selectedSize, priceAvailability]);

  if (!isValidCategoryParam) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <EmptyState
          iconType="search"
          title="Category Not Found"
          message="The mattress category you are looking for does not exist or has been moved."
          actionLabel="View All Mattresses"
          onAction={resetAllFilters}
        />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* ── FILTERING & CONTROLS BAR ──────────────────────────────────── */}
      <div style={filterBarContainerStyle}>
        
        {/* Category Pills & Filter Button */}
        <div style={categoryRowWrapStyle} className="catalog-filter-bar">
          {/* Desktop Category Pills */}
          <div className="desktop-category-pills" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
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
                backgroundColor: (selectedCategory === "all" || selectedCategory === "All" || selectedCategory === "mattress") ? "#1B1F8C" : "#FFFFFF",
                color: (selectedCategory === "all" || selectedCategory === "All" || selectedCategory === "mattress") ? "#FFFFFF" : "#14151A",
                borderColor: (selectedCategory === "all" || selectedCategory === "All" || selectedCategory === "mattress") ? "#1B1F8C" : "#E7E7E2"
              }}
            >
              All Products ({categoryCounts.all})
            </button>

            {MATTRESS_CATEGORY_LIST.map((cat) => {
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

          {/* Mobile Category Row: Filter + Dropdown */}
          <div className="mobile-category-row" style={{ display: "none", alignItems: "center", gap: "10px", width: "100%" }}>
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className="filter-toggle-btn"
              style={{
                ...filterToggleBtnStyle,
                backgroundColor: isFilterOpen ? "#15803D" : "#16A34A",
                color: "#FFFFFF",
                borderColor: isFilterOpen ? "#15803D" : "#16A34A",
                flexShrink: 0
              }}
            >
              <SlidersHorizontal size={15} color="#FFFFFF" />
              <span>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</span>
            </button>

            <MobileSubcategoryDropdown
              items={MATTRESS_CATEGORY_LIST}
              categoryCounts={categoryCounts}
              selectedValue={selectedCategory}
              onChange={handleCategorySelect}
              allLabel="All Products"
              allCount={categoryCounts.all}
            />
          </div>
        </div>

        {/* Results Count Line */}
        <div style={resultsCountStyle}>
          Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === mattressOnlyProducts.length ? "mattresses" : <>of <strong>{mattressOnlyProducts.length}</strong> mattresses</>}
        </div>

        {/* Active Filter Badges Summary */}
        {activeFilterCount > 0 && (
          <div style={activeBadgesRowStyle}>
            <span style={activeBadgesLabelStyle}>Active Filters:</span>
            {selectedThickness !== "All" && (
              <span style={activeBadgeStyle}>
                {selectedThickness} Inch
                <button type="button" onClick={() => setSelectedThickness("All")} style={removeBadgeBtnStyle} aria-label="Remove thickness filter">
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedSize !== "All" && (
              <span style={activeBadgeStyle}>
                {selectedSize}
                <button type="button" onClick={() => setSelectedSize("All")} style={removeBadgeBtnStyle} aria-label="Remove size filter">
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
            <button type="button" onClick={resetAllFilters} style={clearAllLinkStyle}>
              Clear all
            </button>
          </div>
        )}

        {/* Collapsible Filter Panel */}
        <MattressFilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          selectedThickness={selectedThickness}
          setSelectedThickness={setSelectedThickness}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          priceAvailability={priceAvailability}
          setPriceAvailability={setPriceAvailability}
          sortBy={sortBy}
          setSortBy={setSortBy}
          resetAllFilters={resetAllFilters}
        />

      </div>

      {/* ── PRODUCT GRID ────────────────────────────────────────────────────── */}
      {!mounted ? (
        <ProductGridSkeleton count={8} gridStyle={{ padding: "0 20px 24px" }} />
      ) : filteredProducts.length > 0 ? (
        <div className="catalog-grid" style={gridStyle}>
          {filteredProducts.map((product) => (
            <div key={product.id} style={{ height: "100%" }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div style={emptyWrapperStyle}>
          <EmptyState
            iconType="search"
            title="No matching mattresses"
            message="No products match your active filter selection. Try clearing filters to see all 66 products."
            actionLabel="Reset All Filters"
            onAction={resetAllFilters}
          />
        </div>
      )}

      <style>{`
        .filter-toggle-btn:hover {
          background-color: #15803D !important;
          border-color: #15803D !important;
          color: #FFFFFF !important;
        }
        @media (max-width: 768px) {
          .desktop-category-pills {
            display: none !important;
          }
          .mobile-category-row {
            display: flex !important;
          }
          .catalog-grid {
            grid-template-columns: repeat(1, 1fr) !important;
            gap: 16px !important;
          }
        }
        @media (min-width: 769px) {
          .desktop-category-pills {
            display: flex !important;
          }
          .mobile-category-row {
            display: none !important;
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
  borderColor: "#16A34A",
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
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


