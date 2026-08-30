"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { MOCK_CUSTOMERS } from "../admin/data/adminMockData";
import { normalizeCustomerId } from "../utils/customerHelpers";

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

  // Retrieve real registered customers list from storage (merged with mock customers)
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

    // Merge with MOCK_CUSTOMERS ensuring canonical IDs and savedAddresses
    const mergedMap = new Map();
    (MOCK_CUSTOMERS || []).forEach((mc) => {
      const canonicalId = normalizeCustomerId(mc.customerId || mc.id);
      mergedMap.set(mc.email.toLowerCase(), {
        ...mc,
        id: canonicalId,
        customerId: canonicalId,
      });
    });

    list.forEach((c) => {
      if (!c || !c.email) return;
      const key = c.email.toLowerCase();
      const canonicalId = normalizeCustomerId(c.customerId || c.id);
      const existing = mergedMap.get(key);
      mergedMap.set(key, {
        ...existing,
        ...c,
        id: canonicalId,
        customerId: canonicalId,
        savedAddresses: (c.savedAddresses && c.savedAddresses.length > 0)
          ? c.savedAddresses
          : (existing?.savedAddresses || []),
      });
    });

    return Array.from(mergedMap.values());
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

    const canonicalId = normalizeCustomerId(customer.customerId || customer.id);
    // Store customer session
    const customerSession = {
      ...customer,
      id: canonicalId,
      customerId: canonicalId,
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

    const nextIndex = customers.length + 1;
    const formattedCustId = `CUS-${String(nextIndex).padStart(4, "0")}`;
    const newCustomer = {
      id: formattedCustId,
      customerId: formattedCustId,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || "+91 98765 43210",
      status: "Active",
      avatar: trimmedName.charAt(0).toUpperCase(),
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toISOString(),
      savedAddresses: []
    };

    try {
      const saved = localStorage.getItem(CUSTOMERS_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      parsed.push(newCustomer);
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(parsed));
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(newCustomer));
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_customers_updated"));
        }, 0);
      }
    } catch (e) {
      console.error("Failed to save new customer to localStorage:", e);
    }

    setCurrentCustomer(newCustomer);
    setIsAuthenticated(true);

    return { success: true, customer: newCustomer };
  }, [getAllCustomers]);

  // Customer Google Login logic (handles first-time registration and returning logins)
  const loginWithGoogle = useCallback(async (googleProfile) => {
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
      // Returning Google user: reuse existing canonical customer record
      const canonicalId = normalizeCustomerId(existing.customerId || existing.id);
      customerSession = {
        ...existing,
        id: canonicalId,
        customerId: canonicalId,
        authProvider: existing.authProvider || "google",
        lastLogin: new Date().toISOString()
      };

      // Update in storage if needed
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
      // First-time Google user: create new canonical customer record
      const nextIndex = customers.length + 1;
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
      } catch (e) {
        console.error("Failed to save Google customer:", e);
      }
    }

    try {
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customerSession));
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_customers_updated"));
        }, 0);
      }
    } catch (e) {
      console.error("Failed to save Google customer session:", e);
    }

    setCurrentCustomer(customerSession);
    setIsAuthenticated(true);

    return { success: true, customer: customerSession };
  }, [getAllCustomers]);

  // Update profile logic — persists to customer record and fires admin sync
  const updateProfile = useCallback(async (updatedFields) => {
    if (!currentCustomer) return { success: false, error: "Not logged in" };

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

  // Add a new address to savedAddresses[]
  const addAddress = useCallback(async (address) => {
    if (!currentCustomer) return { success: false, error: "Not logged in" };

    const existingAddresses = currentCustomer.savedAddresses || [];
    const isFirst = existingAddresses.length === 0;
    const custId = currentCustomer.customerId || currentCustomer.id;
    const newAddress = {
      ...address,
      id: address.id || `addr-${Date.now()}`,
      customerId: custId,
      isDefault: isFirst ? true : (address.isDefault || false)
    };

    // If this is being set as default, unset others
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

  // Edit an existing address by id
  const editAddress = useCallback(async (id, updatedFields) => {
    if (!currentCustomer) return { success: false, error: "Not logged in" };

    const existingAddresses = currentCustomer.savedAddresses || [];
    const setAsDefault = updatedFields.isDefault === true;

    const updatedAddresses = existingAddresses.map((a) => {
      if (a.id === id) {
        return { ...a, ...updatedFields, id }; // preserve original id
      }
      // If setting new default, clear others
      return setAsDefault ? { ...a, isDefault: false } : a;
    });

    return updateProfile({ savedAddresses: updatedAddresses });
  }, [currentCustomer, updateProfile]);

  // Delete an address by id
  const deleteAddress = useCallback(async (id) => {
    if (!currentCustomer) return { success: false, error: "Not logged in" };

    const existingAddresses = currentCustomer.savedAddresses || [];
    const wasDefault = existingAddresses.find((a) => a.id === id)?.isDefault;
    let filtered = existingAddresses.filter((a) => a.id !== id);

    // If deleted address was default, promote first remaining
    if (wasDefault && filtered.length > 0) {
      filtered = [{ ...filtered[0], isDefault: true }, ...filtered.slice(1)];
    }

    return updateProfile({ savedAddresses: filtered });
  }, [currentCustomer, updateProfile]);

  // Set an address as the default
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

