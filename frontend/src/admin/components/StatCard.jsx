"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ icon: Icon, title, value, change, changeLabel }) {
  const isPositive = change >= 0;

  return (
    <div className="admin-card-hover" style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      padding: "24px",
      border: "1px solid #E7E7E2",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          backgroundColor: "#E8E9F8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={22} color="#1B1F8C" />
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "13px",
          fontWeight: 600,
          color: isPositive ? "#16A34A" : "#DC2626",
          backgroundColor: isPositive ? "#DCFCE7" : "#FEE2E2",
          padding: "4px 10px",
          borderRadius: "999px",
        }}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(change)}%
        </div>
      </div>
      <div>
        <p style={{ fontSize: "13px", color: "#6B6B75", marginBottom: "4px", fontWeight: 500 }}>{title}</p>
        <p style={{ fontSize: "28px", fontWeight: 800, color: "#14151A", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          {value}
        </p>
      </div>
      {changeLabel && (
        <p style={{ fontSize: "12px", color: "#6B6B75" }}>{changeLabel}</p>
      )}
    </div>
  );
}
