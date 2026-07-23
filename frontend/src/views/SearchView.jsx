"use client";

import React, { useMemo } from "react";
import { useStore } from "../context/StoreContext";
import { MOCK_PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";

export default function SearchView() {
  const { searchQuery, setSearchQuery, navigateTo, setActiveFilters } = useStore();

  const recentSearches = ["Classic Mattress", "Cooling", "Luxe Hybrid", "Pillow", "Protector"];

  // Filter products by search term
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return MOCK_PRODUCTS.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.tagline.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.badge?.toLowerCase().includes(query) ||
        product.specs.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const handleRecentClick = (term) => {
    setSearchQuery(term);
  };

  return (
    <div style={containerStyle}>
      {/* Search Header Wrapper */}
      <div style={searchHeaderBoxStyle}>
        <div style={inputWrapperStyle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B1F8C" strokeWidth="2.5" style={{ marginLeft: "14px" }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search mattresses, pillows, bed frames, protectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={inputStyle}
            autoFocus
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              style={clearBtnStyle}
              aria-label="Clear search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B75" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Recent Search Chips */}
        <div style={recentSearchesStyle}>
          <span style={recentLabelStyle}>Recent Searches:</span>
          <div style={chipsWrapperStyle}>
            {recentSearches.map((term) => (
              <button 
                key={term}
                onClick={() => handleRecentClick(term)}
                style={chipStyle}
                className="hover-lift"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      {searchQuery && (
        <div style={resultsHeaderStyle}>
          <h3 style={resultsTitleStyle}>
            Search Results for <span>{searchQuery}</span>
          </h3>
          <span style={resultsCountStyle}>
            Found {searchResults.length} matching products
          </span>
        </div>
      )}

      {/* Grid or Empty/Initial State */}
      {searchQuery ? (
        searchResults.length > 0 ? (
          <div style={gridStyle} className="search-grid">
            {searchResults.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div style={emptyWrapperStyle}>
            <EmptyState 
              iconType="search"
              title="No results found"
              message={`We couldn't find any sleep products matching "${searchQuery}". Check your spelling or try searching for keywords like "pillow", "cool", or "luxe".`}
              actionLabel="Clear Search"
              onAction={() => setSearchQuery("")}
            />
          </div>
        )
      ) : (
        /* Initial/No Search State */
        <div style={initialStateStyle}>
          <h4 style={initialHeadingStyle}>Discover Mellosoft</h4>
          <p style={initialSubStyle}>Type in the search bar above to find the perfect mattress or accessory for your sleep style.</p>
          
          <div style={shortcutGridStyle}>
            <div onClick={() => {
              setActiveFilters((prev) => ({ ...prev, category: "mattress" }));
              navigateTo("catalog");
            }} style={shortcutCardStyle} className="hover-lift">
              <span style={shortcutIconStyle}>🛏️</span>
              <span style={shortcutTextStyle}>Shop Mattresses</span>
            </div>
            <div onClick={() => {
              setActiveFilters((prev) => ({ ...prev, category: "pillows" }));
              navigateTo("catalog");
            }} style={shortcutCardStyle} className="hover-lift">
              <span style={shortcutIconStyle}>☁️</span>
              <span style={shortcutTextStyle}>Shop Pillows</span>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 767px) {
          .search-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 14px !important;
            overflow-x: visible !important;
          }
        }
      `}</style>

    </div>
  );
}

// Styling Object Configurations
const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "40px 24px 80px 24px",
  width: "100%"
};

const searchHeaderBoxStyle = {
  backgroundColor: "#FFFFFF",
  padding: "30px",
  marginBottom: "36px"
};

const inputWrapperStyle = {
  display: "flex",
  alignItems: "center",
  border: "2px solid #E7E7E2",
  borderRadius: "30px",
  backgroundColor: "#F7F7F2",
  padding: "6px",
  transition: "all 0.2s ease"
};

const inputStyle = {
  flexGrow: 1,
  border: "none",
  background: "none",
  padding: "10px 14px",
  fontSize: "16px",
  fontWeight: "500",
  color: "#14151A",
  outline: "none"
};

const clearBtnStyle = {
  border: "none",
  background: "none",
  cursor: "pointer",
  padding: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const recentSearchesStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "12px",
  marginTop: "20px"
};

const recentLabelStyle = {
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#6B6B75"
};

const chipsWrapperStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px"
};

const chipStyle = {
  backgroundColor: "#F7F7F2",
  border: "1px solid #E7E7E2",
  borderRadius: "16px",
  padding: "6px 14px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#1B1F8C",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

// Results Header
const resultsHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: "24px",
  flexWrap: "wrap",
  gap: "12px"
};

const resultsTitleStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#1B1F8C",
  span: {
    color: "#16A34A"
  }
};

const resultsCountStyle = {
  fontSize: "13px",
  color: "#6B6B75",
  fontWeight: "500"
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
  padding: "20px 0"
};

// Initial State Style
const initialStateStyle = {
  textAlign: "center",
  padding: "60px 24px",
  maxWidth: "500px",
  margin: "0 auto"
};

const initialHeadingStyle = {
  fontSize: "22px",
  fontWeight: "800",
  color: "#1B1F8C",
  marginBottom: "12px"
};

const initialSubStyle = {
  fontSize: "14.5px",
  color: "#6B6B75",
  lineHeight: "1.5",
  marginBottom: "32px"
};

const shortcutGridStyle = {
  display: "flex",
  gap: "16px",
  justifyContent: "center"
};

const shortcutCardStyle = {
  flex: 1,
  backgroundColor: "#FFFFFF",
  border: "none",
  borderRadius: 0,
  padding: "20px",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s ease"
};

const shortcutIconStyle = {
  fontSize: "28px"
};

const shortcutTextStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#1B1F8C"
};