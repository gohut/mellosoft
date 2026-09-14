import React from "react";

function SingleStar({ fillPercentage = 100, size = 14, color = "#F59E0B", emptyColor = "#E2E8F0" }) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }}
    >
      {/* Background Empty Star */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={emptyColor}
        stroke={emptyColor}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>

      {/* Foreground Filled Star with percentage clip width */}
      {fillPercentage > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${fillPercentage}%`,
            height: "100%",
            overflow: "hidden"
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            stroke={color}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ position: "absolute", top: 0, left: 0, minWidth: size, maxWidth: "none" }}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function RatingStars({ rating = 5, count = null, size = 14, showScore = true, color = "#F59E0B" }) {
  const numRating = Number(rating) || 5;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }} aria-label={`${numRating.toFixed(1)} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          let fillPercentage = 0;
          if (numRating >= starIndex) {
            fillPercentage = 100;
          } else if (numRating > starIndex - 1) {
            fillPercentage = Math.round((numRating - (starIndex - 1)) * 100);
          }
          return (
            <SingleStar
              key={starIndex}
              fillPercentage={fillPercentage}
              size={size}
              color={color}
            />
          );
        })}
      </div>
      
      {showScore && (
        <span style={{ fontSize: "14px", fontWeight: "700", color: "#14151A" }}>
          {numRating.toFixed(1)}
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
