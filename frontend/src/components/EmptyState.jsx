import React from "react";

export default function EmptyState({ iconType = "cart", title, message, actionLabel, onAction }) {
  const renderIcon = () => {
    switch (iconType) {
      case "wishlist":
        return (
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E7E7E2" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        );
      case "search":
        return (
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E7E7E2" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        );
      default:
        return (
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E7E7E2" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        );
    }
  };

  return (
    <div style={containerStyle}>
      <div style={iconWrapperStyle}>{renderIcon()}</div>
      <h3 style={titleStyle}>{title}</h3>
      <p style={messageStyle}>{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} style={buttonStyle} className="hover-lift">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "60px 24px",
  textAlign: "center",
  maxWidth: "400px",
  margin: "0 auto"
};

const iconWrapperStyle = {
  marginBottom: "24px",
  padding: "24px",
  borderRadius: "50%",
  backgroundColor: "#FFFFFF",
};

const titleStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#1B1F8C",
  marginBottom: "10px"
};

const messageStyle = {
  fontSize: "15px",
  color: "#6B6B75",
  lineHeight: "1.5",
  marginBottom: "28px"
};

const buttonStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "24px",
  padding: "12px 28px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease"
};
