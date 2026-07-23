import React from "react";
import { useStore } from "../context/StoreContext";
import { formatPrice } from "../utils/currency";

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, navigateTo } = useStore();
  const isWishlisted = wishlist.includes(product.id);

  const handleWishlistClick = (event) => {
    event.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <article
      onClick={() => navigateTo("detail", product.id)}
      style={cardStyle}
      className="product-card"
    >
      <div style={imageWrapperStyle}>
        <img src={product.images[0]} alt={product.name} style={imageStyle} />

        <button
          onClick={handleWishlistClick}
          style={wishlistBtnStyle}
          className="pc-wishlist-btn"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "#16A34A" : "none"}
            stroke={isWishlisted ? "#16A34A" : "#1B1F8C"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div style={infoWrapperStyle} className="pc-info">
        <div style={titleRowStyle}>
          <h4 style={titleStyle}>{product.name}</h4>
          {product.category && <span style={categoryStyle} className="pc-category">{product.category}</span>}
        </div>
        <div style={metaRowStyle}>
          <span style={priceStyle} className="pc-price">{formatPrice(product.price)}</span>
          <span style={compactRatingStyle} className="pc-rating">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#16A34A" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 767px) {
          .product-card {
            min-width: 0;
          }
          .product-card h4 {
            font-size: 13px !important;
            min-height: 0 !important;
          }
          .product-card .pc-category {
            font-size: 9px !important;
            padding: 2px 6px !important;
          }
          .product-card .pc-price {
            font-size: 14px !important;
          }
          .product-card .pc-rating {
            font-size: 10px !important;
          }
          .product-card .pc-info {
            padding: 10px 10px 12px !important;
            gap: 6px !important;
          }
          .product-card .pc-wishlist-btn {
            width: 26px !important;
            height: 26px !important;
            top: 8px !important;
            right: 8px !important;
          }
        }
      `}</style>
    </article>
  );
}

const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: 0,
  overflow: "hidden",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  transition: "all 0.25s ease"
};

const imageWrapperStyle = {
  position: "relative",
  width: "100%",
  aspectRatio: "1 / 0.82",
  backgroundColor: "#F3F3F0",
  overflow: "hidden"
};

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block"
};

const wishlistBtnStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  backgroundColor: "#FFFFFF",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 1px 4px rgba(20, 21, 26, 0.15)"
};

const infoWrapperStyle = {
  padding: "12px 13px 13px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  flex: 1
};

const titleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap"
};

const titleStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#1B1F8C",
  lineHeight: "1.3"
};

const categoryStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#6B6B75",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  backgroundColor: "#F3F3F0",
  padding: "2px 7px",
  borderRadius: "999px"
};

const metaRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  marginTop: "auto"
};

const compactRatingStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  color: "#14151A",
  fontSize: "11px",
  fontWeight: "800",
  flexShrink: 0
};

const priceStyle = {
  fontSize: "15px",
  fontWeight: "800",
  color: "#14151A"
};