"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, width = "560px" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

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
        maxWidth: width,
        maxHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        animation: "adminScaleIn 0.25s ease-out",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid #E7E7E2",
          flexShrink: 0,
        }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#F7F7F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E7E7E2"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F7F7F2"; }}
          >
            <X size={18} color="#6B6B75" />
          </button>
        </div>
        {/* Body */}
        <div style={{
          padding: "24px",
          overflowY: "auto",
          flex: 1,
        }}>
          {children}
        </div>
      </div>
    </>
  );
}
