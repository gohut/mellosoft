"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = "Are you sure?", message = "This action cannot be undone.", confirmLabel = "Delete", confirmColor = "#DC2626" }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="admin-overlay" onClick={onClose} />
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        width: "90%",
        maxWidth: "420px",
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        padding: "32px",
        textAlign: "center",
        animation: "adminScaleIn 0.25s ease-out",
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#FEE2E2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <AlertTriangle size={28} color="#DC2626" />
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", marginBottom: "8px" }}>{title}</h3>
        <p style={{ fontSize: "14px", color: "#6B6B75", lineHeight: 1.6, marginBottom: "28px" }}>{message}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={onClose}
            style={{
              height: "42px",
              padding: "0 24px",
              border: "1px solid #E7E7E2",
              borderRadius: "10px",
              backgroundColor: "#FFFFFF",
              color: "#14151A",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F7F2"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            style={{
              height: "42px",
              padding: "0 24px",
              border: "none",
              borderRadius: "10px",
              backgroundColor: confirmColor,
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
