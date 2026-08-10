"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  confirmColor = "#DC2626",
}) {
  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Render via portal so no parent container affects positioning
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // No backdrop — transparent
        backgroundColor: "transparent",
        pointerEvents: "none",
      }}
    >
      {/* Modal card — re-enable pointer events for the card itself */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          pointerEvents: "all",
          width: "min(90vw, 420px)",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10)",
          padding: "32px",
          textAlign: "center",
          animation: "adminScaleIn 0.25s ease-out",
          position: "relative",
        }}
      >
        {/* Warning icon */}
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

        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", marginBottom: "8px" }}>
          {title}
        </h3>
        <p style={{ fontSize: "14px", color: "#6B6B75", lineHeight: 1.6, marginBottom: "28px" }}>
          {message}
        </p>

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
              transition: "background-color 0.15s ease",
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
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
