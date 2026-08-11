"use client";

import React from "react";

const statusConfig = {
  // Order statuses
  "Delivered": { bg: "#DCFCE7", color: "#15803D", dot: "#16A34A" },
  "Processing": { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
  "Pending": { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
  "Cancelled": { bg: "#FEE2E2", color: "#991B1B", dot: "#DC2626" },
  // Payment statuses
  "Paid": { bg: "#DCFCE7", color: "#15803D", dot: "#16A34A" },
  "Failed": { bg: "#FEE2E2", color: "#991B1B", dot: "#DC2626" },
  "Refunded": { bg: "#F3E8FF", color: "#6B21A8", dot: "#9333EA" },
  // Stock statuses
  "In Stock": { bg: "#DCFCE7", color: "#15803D", dot: "#16A34A" },
  "Low Stock": { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
  "Out of Stock": { bg: "#FEE2E2", color: "#991B1B", dot: "#DC2626" },
  // General statuses
  "Active": { bg: "#DCFCE7", color: "#15803D", dot: "#16A34A" },
  "Inactive": { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  "Expired": { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  "Approved": { bg: "#DCFCE7", color: "#15803D", dot: "#16A34A" },
  "Rejected": { bg: "#FEE2E2", color: "#991B1B", dot: "#DC2626" },
  "Draft": { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
};

const defaultConfig = { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" };

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || defaultConfig;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
      backgroundColor: config.bg,
      color: config.color,
      lineHeight: "1.4",
      whiteSpace: "nowrap",
    }}>
      <span style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: config.dot,
        flexShrink: 0,
      }} />
      {status}
    </span>
  );
}
