import React from "react";

export default function RatingStars({ rating = 5, count = null, showNumber = false }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4 && rating % 1 <= 0.8;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {/* Full Stars */}
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} width="16" height="16" viewBox="0 0 24 24" fill="#16A34A" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}

        {/* Half Star */}
        {hasHalf && (
          <div style={{ position: "relative", width: "16px", height: "16px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E7E7E2" strokeWidth="2" style={{ position: "absolute", top: 0, left: 0 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <div style={{ width: "50%", overflow: "hidden", position: "absolute", top: 0, left: 0, height: "16px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#16A34A" stroke="#16A34A" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
        )}

        {/* Empty Stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E7E7E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      
      {showNumber && (
        <span style={{ fontSize: "14px", fontWeight: "600", color: "#14151A" }}>
          {rating.toFixed(1)}
        </span>
      )}
      
      {count !== null && (
        <span style={{ fontSize: "13px", color: "#6B6B75" }}>
          ({count} reviews)
        </span>
      )}
    </div>
  );
}
