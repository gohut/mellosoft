"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "mellosoft_admin_authenticated";

// ─── Mock credentials — swap for a real API call in the future ───────────────
const MOCK_CREDENTIALS = {
  email: "admin@mellosoft.com",
  password: "Admin@123",
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AdminAuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // loading = true while we hydrate from localStorage (prevents flash)
  const [loading, setLoading] = useState(true);

  // Hydrate session from localStorage on first mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setIsAuthenticated(stored === "true");
    } catch {
      // localStorage unavailable (SSR / private browsing edge cases)
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * login(email, password)
   * Returns { success: true } on success, or { success: false, error: string }.
   *
   * Future: Replace the mock check with:
   *   const res = await fetch("/api/auth/login", { method:"POST", body: JSON.stringify({email,password}) });
   *   const { token } = await res.json();
   *   localStorage.setItem("mellosoft_admin_token", token);
   */
  const login = useCallback(async (email, password) => {
    // Simulate network latency for realistic UX
    await new Promise((r) => setTimeout(r, 800));

    if (
      email.trim().toLowerCase() === MOCK_CREDENTIALS.email &&
      password === MOCK_CREDENTIALS.password
    ) {
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // ignore — session will still work in-memory for this tab
      }
      setIsAuthenticated(true);
      return { success: true };
    }

    return { success: false, error: "Invalid email or password." };
  }, []);

  /**
   * logout()
   * Clears auth state and localStorage.
   *
   * Future: Also call POST /api/auth/logout to invalidate JWT on server.
   */
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, loading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return ctx;
}
