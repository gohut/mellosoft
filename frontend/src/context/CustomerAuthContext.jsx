"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { normalizeCustomerId } from "../utils/customerHelpers";

const CUSTOMER_SESSION_KEY = "mellosoft_customer_session";
const CUSTOMERS_KEY = "mellosoft_customers";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [intendedView, setIntendedView] = useState("home");

  // Hydrate session strictly from server session endpoint
  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session?type=customer", { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.authenticated && data.customer) {
            if (isMounted) {
              const cust = {
                ...data.customer,
                id: normalizeCustomerId(data.customer.customerId || data.customer.id),
                customerId: normalizeCustomerId(data.customer.customerId || data.customer.id),
                savedAddresses: data.customer.savedAddresses || data.customer.addresses || []
              };
              setCurrentCustomer(cust);
              setIsAuthenticated(true);
              try {
                localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(cust));
              } catch {}
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Customer session verification network error:", err);
      }

      // If server session check fails or is unauthenticated, invalidate client auth state
      if (isMounted) {
        try {
          localStorage.removeItem(CUSTOMER_SESSION_KEY);
        } catch {}
        setCurrentCustomer(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    }

    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Retrieve registered customers list from storage (excluding obsolete demo accounts)
  const getAllCustomers = useCallback(() => {
    let list = [];
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CUSTOMERS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            list = parsed;
          }
        }
      } catch (e) {
        console.error("Failed to read customers from storage:", e);
      }
    }

    const demoIds = new Set([
      "C001", "C002", "C003", "C004", "C005", "C006", "C007", "C008"
    ]);
    const demoEmails = new Set([
      "rahul@example.com", "priya@example.com", "ankit@example.com", "sneha@example.com",
      "vikram@example.com", "meera@example.com", "arjun@example.com", "kavitha@example.com"
    ]);

    const cleanMap = new Map();
    list.forEach((c) => {
      if (!c || !c.email) return;
      const key = c.email.toLowerCase();
      const canonicalId = normalizeCustomerId(c.customerId || c.id);
      if (demoIds.has(canonicalId) || demoEmails.has(key)) return;
      cleanMap.set(key, {
        ...c,
        id: canonicalId,
        customerId: canonicalId,
        savedAddresses: c.savedAddresses || []
      });
    });

    return Array.from(cleanMap.values());
  }, []);

  // Customer Login logic
  const login = useCallback(async (email, password) => {
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: "Please enter both email and password." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword })
      });
      const data = await res.json();
      if (res.ok && data.success && (data.customer || data.user)) {
        const rawCust = data.customer || data.user;
        const canonicalId = normalizeCustomerId(rawCust.customerId || rawCust.id);
        const customerSession = {
          ...rawCust,
          id: canonicalId,
          customerId: canonicalId,
          savedAddresses: rawCust.savedAddresses || rawCust.addresses || [],
          lastLogin: new Date().toISOString()
        };
        try {
          localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customerSession));
        } catch (e) {}

        setCurrentCustomer(customerSession);
        setIsAuthenticated(true);
        return { success: true, customer: customerSession };
      }

      return { success: false, error: data?.error || "Invalid email or password." };
    } catch (err) {
      console.error("Customer login error:", err);
      return { success: false, error: "Network error during login. Please try again." };
    }
  }, []);

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

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
          phone: trimmedPhone
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.customer) {
        const canonicalId = normalizeCustomerId(data.customer.customerId || data.customer.id);
        const customerSession = {
          ...data.customer,
          id: canonicalId,
          customerId: canonicalId,
          savedAddresses: data.customer.savedAddresses || data.customer.addresses || [],
          lastLogin: new Date().toISOString()
        };
        try {
          localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customerSession));
        } catch (e) {}

        setCurrentCustomer(customerSession);
        setIsAuthenticated(true);
        return { success: true, customer: customerSession };
      }

      return { success: false, error: data?.error || "Registration failed." };
    } catch (err) {
      console.error("Customer registration error:", err);
      return { success: false, error: "Network error during registration. Please try again." };
    }
  }, []);

  // Customer Google Login logic
  const loginWithGoogle = useCallback(async (googleProfile) => {
    // 1. If real Google credential provided, authenticate via /api/auth/google
    if (googleProfile?.credential) {
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: googleProfile.credential }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.customer) {
          const canonicalId = normalizeCustomerId(data.customer.id || data.customer.customerId);
          const customerSession = {
            ...data.customer,
            id: canonicalId,
            customerId: canonicalId,
            authProvider: "google",
            lastLogin: new Date().toISOString(),
          };
          try {
            localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customerSession));
            if (typeof window !== "undefined") {
              setTimeout(() => {
                window.dispatchEvent(new Event("storage"));
                window.dispatchEvent(new CustomEvent("mellosoft_customers_updated"));
              }, 0);
            }
          } catch {}
          setCurrentCustomer(customerSession);
          setIsAuthenticated(true);
          return { success: true, customer: customerSession };
        } else if (data?.error) {
          return { success: false, error: data.error };
        }
      } catch (e) {
        console.warn("Failed to contact /api/auth/google:", e);
      }
    }

    const email = (googleProfile?.email || "").trim().toLowerCase();
    const name = (googleProfile?.name || "").trim() || email.split("@")[0] || "Google User";
    const avatar = googleProfile?.avatar || googleProfile?.picture || name.charAt(0).toUpperCase();

    if (!email) {
      return { success: false, error: "Google account does not have a valid email address." };
    }

    const customers = getAllCustomers();
    const existing = customers.find(
      (c) => (c.email || "").toLowerCase() === email
    );

    let customerSession;
    if (existing) {
      const canonicalId = normalizeCustomerId(existing.customerId || existing.id);
      customerSession = {
        ...existing,
        id: canonicalId,
        customerId: canonicalId,
        authProvider: existing.authProvider || "google",
        lastLogin: new Date().toISOString()
      };

      try {
        const saved = localStorage.getItem(CUSTOMERS_KEY);
        let list = saved ? JSON.parse(saved) : [];
        if (Array.isArray(list)) {
          const idx = list.findIndex((c) => (c.email || "").toLowerCase() === email);
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...customerSession };
            localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(list));
          }
        }
      } catch {}
    } else {
      let maxIdNum = 0;
      customers.forEach((c) => {
        const match = (c.customerId || c.id || "").match(/CUS-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
        }
      });
      const nextIndex = maxIdNum > 0 ? maxIdNum + 1 : customers.length + 1;
      const formattedCustId = `CUS-${String(nextIndex).padStart(4, "0")}`;
      customerSession = {
        id: formattedCustId,
        customerId: formattedCustId,
        name: name,
        email: email,
        phone: "",
        status: "Active",
        authProvider: "google",
        avatar: avatar,
        createdAt: new Date().toISOString().split("T")[0],
        lastLogin: new Date().toISOString(),
        savedAddresses: []
      };

      try {
        const saved = localStorage.getItem(CUSTOMERS_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        parsed.push(customerSession);
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(parsed));
      } catch (e) {}
    }

    try {
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customerSession));
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_customers_updated"));
        }, 0);
      }
    } catch (e) {}

    setCurrentCustomer(customerSession);
    setIsAuthenticated(true);

    return { success: true, customer: customerSession };
  }, [getAllCustomers]);

  // Update profile logic
  const updateProfile = useCallback(async (updatedFields) => {
    if (!currentCustomer) return { success: false, error: "Not logged in" };

    // 1. Try server API update
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.customer) {
          const updated = {
            ...currentCustomer,
            ...data.customer,
            updatedAt: new Date().toISOString()
          };
          setCurrentCustomer(updated);
          try {
            localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(updated));
          } catch {}
          return { success: true, customer: updated };
        }
      }
    } catch (err) {}

    // 2. Client fallback
    const updatedCustomer = {
      ...currentCustomer,
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };

    try {
      const saved = localStorage.getItem(CUSTOMERS_KEY);
      let list = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(list)) list = [];

      const idx = list.findIndex((c) => c.id === currentCustomer.id || c.email?.toLowerCase() === currentCustomer.email?.toLowerCase());
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...updatedCustomer };
      } else {
        list.push(updatedCustomer);
      }

      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(list));
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(updatedCustomer));

      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_customers_updated"));
        }, 0);
      }
    } catch (e) {
      console.error("Failed to update customer profile:", e);
      return { success: false, error: "Unable to update profile. Please try again." };
    }

    setCurrentCustomer(updatedCustomer);
    return { success: true, customer: updatedCustomer };
  }, [currentCustomer]);

  // Address CRUD
  const addAddress = useCallback(async (address) => {
    if (!currentCustomer) return { success: false, error: "Not logged in" };

    // 1. Try server API address creation
    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.address) {
          const existingAddresses = currentCustomer.savedAddresses || [];
          const updatedAddresses = [...existingAddresses, data.address];
          return updateProfile({ savedAddresses: updatedAddresses });
        }
      }
    } catch (err) {}

    // 2. Fallback
    const existingAddresses = currentCustomer.savedAddresses || [];
    const isFirst = existingAddresses.length === 0;
    const custId = currentCustomer.customerId || currentCustomer.id;
    const newAddress = {
      ...address,
      id: address.id || `addr-${Date.now()}`,
      customerId: custId,
      isDefault: isFirst ? true : (address.isDefault || false)
    };

    let updatedAddresses;
    if (newAddress.isDefault) {
      updatedAddresses = [
        ...existingAddresses.map((a) => ({ ...a, isDefault: false })),
        newAddress
      ];
    } else {
      updatedAddresses = [...existingAddresses, newAddress];
    }

    return updateProfile({ savedAddresses: updatedAddresses });
  }, [currentCustomer, updateProfile]);

  const editAddress = useCallback(async (id, updatedFields) => {
    if (!currentCustomer) return { success: false, error: "Not logged in" };

    try {
      await fetch(`/api/customer/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {}

    const existingAddresses = currentCustomer.savedAddresses || [];
    const setAsDefault = updatedFields.isDefault === true;

    const updatedAddresses = existingAddresses.map((a) => {
      if (a.id === id) {
        return { ...a, ...updatedFields, id };
      }
      return setAsDefault ? { ...a, isDefault: false } : a;
    });

    return updateProfile({ savedAddresses: updatedAddresses });
  }, [currentCustomer, updateProfile]);

  const deleteAddress = useCallback(async (id) => {
    if (!currentCustomer) return { success: false, error: "Not logged in" };

    try {
      await fetch(`/api/customer/addresses/${id}`, {
        method: "DELETE"
      });
    } catch (err) {}

    const existingAddresses = currentCustomer.savedAddresses || [];
    const wasDefault = existingAddresses.find((a) => a.id === id)?.isDefault;
    let filtered = existingAddresses.filter((a) => a.id !== id);

    if (wasDefault && filtered.length > 0) {
      filtered = [{ ...filtered[0], isDefault: true }, ...filtered.slice(1)];
    }

    return updateProfile({ savedAddresses: filtered });
  }, [currentCustomer, updateProfile]);

  const setDefaultAddress = useCallback(async (id) => {
    if (!currentCustomer) return { success: false, error: "Not logged in" };

    const existingAddresses = currentCustomer.savedAddresses || [];
    const updatedAddresses = existingAddresses.map((a) => ({
      ...a,
      isDefault: a.id === id
    }));

    return updateProfile({ savedAddresses: updatedAddresses });
  }, [currentCustomer, updateProfile]);

  // Logout logic
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout?type=customer", { method: "POST" });
    } catch (e) {}

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
        loginWithGoogle,
        updateProfile,
        addAddress,
        editAddress,
        deleteAddress,
        setDefaultAddress,
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
