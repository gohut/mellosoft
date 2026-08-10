"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { DEFAULT_USERS } from "../data/usersData";
import { DEFAULT_ROLES } from "../data/rolesData";
import { verifyPassword } from "../utils/security";

const SESSION_KEY = "mellosoft_admin_session";
const CURRENT_USER_ID_KEY = "mellosoft_current_user_id";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate session from localStorage on mount
  useEffect(() => {
    try {
      const sessionToken = localStorage.getItem(SESSION_KEY);
      const storedUserId = localStorage.getItem(CURRENT_USER_ID_KEY);

      if (sessionToken && storedUserId) {
        setIsAuthenticated(true);
        setCurrentUserId(storedUserId);
      } else {
        setIsAuthenticated(false);
        setCurrentUserId(null);
      }
    } catch {
      setIsAuthenticated(false);
      setCurrentUserId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * login(email, password)
   * Authenticates user, checks status, and creates session.
   */
  const login = useCallback(async (email, password) => {
    // Simulate realistic network delay
    await new Promise((r) => setTimeout(r, 600));

    const emailTrimmed = email.trim().toLowerCase();

    // Read stored users from localStorage or default
    let usersList = DEFAULT_USERS;
    try {
      const savedUsers = localStorage.getItem("mellosoft_users");
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          usersList = parsed;
        }
      }
    } catch (e) {
      console.error("Failed to read users from storage during login:", e);
    }

    const user = usersList.find((u) => u.email.toLowerCase() === emailTrimmed);

    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    // Verify password hash
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password." };
    }

    // Check account status
    if (user.status !== "Active") {
      return {
        success: false,
        error: "Your account is inactive. Please contact the administrator.",
      };
    }

    // Create authenticated session
    const token = `ms_session_${Date.now()}_${user.id}`;
    try {
      localStorage.setItem(SESSION_KEY, token);
      localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
    } catch (e) {
      console.error("Failed to save session to localStorage:", e);
    }

    setCurrentUserId(user.id);
    setIsAuthenticated(true);

    return { success: true, user };
  }, []);

  /**
   * logout()
   * Clears auth session and storage.
   */
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(CURRENT_USER_ID_KEY);
    } catch {
      // ignore
    }
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

