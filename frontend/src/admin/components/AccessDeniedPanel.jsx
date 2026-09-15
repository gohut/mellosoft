"use client";

import React from "react";
import { useAdmin } from "../context/AdminContext";

export default function AccessDeniedPanel({ moduleName, onBack }) {
  const { getFirstAllowedAdminView, navigateTo } = useAdmin();
  const firstAllowedRoute = getFirstAllowedAdminView ? getFirstAllowedAdminView() : "dashboard";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigateTo(firstAllowedRoute);
    }
  };

  return (
    <div
      className="admin-fade-in"
      style={{
        padding: "64px 24px",
        textAlign: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid #E7E7E2",
        marginTop: "24px",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "#FEE2E2",
          color: "#DC2626",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#14151A", margin: 0 }}>
        Access Denied
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: "#6B6B75",
          margin: "8px 0 24px",
          maxWidth: "440px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        You don&apos;t have permission to access {moduleName ? `the ${moduleName}` : "this"} page. Contact your Super Admin for access.
      </p>
      <button
        onClick={handleBack}
        style={{
          height: "40px",
          padding: "0 20px",
          backgroundColor: "#1B1F8C",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "10px",
          fontWeight: 600,
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        Go to Accessible Section
      </button>
    </div>
  );
}
