"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import { Search, RotateCcw, ArrowRight, Heart, Star } from "lucide-react";
import { formatPrice, calculateDiscountedPrice } from "../utils/currency";

export default function ProductsView() {
  const {
    products,
    categories: storeCategories,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
    wishlist,
    toggleWishlist,
    navigateTo
  } = useStore();

  const [localSearch, setLocalSearch] = useState(searchQuery || "");

  // Active admin categories filter
  const activeCategoriesList = useMemo(() => {
    if (!storeCategories || !Array.isArray(storeCategories)) return [];
    return storeCategories.filter(
      (cat) => cat.status !== "Inactive" && cat.status !== "inactive"
    );
  }, [storeCategories]);

  // Category filter tabs
  const categoryTabs = useMemo(() => {
    const defaultCats = ["All", "Mattresses", "Pillows", "Bed Frames", "Protectors"];
    if (!activeCategoriesList || activeCategoriesList.length === 0) return defaultCats;

    const catNames = activeCategoriesList.map((c) => c.name);
    const set = new Set(["All", ...catNames]);
    return Array.from(set);
  }, [activeCategoriesList]);

  const selectedCategory = activeFilters.category || "All";

  const handleCategorySelect = (catName) => {
    let slug = catName;
    if (catName !== "All") {
      const match = activeCategoriesList.find(
        (c) => c.name.toLowerCase() === catName.toLowerCase()
      );
      if (match) slug = match.slug || match.name;
    }
    setActiveFilters((prev) => ({
      ...prev,
      category: slug,
      firmness: "All",
      size: "All",
      sort: "Recommended"
    }));
  };

  const handleResetFilters = () => {
    setLocalSearch("");
    setSearchQuery("");
    setActiveFilters({
      category: "All",
      firmness: "All",
      size: "All",
      sort: "Recommended"
    });
  };

  // Filter products dynamically from StoreContext products (Admin connected!)
  const filteredProducts = useMemo(() => {
    const sourceProducts = products && Array.isArray(products) && products.length > 0
      ? products
      : [];

    const effectiveSearch = (localSearch || searchQuery || "").trim().toLowerCase();
    const selCat = (selectedCategory || "All").trim().toLowerCase();

    return sourceProducts.filter((product) => {
      // 1. Filter by Search Query (Name, Category, Description, Tagline)
      if (effectiveSearch) {
        const nameMatch = (product.name || product.Product_Name || "").toLowerCase().includes(effectiveSearch);
        const catMatch = (product.category || "").toLowerCase().includes(effectiveSearch);
        const descMatch = (product.description || "").toLowerCase().includes(effectiveSearch);
        const taglineMatch = (product.tagline || "").toLowerCase().includes(effectiveSearch);
        
        if (!nameMatch && !catMatch && !descMatch && !taglineMatch) {
          return false;
        }
      }

      // 2. Filter by Category
      if (selCat !== "all") {
        const pCat = (product.category || "").toLowerCase().trim();
        const matchesCategory =
          pCat === selCat ||
          pCat === selCat.replace(/s$/, "") ||
          selCat === pCat.replace(/s$/, "") ||
          pCat.replace(/\s+/g, "-") === selCat.replace(/\s+/g, "-");
        if (!matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [products, localSearch, searchQuery, selectedCategory]);

  return (
    <div style={containerStyle}>
      {/* 1. PAGE HEADER */}
      <div style={headerBannerStyle}>
        <span style={eyebrowStyle}>MELLOSOFT SLEEP COLLECTION</span>
        <h1 style={headingStyle}>All Products</h1>
        <p style={subheadingStyle}>Discover the perfect comfort for your sleep.</p>

        {/* 2. SEARCH BAR */}
        <div style={searchWrapStyle}>
          <div style={searchInputBoxStyle}>
            <Search size={18} color="#6B6B75" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setSearchQuery(e.target.value);
              }}
              placeholder="Search products by name, category, or description..."
              style={searchInputStyle}
            />
            {localSearch && (
              <button
                onClick={() => {
                  setLocalSearch("");
                  setSearchQuery("");
                }}
                style={clearSearchBtnStyle}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 3. CATEGORY PILLS FILTER */}
        <div style={categoryPillsRowStyle}>
          {categoryTabs.map((catName) => {
            const isSelected =
              selectedCategory.toLowerCase() === catName.toLowerCase() ||
              (selectedCategory.toLowerCase() === "mattress" && catName.toLowerCase() === "mattresses");
            return (
              <button
                key={catName}
                onClick={() => handleCategorySelect(catName)}
                style={{
                  ...categoryPillBtnStyle,
                  backgroundColor: isSelected ? "#1B1F8C" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "#1B1F8C",
                  borderColor: isSelected ? "#1B1F8C" : "#E7E7E2",
                  fontWeight: isSelected ? "800" : "600"
                }}
              >
                {catName}
              </button>
            );
          })}
        </div>
      </div>

      <div style={dividerStyle} />

      {/* SEARCH STATUS BAR */}
      {(localSearch || selectedCategory !== "All") && (
        <div style={statusRowStyle}>
          <span>
            Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "product" : "products"}
            {selectedCategory !== "All" && <span> in <strong>{selectedCategory}</strong></span>}
            {localSearch && <span> matching "<strong>{localSearch}</strong>"</span>}
          </span>
          <button onClick={handleResetFilters} style={resetBtnStyle}>
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

      {/* 4. RESPONSIVE PRODUCT GRID (4 Desktop / 2-3 Tablet / 1-2 Mobile) */}
      {filteredProducts.length > 0 ? (
        <div style={gridFourColStyle} className="products-responsive-grid">
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
            title="Product Not Found"
            message="No products matched your search or category filters. Try searching for mattresses, pillows, or resetting your filter."
            actionLabel="Reset Filters"
            onAction={handleResetFilters}
          />
        </div>
      )}

      {/* Grid Breakpoints Media Query */}
      <style>{`
        @media (max-width: 1200px) {
          .products-responsive-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 840px) {
          .products-responsive-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
        }
        @media (max-width: 520px) {
          .products-responsive-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Inlined Style Tokens
const containerStyle = {
  maxWidth: "1720px",
  margin: "0 auto",
  padding: "40px 48px 80px 48px",
  width: "100%",
  boxSizing: "border-box"
};

const headerBannerStyle = {
  textAlign: "center",
  marginBottom: "36px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px"
};

const eyebrowStyle = {
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "1px",
  color: "#16A34A",
  textTransform: "uppercase"
};

const headingStyle = {
  fontSize: "40px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0,
  lineHeight: "1.15"
};

const subheadingStyle = {
  fontSize: "16px",
  color: "#6B6B75",
  margin: 0
};

const searchWrapStyle = {
  width: "100%",
  maxWidth: "540px",
  marginTop: "12px"
};

const searchInputBoxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "999px",
  padding: "10px 18px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.03)"
};

const searchInputStyle = {
  flex: 1,
  border: "none",
  background: "transparent",
  fontSize: "14px",
  color: "#14151A",
  outline: "none"
};

const clearSearchBtnStyle = {
  border: "none",
  background: "none",
  color: "#1B1F8C",
  fontWeight: "700",
  fontSize: "12px",
  cursor: "pointer"
};

const categoryPillsRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "16px"
};

const categoryPillBtnStyle = {
  border: "1px solid #E7E7E2",
  borderRadius: "999px",
  padding: "8px 20px",
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const dividerStyle = {
  height: "1px",
  backgroundColor: "#E7E7E2",
  marginBottom: "28px"
};

const statusRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "14px",
  color: "#6B6B75",
  marginBottom: "24px",
  flexWrap: "wrap",
  gap: "12px"
};

const resetBtnStyle = {
  border: "none",
  background: "none",
  color: "#1B1F8C",
  fontWeight: "700",
  fontSize: "13px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px"
};

const gridFourColStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "28px"
};

const productCardContainerStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "20px",
  overflow: "hidden",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 6px 18px rgba(0,0,0,0.03)",
  transition: "transform 0.25s ease, box-shadow 0.25s ease"
};

const cardImageWrapperStyle = {
  position: "relative",
  width: "100%",
  aspectRatio: "1 / 0.85",
  backgroundColor: "#FAFAF7",
  overflow: "hidden"
};

const cardImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const cardBadgeStyle = {
  position: "absolute",
  top: "12px",
  left: "12px",
  backgroundColor: "rgba(27, 31, 140, 0.9)",
  color: "#FFFFFF",
  borderRadius: "999px",
  padding: "4px 10px",
  fontSize: "10px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const wishlistHeartBtnStyle = {
  position: "absolute",
  top: "12px",
  right: "12px",
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  backgroundColor: "rgba(255, 255, 255, 0.92)",
  backdropFilter: "blur(4px)",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
};

const cardBodyStyle = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  flexGrow: 1
};

const cardCatBadgeStyle = {
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "0.5px",
  color: "#16A34A",
  textTransform: "uppercase"
};

const cardTitleStyle = {
  fontSize: "17px",
  fontWeight: "700",
  color: "#1B1F8C",
  margin: 0,
  lineHeight: "1.3"
};

const cardDescStyle = {
  fontSize: "13px",
  color: "#6B6B75",
  lineHeight: "1.45",
  margin: 0,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
};

const specsRowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "2px"
};

const specPillStyle = {
  fontSize: "11px",
  fontWeight: "700",
  backgroundColor: "#F7F7F2",
  color: "#1B1F8C",
  border: "1px solid #E7E7E2",
  padding: "3px 8px",
  borderRadius: "6px"
};

const priceRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: "4px"
};

const priceGroupStyle = {
  display: "flex",
  alignItems: "baseline",
  gap: "8px"
};

const discountPriceStyle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#14151A"
};

const actualPriceStyle = {
  fontSize: "13px",
  color: "#9CA3AF",
  textDecoration: "line-through"
};

const discountPillStyle = {
  fontSize: "11px",
  fontWeight: "800",
  backgroundColor: "rgba(22, 163, 74, 0.1)",
  color: "#16A34A",
  padding: "3px 8px",
  borderRadius: "6px"
};

const ratingRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "13px"
};

const ratingValStyle = {
  fontWeight: "800",
  color: "#14151A"
};

const reviewCountStyle = {
  color: "#9CA3AF",
  fontSize: "12px"
};

const viewProductBtnStyle = {
  border: "none",
  backgroundColor: "#FAFAF7",
  color: "#1B1F8C",
  border: "1px solid #1B1F8C",
  borderRadius: "999px",
  padding: "10px 16px",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  marginTop: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  transition: "all 0.2s ease"
};

const emptyWrapperStyle = {
  padding: "60px 0",
  display: "flex",
  justifyContent: "center"
};
