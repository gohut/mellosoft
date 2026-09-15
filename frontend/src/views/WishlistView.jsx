"use client";

import React, { useMemo } from "react";
import { useStore } from "../context/StoreContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { MOCK_PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";

export default function WishlistView() {
  const { wishlist, toggleWishlist, moveToCart, navigateTo, products, setAuthModal } = useStore();
  const { isAuthenticated, setIntendedView } = useCustomerAuth();

  const savedProducts = useMemo(() => {
    const list = (products && products.length > 0) ? products : MOCK_PRODUCTS;
    return list.filter((product) => wishlist.includes(product.id));
  }, [wishlist, products]);

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

  if (!isAuthenticated) {
    return (
      <div style={emptyWrapperStyle}>
        <div style={{
          maxWidth: "480px",
          margin: "40px auto",
          backgroundColor: "#FAFAF7",
          border: "1px solid #E7E7E2",
          borderRadius: "16px",
          padding: "40px 24px",
          textAlign: "center"
        }}>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#14151A", marginBottom: "8px" }}>Sign In to View Your Wishlist</h3>
          <p style={{ fontSize: "14px", color: "#6B6B75", marginBottom: "24px", lineHeight: 1.6 }}>
            Please sign in to save and manage your favorite mattresses and sleep accessories.
          </p>
          <button
            onClick={() => {
              if (setIntendedView) setIntendedView("/wishlist");
              if (setAuthModal) setAuthModal("login");
            }}
            style={{
              padding: "12px 28px",
              backgroundColor: "#1B1F8C",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "24px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer"
            }}
            className="hover-lift"
          >
            Sign In to Account
          </button>
        </div>
      </div>
    );
  }

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
    <div style={containerStyle} className="wishlist-page-container">
      
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
          .wishlist-page-container {
            padding: 16px 14px 60px 14px !important;
          }
          .wishlist-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }
        @media (max-width: 310px) {
          .wishlist-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
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
