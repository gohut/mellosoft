import React from "react";

export default function FirmnessSizeSelector({ label, options, selected, onChange }) {
  if (!options || options.length <= 1) return null;

  return (
    <div style={containerStyle}>
      <span style={labelStyle}>{label}</span>
      <div style={optionsGridStyle}>
        {options.map((option) => {
          const isActive = selected === option;
          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              style={{
                ...chipStyle,
                backgroundColor: isActive ? "#1B1F8C" : "#FFFFFF",
                color: isActive ? "#FFFFFF" : "#14151A",
                borderColor: isActive ? "#1B1F8C" : "#E7E7E2"
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginBottom: "16px"
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#6B6B75"
};

const optionsGridStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px"
};

const chipStyle = {
  padding: "10px 18px",
  borderRadius: "20px",
  border: "1px solid",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
};
