"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import { MOCK_PRODUCTS } from "../data/products";
import { MATTRESS_CATEGORY_LIST, getMattressCategoryMeta } from "../utils/productHelpers";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import { Search, Filter, RefreshCw } from "lucide-react";

export default function CatalogView({ categoryParam = "all" }) {
  const { searchQuery, setSearchQuery, activeFilters, setActiveFilters } = useStore();

  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam && categoryParam !== "all" && categoryParam !== "mattress"
      ? categoryParam
      : (activeFilters.category !== "All" && activeFilters.category !== "all" && activeFilters.category !== "mattress" ? activeFilters.category : "all")
  );
  const [selectedThickness, setSelectedThickness] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [priceAvailability, setPriceAvailability] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");

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

  // Find active category metadata for hero section
  const currentCategoryMeta = useMemo(() => {
    return getMattressCategoryMeta(selectedCategory);
  }, [selectedCategory]);

  // Master Mattress Products List (strictly excludes accessories)
  const mattressOnlyProducts = useMemo(() => {
    return (MOCK_PRODUCTS || []).filter((p) => p && p.category !== "accessories");
  }, []);

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
        if (product.category !== selectedCategory) return false;
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
      counts[c.slug] = mattressOnlyProducts.filter((p) => p.category === c.slug).length;
    });
    return counts;
  }, [mattressOnlyProducts]);

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
      
      {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
      <div style={heroBannerStyle}>
        <span style={heroEyebrowStyle}>
          {currentCategoryMeta ? currentCategoryMeta.name.toUpperCase() : "MELLOSOFT MATTRESS CATALOGUE"}
        </span>
        <h1 style={heroTitleStyle}>
          {currentCategoryMeta ? currentCategoryMeta.title : "Premium Mattress Collection"}
        </h1>
        <p style={heroSubtextStyle}>
          {currentCategoryMeta
            ? currentCategoryMeta.description
            : "Explore our complete range of 66 engineered mattress models across Foam, Ortho, Spring, Latex, and Memory Foam."}
        </p>
      </div>

      {/* ── FILTERING & SEARCH CONTROLS BAR ──────────────────────────────────── */}
      <div style={filterBarContainerStyle}>
        
        {/* Category Pills */}
        <div style={categoryPillsWrapStyle}>
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

        {/* Dropdown Filters */}
        <div style={dropdownFiltersGridStyle}>
          
          {/* Search Box */}
          <div style={searchWrapStyle}>
            <Search size={16} color="#6B6B75" />
            <input
              type="text"
              placeholder="Search mattresses..."
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

          {/* Thickness Dropdown */}
          <select
            value={selectedThickness}
            onChange={(e) => setSelectedThickness(e.target.value)}
            style={selectInputStyle}
          >
            <option value="All">Thickness: All</option>
            <option value="4">4 Inch</option>
            <option value="5">5 Inch</option>
            <option value="6">6 Inch</option>
            <option value="8">8 Inch</option>
            <option value="10">10 Inch</option>
          </select>

          {/* Size Type Dropdown */}
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            style={selectInputStyle}
          >
            <option value="All">Size: All</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Queen">Queen</option>
            <option value="King">King</option>
          </select>

          {/* Price Availability Filter */}
          <select
            value={priceAvailability}
            onChange={(e) => setPriceAvailability(e.target.value)}
            style={selectInputStyle}
          >
            <option value="All">Pricing: All</option>
            <option value="Priced">Priced Products</option>
            <option value="Contact">Contact for Price</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={selectInputStyle}
          >
            <option value="Recommended">Sort: Recommended</option>
            <option value="Price: Low to High">Price: Low to High</option>
            <option value="Price: High to Low">Price: High to Low</option>
            <option value="Rating">Highest Rated</option>
          </select>

          <button type="button" onClick={resetAllFilters} style={resetBtnStyle} title="Reset all filters">
            <RefreshCw size={14} /> Reset
          </button>
        </div>

        {/* Results summary line */}
        <div style={resultsCountStyle}>
          Showing <strong>{filteredProducts.length}</strong> of <strong>{MOCK_PRODUCTS.length}</strong> products
        </div>

      </div>

      {/* ── PRODUCT GRID ────────────────────────────────────────────────────── */}
      {filteredProducts.length > 0 ? (
        <div className="catalog-grid" style={gridStyle}>
          {filteredProducts.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div style={emptyWrapperStyle}>
          <EmptyState
            iconType="search"
            title="No matching mattresses"
            message="No products match your active search or filter selection. Try clearing filters to see all 66 products."
            actionLabel="Reset All Filters"
            onAction={resetAllFilters}
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
  fontSize: "36px",
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

const dropdownFiltersGridStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  alignItems: "center"
};

const searchWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  backgroundColor: "#F8F9FA",
  border: "1px solid #E2E8F0",
  borderRadius: "10px",
  padding: "0 12px",
  flex: "1 1 240px",
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

const selectInputStyle = {
  height: "42px",
  padding: "0 12px",
  borderRadius: "10px",
  border: "1px solid #E2E8F0",
  backgroundColor: "#FFFFFF",
  fontSize: "13px",
  fontWeight: "600",
  color: "#334155",
  outline: "none",
  cursor: "pointer",
  flex: "1 1 150px"
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

const emptyWrapperStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  padding: "60px 0"
};
