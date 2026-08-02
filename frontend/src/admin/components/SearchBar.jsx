"use client";

import React from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search...", style }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <Search
        size={18}
        color="#6B6B75"
        style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: "42px",
          border: "1px solid #E7E7E2",
          borderRadius: "10px",
          padding: "0 38px 0 42px",
          fontSize: "14px",
          fontFamily: "inherit",
          color: "#14151A",
          backgroundColor: "#FFFFFF",
          outline: "none",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#1B1F8C";
          e.target.style.boxShadow = "0 0 0 3px rgba(27,31,140,0.08)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#E7E7E2";
          e.target.style.boxShadow = "none";
        }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            borderRadius: "50%",
          }}
        >
          <X size={16} color="#6B6B75" />
        </button>
      )}
    </div>
  );
}
