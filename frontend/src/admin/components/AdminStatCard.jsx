"use client";

import React from "react";

/**
 * AdminStatCard — Reusable summary statistic card matching the Homepage Layout / Content styling.
 * 
 * Props:
 * - title: string (e.g. "Total Customers")
 * - value: string | number (e.g. 9 or "₹42,580")
 * - subtitle: string (e.g. "Registered customers")
 * - tone: "default" | "success" | "danger" | "warning" | "primary" (controls number color)
 * - style: optional custom inline style overrides
 */
export default function AdminStatCard({
  title,
  value,
  subtitle,
  tone = "default",
  style = {},
}) {
  const valueColor = (() => {
    switch (tone) {
      case "success":
        return "#16A34A";
      case "danger":
        return "#DC2626";
      case "warning":
        return "#D97706";
      case "primary":
        return "#1B1F8C";
      case "teal":
        return "#0D9488";
      case "default":
      default:
        return "#14151A";
    }
  })();

  return (
    <div
      className="admin-stat-card"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E7E7E2",
        borderRadius: "14px",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
        minWidth: 0,
        ...style,
      }}
    >
      <span
        style={{
          fontSize: "12.5px",
          fontWeight: 700,
          color: "#6B6B75",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </span>
      <strong
        style={{
          fontSize: "24px",
          fontWeight: 800,
          color: valueColor,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          margin: "2px 0",
        }}
      >
        {value}
      </strong>
      {subtitle && (
        <span
          style={{
            fontSize: "11.5px",
            color: "#9CA3AF",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}
