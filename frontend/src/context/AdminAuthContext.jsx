"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { DEFAULT_USERS } from "../data/usersData";
import { verifyPassword } from "../utils/security";

const SESSION_KEY = "mellosoft_admin_session";
const CURRENT_USER_ID_KEY = "mellosoft_current_user_id";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate session strictly from server session endpoint
  useEffect(() => {
    let isMounted = true;
    async function checkAdminSession() {
      try {
        const res = await fetch("/api/auth/session?type=admin");
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.authenticated && (data.user || data.adminUser || data.admin)) {
            const adminData = data.user || data.adminUser || data.admin;
            if (isMounted) {
              setIsAuthenticated(true);
              setCurrentUserId(adminData.id);
              try {
                localStorage.setItem(SESSION_KEY, `session_${adminData.id}`);
                localStorage.setItem(CURRENT_USER_ID_KEY, adminData.id);
              } catch {}
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Admin session verification network error:", err);
      }

      // If server session check fails or is unauthenticated, invalidate client auth state
      if (isMounted) {
        try {
          localStorage.removeItem(SESSION_KEY);
          localStorage.removeItem(CURRENT_USER_ID_KEY);
        } catch {}
        setIsAuthenticated(false);
        setCurrentUserId(null);
        setLoading(false);
      }
    }

    checkAdminSession();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * login(email, password)
   * Authenticates administrative user via /api/auth/login API.
   */
  const login = useCallback(async (email, password) => {
    const emailTrimmed = email.trim().toLowerCase();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrimmed, password, isAdmin: true }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        try {
          localStorage.setItem(SESSION_KEY, data.token || `ms_session_${Date.now()}`);
          localStorage.setItem(CURRENT_USER_ID_KEY, data.user.id);
        } catch (e) {
          console.error("Failed to save session to localStorage:", e);
        }

        setCurrentUserId(data.user.id);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      }

      return { success: false, error: data?.error || "Invalid administrative credentials." };
    } catch (e) {
      console.error("Administrative login error:", e);
      return { success: false, error: "Network error during administrative login." };
    }
  }, []);

  /**
   * logout()
   * Clears auth session on server and client storage.
   */
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout?type=admin", { method: "POST" });
    } catch {}

    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(CURRENT_USER_ID_KEY);
    } catch {}
    setIsAuthenticated(false);
    setCurrentUserId(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        currentUserId,
        loading,
        login,
        logout,
        setCurrentUserId,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return ctx;
}
