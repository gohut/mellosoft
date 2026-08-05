"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../context/AdminAuthContext";

/**
 * ProtectedRoute
 *
 * Wraps any admin page that requires authentication.
 * - While loading (hydrating from localStorage): shows a full-screen spinner
 *   so no protected content is ever flashed to unauthenticated users.
 * - If not authenticated: redirects to /admin/login immediately.
 * - If authenticated: renders children normally.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, loading, router]);

  // ── Full-screen loading shield ───────────────────────────────────────────
  if (loading) {
    return (
      <div style={shieldStyle}>
        <div style={spinnerWrapStyle}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            style={{ animation: "protectedRouteSpin 0.9s linear infinite" }}
          >
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="#E8E9F8"
              strokeWidth="4"
            />
            <path
              d="M20 4 A16 16 0 0 1 36 20"
              stroke="#1B1F8C"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <span style={{ fontSize: "13px", color: "#6B6B75", marginTop: "12px", fontFamily: "Inter, sans-serif" }}>
            Loading…
          </span>
        </div>
        <style>{`
          @keyframes protectedRouteSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ── Not authenticated — nothing to render (redirect in progress) ─────────
  if (!isAuthenticated) {
    return null;
  }

  // ── Authenticated ─────────────────────────────────────────────────────────
  return <>{children}</>;
}

const shieldStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "#F7F7F2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const spinnerWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4px",
};
