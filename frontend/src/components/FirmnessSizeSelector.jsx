import React from "react";

export default function FirmnessSizeSelector({ label, options, selected, onChange, className = "" }) {
  if (!options || options.length === 0) return null;

  return (
    <div style={containerStyle} className={`detail-option-control ${className}`}>
      <span style={labelStyle}>{label}</span>
      <select
        value={selected}
        onChange={(event) => onChange(event.target.value)}
        style={selectStyle}
        className="detail-option-select"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div style={optionsGridStyle} className="detail-option-chips">
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

const selectStyle = {
  display: "none",
  width: "100%",
  height: "42px",
  border: "1px solid #E7E7E2",
  borderRadius: "14px",
  backgroundColor: "#FFFFFF",
  color: "#14151A",
  fontSize: "13px",
  fontWeight: "600",
  padding: "0 30px 0 10px"
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
