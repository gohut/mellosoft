import React from "react";

export default function RatingStars({ rating = 5, count = null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#16A34A" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      
      <span style={{ fontSize: "14px", fontWeight: "600", color: "#14151A" }}>
        {rating.toFixed(1)}
      </span>
      
      {count !== null && (
        <span style={{ fontSize: "13px", color: "#6B6B75" }}>
          ({count} reviews)
        </span>
      )}
    </div>
  );
}
