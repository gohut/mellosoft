"use client";

import React, { useMemo } from "react";
import { useStore } from "../context/StoreContext";
import { MOCK_PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";

export default function WishlistView() {
  const { wishlist, toggleWishlist, moveToCart, navigateTo } = useStore();

  const savedProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => wishlist.includes(product.id));
  }, [wishlist]);

  const handleClearAll = () => {
    // Toggle all items off
    savedProducts.forEach((p) => {
      toggleWishlist(p.id);
    });
  };

  const handleMoveAllToCart = () => {
    savedProducts.forEach((p) => {
      moveToCart(p.id, "Medium", "Queen");
    });
  };

  if (savedProducts.length === 0) {
    return (
      <div style={emptyWrapperStyle}>
        <EmptyState
          iconType="wishlist"
          title="Your wishlist is empty"
          message="Keep track of products you love by adding them to your wishlist. They will be saved here so you can check them out later."
          actionLabel="View Products"
          onAction={() => navigateTo("catalog")}
        />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      
      {/* Header bar with bulk actions */}
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>Saved Products</h2>
          <p style={subtitleStyle}>You have {savedProducts.length} items in your wishlist.</p>
        </div>
        
        <div style={actionsContainerStyle}>
          <button onClick={handleClearAll} style={clearAllBtnStyle}>
            Clear Wishlist
          </button>
          <button onClick={handleMoveAllToCart} style={moveAllBtnStyle} className="hover-lift">
            Move All to Cart
          </button>
        </div>
      </div>

      {/* Grid of Saved Cards */}
      <div style={gridStyle} className="wishlist-grid">
        {savedProducts.map((product) => (
          <div key={product.id} style={{ position: "relative", height: "100%" }}>
            <ProductCard product={product} />
            
            {/* Overlay a explicit Remove & Move to Cart panel below or around if needed */}
            <div style={wishlistCardOverlayStyle}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  moveToCart(product.id, "Medium", "Queen");
                }} 
                style={cardMoveCartBtnStyle}
                className="hover-lift"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "4px" }}>
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Move to Cart
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }} 
                style={cardRemoveBtnStyle}
                aria-label="Remove item"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 767px) {
          .wishlist-grid {
            overflow-x: auto !important;
            display: grid !important;
            grid-auto-flow: column !important;
            grid-auto-columns: minmax(220px, 68vw) !important;
            grid-template-columns: none !important;
            gap: 14px !important;
            padding-bottom: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Styling Object Configurations
const containerStyle = {
  width: "100%",
  padding: "40px 48px 80px 48px",
  boxSizing: "border-box",
  backgroundColor: "#FFFFFF",
  minHeight: "calc(100vh - 160px)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  flexWrap: "wrap",
  gap: "16px",
  marginBottom: "32px",
  borderBottom: "1px solid #E7E7E2",
  paddingBottom: "20px"
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "800",
  color: "#1B1F8C"
};

const subtitleStyle = {
  fontSize: "14px",
  color: "#6B6B75",
  marginTop: "4px"
};

const actionsContainerStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "center"
};

const clearAllBtnStyle = {
  backgroundColor: "transparent",
  color: "#6B6B75",
  border: "none",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  textDecoration: "underline",
  padding: "8px 12px"
};

const moveAllBtnStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "20px",
  padding: "10px 20px",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "40px"
};

const emptyWrapperStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "80px 24px",
  width: "100%",
  boxSizing: "border-box",
  backgroundColor: "#FFFFFF",
  minHeight: "calc(100vh - 160px)",
};

// Wishlist Specific Card Footer Overlay
const wishlistCardOverlayStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#FFFFFF",
  padding: "10px 16px",
  borderRadius: 0,
  marginTop: "10px",
  border: "1px solid #E2E8F0"
};

const cardMoveCartBtnStyle = {
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "14px",
  padding: "6px 12px",
  fontSize: "12px",
  fontWeight: "700",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const cardRemoveBtnStyle = {
  backgroundColor: "transparent",
  color: "#6B6B75",
  border: "none",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  textDecoration: "underline"
};
