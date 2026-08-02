"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items }) {
  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      color: "#6B6B75",
    }}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={14} color="#6B6B75" style={{ flexShrink: 0 }} />}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              style={{
                background: "none",
                border: "none",
                color: "#6B6B75",
                fontSize: "13px",
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => { e.target.style.color = "#1B1F8C"; }}
              onMouseLeave={(e) => { e.target.style.color = "#6B6B75"; }}
            >
              {item.label}
            </button>
          ) : (
            <span style={{ color: "#14151A", fontWeight: 600 }}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
