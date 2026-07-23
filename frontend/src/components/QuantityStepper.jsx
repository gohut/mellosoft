import React from "react";

export default function QuantityStepper({ qty = 1, onChange }) {
  const handleDecrement = () => {
    if (qty > 1) {
      onChange(qty - 1);
    }
  };

  const handleIncrement = () => {
    onChange(qty + 1);
  };

  return (
    <div style={stepperStyle}>
      <button 
        onClick={handleDecrement} 
        style={{ ...buttonStyle, cursor: qty <= 1 ? "not-allowed" : "pointer", opacity: qty <= 1 ? 0.4 : 1 }}
        disabled={qty <= 1}
        aria-label="Decrease quantity"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <span style={numberStyle}>{qty}</span>
      <button 
        onClick={handleIncrement} 
        style={buttonStyle}
        aria-label="Increase quantity"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

const stepperStyle = {
  display: "inline-flex",
  alignItems: "center",
  border: "1px solid #E7E7E2",
  borderRadius: "16px",
  backgroundColor: "#FFFFFF",
  padding: "4px",
  minWidth: "100px",
  justifyContent: "space-between"
};

const buttonStyle = {
  border: "none",
  background: "none",
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#1B1F8C",
  transition: "background-color 0.2s ease",
  outline: "none"
};

const numberStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#14151A",
  minWidth: "20px",
  textAlign: "center",
  userSelect: "none"
};
