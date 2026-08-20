"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { MOCK_CUSTOMERS } from "../admin/data/adminMockData";

const CUSTOMER_SESSION_KEY = "mellosoft_customer_session";
const CUSTOMERS_KEY = "mellosoft_customers";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [intendedView, setIntendedView] = useState("home");

  // Hydrate session safely after mount to prevent Next.js hydration mismatches
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(CUSTOMER_SESSION_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.id) {
          setCurrentCustomer(parsed);
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.error("Failed to load customer session from localStorage:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Retrieve combined customers list (stored + default mock customers)
  const getAllCustomers = useCallback(() => {
    let list = [...MOCK_CUSTOMERS];
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CUSTOMERS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingEmails = new Set(list.map((c) => c.email.toLowerCase()));
            parsed.forEach((c) => {
              if (c && c.email && !existingEmails.has(c.email.toLowerCase())) {
                list.push(c);
              }
            });
          }
        }
      } catch (e) {
        console.error("Failed to read customers from storage:", e);
      }
    }
    return list;
  }, []);

  // Customer Login logic
  const login = useCallback(async (email, password) => {
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: "Please enter both email and password." };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const customers = getAllCustomers();
    const customer = customers.find(
      (c) => (c.email || "").toLowerCase() === trimmedEmail
    );

    if (!customer) {
      return { success: false, error: "Invalid email or password." };
    }

    // Store customer session
    const customerSession = {
      ...customer,
      lastLogin: new Date().toISOString()
    };

    try {
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customerSession));
    } catch (e) {
      console.error("Failed to save customer session:", e);
    }

    setCurrentCustomer(customerSession);
    setIsAuthenticated(true);

    return { success: true, customer: customerSession };
  }, [getAllCustomers]);

  // Customer Signup logic
  const signup = useCallback(async ({ name, email, password, phone }) => {
    const trimmedName = (name || "").trim();
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();
    const trimmedPhone = (phone || "").trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      return { success: false, error: "Please fill in all required fields." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const customers = getAllCustomers();
    const exists = customers.some(
      (c) => (c.email || "").toLowerCase() === trimmedEmail
    );

    if (exists) {
      return { success: false, error: "An account with this email already exists." };
    }

    const newId = `C${String(customers.length + 1).padStart(3, "0")}`;
    const newCustomer = {
      id: newId,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || "+91 98765 43210",
      status: "Active",
      avatar: trimmedName.charAt(0).toUpperCase(),
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toISOString()
    };

    try {
      const saved = localStorage.getItem(CUSTOMERS_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      parsed.push(newCustomer);
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(parsed));
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(newCustomer));
    } catch (e) {
      console.error("Failed to save new customer to localStorage:", e);
    }

    setCurrentCustomer(newCustomer);
    setIsAuthenticated(true);

    return { success: true, customer: newCustomer };
  }, [getAllCustomers]);

  // Logout logic
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(CUSTOMER_SESSION_KEY);
    } catch (e) {
      console.error("Failed to clear customer session:", e);
    }
    setCurrentCustomer(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{
        currentCustomer,
        isAuthenticated,
        loading,
        intendedView,
        setIntendedView,
        login,
        signup,
        logout
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
