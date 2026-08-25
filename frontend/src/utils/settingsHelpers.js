/**
 * Central Store Settings & Configuration Helpers for Mellosoft
 * Single Global Source of Truth for Store Information, Website, Shipping & Payment
 */

export const SETTINGS_STORAGE_KEY = "mellosoft_settings";
export const SETTINGS_UPDATED_EVENT = "mellosoft_settings_updated";

export const DEFAULT_SETTINGS = {
  store: {
    name: "Mellosoft",
    email: "admin@mellosoft.in",
    phone: "+91 98765 43210",
    gstNumber: "07AABCM1234A1Z5",
    address: "42, MG Road, Bengaluru, Karnataka 560001"
  },
  website: {
    logo: "/asset/logo.png",
    banner: ""
  },
  shipping: {
    freeShippingAmount: 5000,
    shippingCharge: 150
  },
  payment: {
    razorpay: true,
    stripe: false,
    cod: true
  }
};

/**
 * Deep merge and normalize any stored settings with default schema
 */
export function normalizeSettings(raw) {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SETTINGS };

  // Handle both flat and nested schemas if legacy
  const store = {
    name: raw.store?.name || raw.storeName || DEFAULT_SETTINGS.store.name,
    email: raw.store?.email || raw.email || DEFAULT_SETTINGS.store.email,
    phone: raw.store?.phone || raw.phone || DEFAULT_SETTINGS.store.phone,
    gstNumber: raw.store?.gstNumber || raw.gst || DEFAULT_SETTINGS.store.gstNumber,
    address: raw.store?.address || raw.address || DEFAULT_SETTINGS.store.address
  };

  const website = {
    logo: raw.website?.logo || raw.logo || DEFAULT_SETTINGS.website.logo,
    banner: raw.website?.banner || raw.banner || DEFAULT_SETTINGS.website.banner
  };

  const shipping = {
    freeShippingAmount: Number(
      raw.shipping?.freeShippingAmount ?? raw.freeShippingAmount ?? DEFAULT_SETTINGS.shipping.freeShippingAmount
    ),
    shippingCharge: Number(
      raw.shipping?.shippingCharge ?? raw.shippingCharge ?? DEFAULT_SETTINGS.shipping.shippingCharge
    )
  };

  const payment = {
    razorpay: raw.payment?.razorpay !== undefined ? Boolean(raw.payment.razorpay) : (raw.razorpay !== undefined ? Boolean(raw.razorpay) : DEFAULT_SETTINGS.payment.razorpay),
    stripe: raw.payment?.stripe !== undefined ? Boolean(raw.payment.stripe) : (raw.stripe !== undefined ? Boolean(raw.stripe) : DEFAULT_SETTINGS.payment.stripe),
    cod: raw.payment?.cod !== undefined ? Boolean(raw.payment.cod) : (raw.cod !== undefined ? Boolean(raw.cod) : DEFAULT_SETTINGS.payment.cod)
  };

  return { store, website, shipping, payment };
}

/**
 * Get current settings from localStorage safely with fallback
 */
export function getSavedSettings() {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return normalizeSettings(parsed);
    }
  } catch (e) {
    console.error("Failed to load settings from storage:", e);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Save settings to localStorage and dispatch update events
 */
export function saveSettingsToStorage(newSettings) {
  if (typeof window === "undefined") return false;
  try {
    const normalized = normalizeSettings(newSettings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: normalized }));
    }, 0);
    return true;
  } catch (e) {
    console.error("Failed to save settings to storage:", e);
    return false;
  }
}

/**
 * Validate settings fields
 */
export function validateSettings(settings) {
  const errors = {};
  const s = settings?.store || {};

  if (!s.name || !s.name.trim()) {
    errors.storeName = "Store Name is required.";
  }

  if (!s.email || !s.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!s.phone || !s.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^[0-9+\-\s()]{8,20}$/.test(s.phone.trim())) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!s.address || !s.address.trim()) {
    errors.address = "Address is required.";
  }

  const ship = settings?.shipping || {};
  if (ship.freeShippingAmount !== undefined && isNaN(Number(ship.freeShippingAmount))) {
    errors.freeShippingAmount = "Free shipping threshold must be a valid number.";
  }
  if (ship.shippingCharge !== undefined && isNaN(Number(ship.shippingCharge))) {
    errors.shippingCharge = "Shipping charge must be a valid number.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Centralized Order Calculation Helper based on active Store Settings
 */
export function calculateOrderTotals(items = [], settings = DEFAULT_SETTINGS) {
  const safeItems = Array.isArray(items) ? items : [];

  const subtotal = safeItems.reduce((acc, item) => {
    const price = item.price || item.discountPrice || item.actualPrice || 0;
    const qty = item.qty || item.quantity || 1;
    return acc + price * qty;
  }, 0);

  const rawTotal = safeItems.reduce((acc, item) => {
    const actual = item.actualPrice || item.price || 0;
    const qty = item.qty || item.quantity || 1;
    return acc + actual * qty;
  }, 0);

  const discountSavings = Math.max(0, rawTotal - subtotal);
  const gstRate = 18; // 18% GST standard
  const tax = Math.round(subtotal * (gstRate / 100));

  const freeThreshold = Number(settings?.shipping?.freeShippingAmount ?? DEFAULT_SETTINGS.shipping.freeShippingAmount);
  const baseShippingCharge = Number(settings?.shipping?.shippingCharge ?? DEFAULT_SETTINGS.shipping.shippingCharge);

  const isFree = subtotal === 0 || subtotal >= freeThreshold;
  const shipping = isFree ? 0 : baseShippingCharge;
  const finalTotal = subtotal + tax + shipping;

  return {
    subtotal,
    rawTotal,
    discountSavings,
    gstRate,
    tax,
    shipping,
    isFreeShipping: isFree,
    freeShippingThreshold: freeThreshold,
    shippingCharge: baseShippingCharge,
    finalTotal
  };
}
