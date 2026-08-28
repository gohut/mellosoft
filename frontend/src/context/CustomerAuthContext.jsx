"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const CUSTOMER_SESSION_KEY = "mellosoft_customer_session";
const CUSTOMER_TOKEN_KEY = "mellosoft_customer_token";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [intendedView, setIntendedView] = useState("home");
  const [authToken, setAuthToken] = useState(null);

  // Load session & verify JWT with backend on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const savedToken = typeof window !== "undefined" ? localStorage.getItem(CUSTOMER_TOKEN_KEY) : null;
        
        // Call /api/auth/me to check active JWT session
        const res = await fetch("/api/auth/me", {
          headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.customer) {
            setCurrentCustomer(data.customer);
            setIsAuthenticated(true);
            if (savedToken) setAuthToken(savedToken);
            localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(data.customer));
          }
        } else {
          // Fallback to local session if present
          const savedSession = localStorage.getItem(CUSTOMER_SESSION_KEY);
          if (savedSession) {
            const parsed = JSON.parse(savedSession);
            if (parsed && parsed.id) {
              setCurrentCustomer(parsed);
              setIsAuthenticated(true);
            }
          }
        }
      } catch (e) {
        console.warn("Failed to check auth state:", e);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  // Login action via backend API
  const login = useCallback(async (email, password) => {
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: "Please enter both email and password." };
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Invalid email or password." };
      }

      const customerObj = data.customer || data.user;
      const token = data.token;

      if (token) {
        localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
        setAuthToken(token);
      }

      if (customerObj) {
        localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customerObj));
        setCurrentCustomer(customerObj);
        setIsAuthenticated(true);
      }

      return { success: true, customer: customerObj, token };
    } catch (err) {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  // Signup action via backend API
  const signup = useCallback(async ({ name, email, password, phone }) => {
    const trimmedName = (name || "").trim();
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();
    const trimmedPhone = (phone || "").trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      return { success: false, error: "Please fill in all required fields." };
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password: trimmedPassword, phone: trimmedPhone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Signup failed. Please try again." };
      }

      const customerObj = data.customer;
      const token = data.token;

      if (token) {
        localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
        setAuthToken(token);
      }

      if (customerObj) {
        localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customerObj));
        setCurrentCustomer(customerObj);
        setIsAuthenticated(true);
      }

      return { success: true, customer: customerObj, token };
    } catch (err) {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  // Google OAuth Login Action
  const googleLogin = useCallback(async ({ credential, googleUser }) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential, googleUser }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Google authentication failed." };
      }

      const customerObj = data.customer;
      const token = data.token;

      if (token) {
        localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
        setAuthToken(token);
      }

      if (customerObj) {
        localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customerObj));
        setCurrentCustomer(customerObj);
        setIsAuthenticated(true);
      }

      return { success: true, customer: customerObj, token };
    } catch (err) {
      return { success: false, error: "Google authentication failed." };
    }
  }, []);

  // Update profile action via backend API
  const updateProfile = useCallback(async (updatedFields) => {
    if (!currentCustomer) return { success: false, error: "Not logged in" };

    try {
      const savedToken = typeof window !== "undefined" ? localStorage.getItem(CUSTOMER_TOKEN_KEY) : null;
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(savedToken ? { Authorization: `Bearer ${savedToken}` } : {}),
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await res.json();
      const updatedCustomer = {
        ...currentCustomer,
        ...updatedFields,
      };

      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(updatedCustomer));
      setCurrentCustomer(updatedCustomer);

      return { success: true, customer: updatedCustomer };
    } catch (e) {
      return { success: false, error: "Failed to update profile." };
    }
  }, [currentCustomer]);

  // Logout action
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}

    try {
      localStorage.removeItem(CUSTOMER_SESSION_KEY);
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    } catch (e) {}

    setCurrentCustomer(null);
    setIsAuthenticated(false);
    setAuthToken(null);
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{
        currentCustomer,
        isAuthenticated,
        loading,
        intendedView,
        setIntendedView,
        authToken,
        login,
        signup,
        googleLogin,
        updateProfile,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return ctx;
}
