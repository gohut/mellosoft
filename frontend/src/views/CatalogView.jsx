"use client";

import React, { useMemo } from "react";
import { useStore } from "../context/StoreContext";
import { MOCK_PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";

export default function CatalogView() {
  const { 
    searchQuery, 
    setSearchQuery, 
    activeFilters, 
    setActiveFilters 
  } = useStore();

  const resetFilters = () => {
    setActiveFilters({
      category: "All",
      firmness: "All",
      size: "All",
      sort: "Recommended"
    });
    setSearchQuery("");
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const categorySelect = activeFilters.category || "All";
    
    return MOCK_PRODUCTS.filter((product) => {
      // 1. Filter by global search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesTagline = product.tagline.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        if (!matchesName && !matchesTagline && !matchesCategory) {
          return false;
        }
      }

      // 2. Filter by Category
      if (categorySelect !== "All" && product.category !== categorySelect) {
        return false;
      }

      // 3. Filter by Firmness
      if (
        activeFilters.firmness !== "All" && 
        !product.firmnessOptions.includes(activeFilters.firmness)
      ) {
        return false;
      }

      // 4. Filter by Size
      if (
        activeFilters.size !== "All" && 
        !product.sizeOptions.includes(activeFilters.size)
      ) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort logic
      if (activeFilters.sort === "Price: Low to High") {
        return a.price - b.price;
      }
      if (activeFilters.sort === "Price: High to Low") {
        return b.price - a.price;
      }
      if (activeFilters.sort === "Rating") {
        return b.rating - a.rating;
      }
      // "Recommended" uses default mock ordering
      return 0;
    });
  }, [searchQuery, activeFilters]);

  return (
    <div style={catalogContainerStyle}>
      
      {/* Banner */}

      {/* Search status summary if searching */}
      {searchQuery && (
        <div style={searchQueryStatusStyle}>
          <span>Showing results for <strong>{searchQuery}</strong> ({filteredProducts.length} items)</span>
          <button onClick={resetFilters} style={clearFiltersBtnStyle}>
            Clear
          </button>
        </div>
      )}

      {/* Grid / Empty State */}
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
            title="No matches found" 
            message="We couldn't find any products matching your specific combinations. Try resetting the filters or search term." 
            actionLabel="Reset filters" 
            onAction={resetFilters} 
          />
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 767px) {
          .catalog-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 420px) {
          .catalog-grid {
            gap: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Styling Object Configurations
const catalogContainerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "40px 24px 80px 24px",
  width: "100%"
};

const bannerStyle = {
  textAlign: "center",
  marginBottom: "48px",
  padding: "34px 24px 42px",
  borderBottom: "1px solid #E7E7E2"
};

const eyebrowStyle = {
  fontSize: "14px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#16A34A",
  display: "block",
  marginBottom: "12px"
};

const headingStyle = {
  fontSize: "36px",
  fontWeight: "800",
  color: "#1B1F8C",
  marginBottom: "16px"
};

const subheadingStyle = {
  fontSize: "15px",
  color: "#6B6B75",
  lineHeight: "1.6",
  maxWidth: "600px",
  margin: "0 auto"
};

const clearFiltersBtnStyle = {
  backgroundColor: "transparent",
  color: "#1B1F8C",
  border: "none",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  textDecoration: "underline",
  padding: "8px 12px"
};

const searchQueryStatusStyle = {
  marginBottom: "24px",
  fontSize: "15px",
  color: "#6B6B75",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap"
};

// Grid layout
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "30px"
};

const emptyWrapperStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  padding: "40px 0"
};