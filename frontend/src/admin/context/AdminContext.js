"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { MOCK_PRODUCTS } from "../../data/products";
import { MOCK_CATEGORIES, MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_WISHLISTS, MOCK_CARTS, MOCK_REVIEWS, MOCK_BANNERS } from "../data/adminMockData";
import { DEFAULT_ROLES } from "../../data/rolesData";
import { DEFAULT_USERS } from "../../data/usersData";
import { hashPassword, checkPermission } from "../../utils/security";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { buildInitialTrackingHistory } from "../../utils/trackingHelpers";
import { getProductPrimaryImage, getDeletedProductIds, saveDeletedProductId, isProductDeleted, isSameProduct, ensureRequiredCategories, getMainCategoryProductCount, getSubcategoryProductCount } from "../../utils/productHelpers";
import { migrateProductsBase64, migrateReviewsBase64 } from "../../utils/imageStorage";
import { getSavedSettings, saveSettingsToStorage, normalizeSettings, SETTINGS_UPDATED_EVENT } from "../../utils/settingsHelpers";
import { normalizeCustomerId } from "../../utils/customerHelpers";

const AdminContext = createContext();

export function getFirstAllowedAdminView(role) {
  if (!role) return "dashboard";
  if (checkPermission(role, "dashboard", "view")) return "dashboard";
  if (checkPermission(role, "products", "view")) return "products";
  if (checkPermission(role, "orders", "view")) return "orders";
  if (checkPermission(role, "customers", "view")) return "customers";
  if (checkPermission(role, "reviews", "view")) return "reviews";
  if (checkPermission(role, "content", "view")) return "content";
  if (checkPermission(role, "users", "view") || checkPermission(role, "roles", "view")) return "users-roles";
  if (checkPermission(role, "settings", "view")) return "settings";
  return "dashboard";
}

const PRODUCTS_STORAGE_KEY = "mellosoft_products";
const CATEGORIES_STORAGE_KEY = "mellosoft_categories";
const USERS_STORAGE_KEY = "mellosoft_users";
const ROLES_STORAGE_KEY = "mellosoft_roles";
const ORDERS_STORAGE_KEY = "mellosoft_orders";
const CUSTOMERS_STORAGE_KEY = "mellosoft_customers";
const WISHLISTS_STORAGE_KEY = "mellosoft_wishlists";
const CARTS_STORAGE_KEY = "mellosoft_admin_carts";
const REVIEWS_STORAGE_KEY = "mellosoft_reviews";
const BANNERS_STORAGE_KEY = "mellosoft_banners";
const HOMEPAGE_CONFIG_KEY = "mellosoft_homepage_config";
const BANNER_TYPES_STORAGE_KEY = "mellosoft_banner_types";
const NOTIFICATIONS_STORAGE_KEY = "mellosoft_admin_notifications";
const ORDERS_RESET_KEY = "mellosoft_orders_reset_v1";
const CUSTOMER_CLEANUP_KEY = "mellosoft_customer_cleanup_v1";
const REVIEW_CLEANUP_KEY = "mellosoft_review_cleanup_v1";
const HOME_LAYOUT_CLEANUP_KEY = "mellosoft_home_layout_cleanup_v1";

// One-time safe reset and cleanup migrations
if (typeof window !== "undefined") {
  try {
    const isReset = localStorage.getItem(ORDERS_RESET_KEY);
    if (isReset !== "completed") {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem("mellosoft_admin_orders", JSON.stringify([]));
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(ORDERS_RESET_KEY, "completed");
    }

    // Customer cleanup migration (removes demo seeded customers)
    if (localStorage.getItem(CUSTOMER_CLEANUP_KEY) !== "completed") {
      const savedCusts = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      const currentOrders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "[]");
      const currentSession = JSON.parse(localStorage.getItem("mellosoft_customer_session") || "null");

      let existing = savedCusts ? JSON.parse(savedCusts) : [];
      if (!Array.isArray(existing)) existing = [];

      const demoCustomerIds = new Set(["C001", "C002", "C003", "C004", "C005", "C006", "C007", "C008", "CUS-0001", "CUS-0002", "CUS-0003", "CUS-0004", "CUS-0005", "CUS-0006", "CUS-0007", "CUS-0008"]);
      const demoEmails = new Set([
        "rahul@example.com", "priya@example.com", "ankit@example.com", "sneha@example.com",
        "vikram@example.com", "meera@example.com", "arjun@example.com", "kavitha@example.com"
      ]);

      const realCustomers = existing.filter((c) => {
        if (!c) return false;
        const hasOrder = currentOrders.some((o) =>
          (o.customerId && (o.customerId === c.id || o.customerId === c.customerId)) ||
          (o.userId && (o.userId === c.id || o.userId === c.customerId)) ||
          (o.email && c.email && o.email.toLowerCase() === c.email.toLowerCase())
        );
        const isCurrentSession = currentSession && (currentSession.id === c.id || (currentSession.email && c.email && currentSession.email.toLowerCase() === c.email.toLowerCase()));
        const isCustomAccount = c.isRegistered || Boolean(c.password) || Boolean(c.passwordHash) || (!demoCustomerIds.has(c.id) && !demoCustomerIds.has(c.customerId) && !demoEmails.has(c.email?.toLowerCase()));
        return hasOrder || isCurrentSession || isCustomAccount;
      });

      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(realCustomers));
      localStorage.setItem(CUSTOMER_CLEANUP_KEY, "completed");
    }

    // Review cleanup migration (removes demo reviews)
    if (localStorage.getItem(REVIEW_CLEANUP_KEY) !== "completed") {
      const savedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
      let existingRev = savedReviews ? JSON.parse(savedReviews) : [];
      if (!Array.isArray(existingRev)) existingRev = [];

      const demoReviewIds = new Set(["RV001", "RV002", "RV003", "RV004", "RV005", "RV006", "RV007"]);
      const demoAuthors = new Set(["Helen M.", "Michael F.", "Diana C.", "Gregory P.", "Laura W.", "Tyler F.", "Anonymous"]);

      const realReviews = existingRev.filter((r) => {
        if (!r) return false;
        if (demoReviewIds.has(r.id)) return false;
        const authorName = r.customer || r.customerName || r.author || "";
        if (demoAuthors.has(authorName) && !r.isReal && !r.orderId) return false;
        return true;
      });

      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(realReviews));
      localStorage.setItem(REVIEW_CLEANUP_KEY, "completed");
    }

    // Home layout cleanup migration (removes about-us from saved layout)
    if (localStorage.getItem(HOME_LAYOUT_CLEANUP_KEY) !== "completed") {
      const savedConfig = localStorage.getItem(HOMEPAGE_CONFIG_KEY);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed && Array.isArray(parsed.sections)) {
          parsed.sections = parsed.sections.filter((s) => s.id !== "about-us" && s.id !== "about-section");
          localStorage.setItem(HOMEPAGE_CONFIG_KEY, JSON.stringify(parsed));
        }
      }
      localStorage.setItem(HOME_LAYOUT_CLEANUP_KEY, "completed");
    }
  } catch (e) {
    console.error("Cleanup migration error in AdminContext:", e);
  }
}

const DEFAULT_BANNER_TYPES = [
  { id: "type-offer", name: "Offer" },
  { id: "type-arrival", name: "New Arrival" },
  { id: "type-promo", name: "Promotion" },
  { id: "type-collection", name: "Collection" },
];

const DEFAULT_HOMEPAGE_SECTIONS = [
  { id: "hero-slider",      label: "Hero Slides",       description: "Main hero banner slideshow at the top of the page",   visible: true, type: "global" },
  { id: "shop-by-category", label: "Shop by Category",  description: "Category grid letting customers browse by product type", visible: true, type: "global" },
  { id: "promo-001",        label: "Classic Comfort",   description: "Promotional Banner • Promotion",                       visible: true, type: "promo-banner", bannerId: "promo-001" },
  { id: "promo-002",        label: "Get 30% off essentials", description: "Promotional Banner • Promotion",               visible: true, type: "promo-banner", bannerId: "promo-002" },
  { id: "promo-003",        label: "Free assembly included", description: "Promotional Banner • Promotion",               visible: true, type: "promo-banner", bannerId: "promo-003" },
  { id: "new-arrivals",     label: "New Arrivals",      description: "Showcase of the latest products added to the store",   visible: true, type: "global" },
  { id: "best-sellers",     label: "Best Sellers",      description: "Top-selling products ranked by purchase frequency",    visible: true, type: "global" },
  { id: "customer-reviews", label: "Customer Reviews",  description: "Customer reviews and feedback carousel section",        visible: true, type: "global" },
];

const ALL_GLOBAL_SECTIONS = [
  { id: "hero-slider",      label: "Hero Slides",       description: "Main hero banner slideshow at the top of the page", visible: true, type: "global" },
  { id: "shop-by-category", label: "Shop by Category",  description: "Category grid letting customers browse by product type", visible: true, type: "global" },
  { id: "new-arrivals",     label: "New Arrivals",      description: "Showcase of the latest products added to the store", visible: true, type: "global" },
  { id: "best-sellers",     label: "Best Sellers",      description: "Top-selling products ranked by purchase frequency", visible: true, type: "global" },
  { id: "customer-reviews", label: "Customer Reviews",  description: "Customer reviews and feedback carousel section", visible: true, type: "global" },
];

const sanitizeHomepageConfig = (configSections, currentBanners) => {
  let result = [];
  const promoBanners = (currentBanners || []).filter((b) => b.type === "Promotion");
  const promoMap = new Map(promoBanners.map((b) => [b.id, b]));

  (configSections || []).forEach((sec) => {
    // Explicitly omit any about-us / about-section
    if (sec.id === "about-us" || sec.id === "about-section") return;

    // If legacy single grouped section item "promo-banner" or "promo-banners" is encountered, expand it to individual items
    if (sec.id === "promo-banner" || sec.id === "promo-banners") {
      promoBanners.forEach((pBanner) => {
        if (!result.some((r) => r.bannerId === pBanner.id || r.id === pBanner.id)) {
          result.push({
            id: pBanner.id,
            type: "promo-banner",
            bannerId: pBanner.id,
            label: pBanner.title || "Promotional Banner",
            description: `Promotional Banner • ${pBanner.type || "Promotion"}`,
            visible: sec.visible !== false,
          });
        }
      });
      return;
    }

    // If item is a specific promo banner item
    if (sec.type === "promo-banner" || sec.bannerId || promoMap.has(sec.id)) {
      const bId = sec.bannerId || sec.id;
      const bRecord = promoMap.get(bId);
      if (bRecord) {
        result.push({
          ...sec,
          id: bId,
          type: "promo-banner",
          bannerId: bId,
          label: bRecord.title || sec.label || "Promotional Banner",
          description: `Promotional Banner • ${bRecord.type || "Promotion"}`,
          visible: sec.visible !== false,
        });
      }
      return;
    }

    // Global section items & Custom Section items
    const globalDef = ALL_GLOBAL_SECTIONS.find((g) => g.id === sec.id);
    const isCustomSection = sec.isCustom === true || (sec.type === "product-section" && !globalDef);

    result.push({
      ...sec,
      id: globalDef ? globalDef.id : sec.id,
      label: sec.name || (globalDef ? globalDef.label : sec.label),
      name: sec.name || (globalDef ? globalDef.label : sec.label),
      description: sec.description !== undefined ? sec.description : (globalDef ? globalDef.description : ""),
      backgroundColor: sec.backgroundColor || sec.styles?.backgroundColor || "#FFFFFF",
      styles: sec.styles || { backgroundColor: sec.backgroundColor || "#FFFFFF" },
      type: sec.type || (globalDef ? "global" : "product-section"),
      isCustom: isCustomSection,
      productIds: sec.productIds || [],
      visible: sec.visible !== false,
    });
  });

  return { sections: result };
};

export const MELLOSOFT_CATALOGUE_VERSION = "v6-bed-frames";

export function AdminProvider({ children }) {
  const [adminView, setAdminView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [returnToNewArrivals, setReturnToNewArrivals] = useState(false);
  const [contentActiveTab, setContentActiveTab] = useState("homepage-layout");

  // Global Store Settings synchronized with localStorage ("mellosoft_settings")
  const [settings, setSettings] = useState(() => getSavedSettings());

  useEffect(() => {
    const handleSync = () => {
      setSettings(getSavedSettings());
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleSync);
      window.addEventListener(SETTINGS_UPDATED_EVENT, handleSync);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleSync);
        window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSync);
      }
    };
  }, []);

  const updateSettings = useCallback((newSettings) => {
    const success = saveSettingsToStorage(newSettings);
    if (success) {
      setSettings(normalizeSettings(newSettings));
    }
    return success;
  }, []);

  // Hydrate products from localStorage if available, enforcing persistent deletion tombstones & v3 catalogue reset
  const [products, setProducts] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const currentVer = localStorage.getItem("mellosoft_catalogue_version");
        if (currentVer !== MELLOSOFT_CATALOGUE_VERSION) {
          localStorage.removeItem("mellosoft_deleted_product_ids");
          localStorage.removeItem("mellosoft_products");
          localStorage.removeItem("mellosoft_admin_products");
          localStorage.setItem("mellosoft_catalogue_version", MELLOSOFT_CATALOGUE_VERSION);
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(MOCK_PRODUCTS));
          return MOCK_PRODUCTS;
        }

        const deletedIds = getDeletedProductIds();

        const activeMaster = MOCK_PRODUCTS.filter((m) => !isProductDeleted(m, deletedIds));

        const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const validParsed = parsed.filter((p) => !isProductDeleted(p, deletedIds));

            const parsedIdMap = new Map();
            validParsed.forEach((p) => {
              if (p.id) parsedIdMap.set(String(p.id).trim().toLowerCase(), p);
              if (p.Product_Id) parsedIdMap.set(String(p.Product_Id).trim().toLowerCase(), p);
              if (p.slug) parsedIdMap.set(String(p.slug).trim().toLowerCase(), p);
            });

            const masterIdSet = new Set();

            const merged = activeMaster.map((masterItem) => {
              if (masterItem.id) masterIdSet.add(String(masterItem.id).trim().toLowerCase());
              if (masterItem.Product_Id) masterIdSet.add(String(masterItem.Product_Id).trim().toLowerCase());
              if (masterItem.slug) masterIdSet.add(String(masterItem.slug).trim().toLowerCase());

              const stored =
                parsedIdMap.get(String(masterItem.id || "").trim().toLowerCase()) ||
                parsedIdMap.get(String(masterItem.Product_Id || "").trim().toLowerCase()) ||
                parsedIdMap.get(String(masterItem.slug || "").trim().toLowerCase());

              if (stored) {
                return {
                  ...masterItem,
                  ...stored,
                  name: stored.name || stored.Product_Name || masterItem.name,
                  Product_Name: stored.Product_Name || stored.name || masterItem.Product_Name,
                  parentCategory: stored.parentCategory || masterItem.parentCategory || "mattresses",
                  subCategory: stored.subCategory || stored.subcategory || masterItem.subCategory,
                  subcategory: stored.subcategory || stored.subCategory || masterItem.subcategory,
                  categoryName: stored.categoryName || masterItem.categoryName,
                  images: stored.images && stored.images.length > 0 ? stored.images : (stored.image ? [stored.image] : masterItem.images),
                  image: stored.image || (stored.images && stored.images[0]) || masterItem.image,
                  price: stored.price || stored.startingPrice || masterItem.price,
                  startingPrice: stored.startingPrice || stored.price || masterItem.startingPrice,
                  prices: stored.prices || masterItem.prices,
                  variantsList: stored.variantsList || masterItem.variantsList,
                  bedSizes: stored.bedSizes || masterItem.bedSizes,
                  isNewArrival: stored.isNewArrival ?? masterItem.isNewArrival ?? false,
                  newArrivalOrder: stored.newArrivalOrder ?? masterItem.newArrivalOrder ?? 999
                };
              }
              return masterItem;
            });

            validParsed.forEach((storedItem) => {
              const sid = String(storedItem.id || storedItem.Product_Id || storedItem.slug || "").trim().toLowerCase();
              if (sid && !masterIdSet.has(sid)) {
                merged.push(storedItem);
              }
            });

            return merged;
          }
        }
        return activeMaster;
      } catch (e) {
        console.error("Failed to load products from localStorage:", e);
      }
    }
    return MOCK_PRODUCTS;
  });

  // Hydrate categories from localStorage if available, enforcing hierarchical structure
  const [categories, setCategories] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return ensureRequiredCategories(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to load categories from localStorage:", e);
      }
    }
    return ensureRequiredCategories(MOCK_CATEGORIES);
  });

  const [roles, setRoles] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(ROLES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const systemRoles = DEFAULT_ROLES.map((dr) => {
              const found = parsed.find((r) => r.id === dr.id);
              return found ? { ...dr, ...found, permissions: found.permissions || dr.permissions } : dr;
            });
            const customRoles = parsed.filter((r) => !r.isSystemRole && !DEFAULT_ROLES.some((dr) => dr.id === r.id));
            return [...systemRoles, ...customRoles];
          }
        }
      } catch (e) {
        console.error("Failed to load roles from localStorage:", e);
      }
    }
    return DEFAULT_ROLES;
  });

  // Hydrate users from localStorage
  const [users, setUsers] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(USERS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load users from localStorage:", e);
      }
    }
    return DEFAULT_USERS;
  });

  // Hydrate orders from localStorage
  const [orders, setOrders] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load orders from localStorage:", e);
      }
    }
    return MOCK_ORDERS;
  });

  // Hydrate customers from localStorage
  const [customers, setCustomers] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mergedMap = new Map();
            (MOCK_CUSTOMERS || []).forEach((mc) => {
              const canonicalId = normalizeCustomerId(mc.customerId || mc.id);
              mergedMap.set(mc.email.toLowerCase(), { ...mc, id: canonicalId, customerId: canonicalId });
            });
            parsed.forEach((c) => {
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
          }
        }
      } catch (e) {
        console.error("Failed to load customers from localStorage:", e);
      }
    }
    return MOCK_CUSTOMERS;
  });

  // Hydrate wishlists from localStorage
  const [wishlists, setWishlists] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(WISHLISTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load wishlists from localStorage:", e);
      }
    }
    return MOCK_WISHLISTS;
  });

  // Hydrate customer carts from localStorage
  const [carts, setCarts] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CARTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load customer carts from localStorage:", e);
      }
    }
    return MOCK_CARTS;
  });

  // Hydrate reviews from localStorage
  const [reviews, setReviews] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error("Failed to load reviews from localStorage:", e);
      }
    }
    return [];
  });

  // Hydrate promotional banners & hero slides from localStorage
  const [banners, setBanners] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(BANNERS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // If saved banners exist but lack Promotion type, ensure default promo banners are merged
            const hasPromo = parsed.some((b) => b.type === "Promotion");
            if (!hasPromo) {
              const defaultPromos = MOCK_BANNERS.filter((b) => b.type === "Promotion");
              return [...parsed, ...defaultPromos];
            }
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load banners from localStorage:", e);
      }
    }
    return MOCK_BANNERS;
  });

  // Hydrate homepage config from localStorage (sanitizing to map individual promo banners)
  const [homepageConfig, setHomepageConfig] = useState(() => {
    let initialSections = DEFAULT_HOMEPAGE_SECTIONS;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(HOMEPAGE_CONFIG_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
            initialSections = parsed.sections;
          }
        }
      } catch (e) {
        console.error("Failed to load homepage config from localStorage:", e);
      }
    }
    return sanitizeHomepageConfig(initialSections, banners);
  });

  // Sync homepageConfig layout entries whenever banners update
  useEffect(() => {
    setHomepageConfig((prev) => {
      const sanitized = sanitizeHomepageConfig(prev?.sections || [], banners);
      if (JSON.stringify(prev?.sections) === JSON.stringify(sanitized?.sections)) return prev;
      return sanitized;
    });
  }, [banners]);

  // Hydrate banner types from localStorage
  const [bannerTypes, setBannerTypes] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(BANNER_TYPES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error("Failed to load banner types from localStorage:", e);
      }
    }
    return DEFAULT_BANNER_TYPES;
  });

  // Hydrate New Arrival Items config from localStorage
  const [newArrivalItems, setNewArrivalItems] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("mellosoft_new_arrivals_config");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error("Failed to load new arrivals config from localStorage:", e);
      }
    }
    return [
      { id: "na-1", productId: "foamcloud",      displayOrder: 1,  isActive: true },
      { id: "na-2", productId: "orthocare",       displayOrder: 2,  isActive: true },
      { id: "na-3", productId: "springease",      displayOrder: 3,  isActive: true },
      { id: "na-4", productId: "latexpure",       displayOrder: 4,  isActive: true },
      { id: "na-5", productId: "memorycloud",     displayOrder: 5,  isActive: true },
      { id: "na-6", productId: "memory-contour",  displayOrder: 6,  isActive: true },
      { id: "na-7", productId: "natura-latex",    displayOrder: 7,  isActive: true },
      { id: "na-8", productId: "aqua-guard",      displayOrder: 8,  isActive: true },
      { id: "na-9", productId: "cloud-duvet",     displayOrder: 9,  isActive: true },
      { id: "na-10", productId: "flexi-bed",      displayOrder: 10, isActive: true },
    ];
  });

  // Hydrate Best Sellers config from localStorage with sequential displayOrder
  const [bestSellerItems, setBestSellerItems] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("mellosoft_best_sellers_config");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item, idx) => ({
              ...item,
              displayOrder: idx + 1
            }));
          }
        }
      } catch (e) {
        console.error("Failed to load best sellers config from localStorage:", e);
      }
    }
    return [
      { id: "bs-1", productId: "foamcloud",  displayOrder: 1, isActive: true },
      { id: "bs-2", productId: "orthocare",   displayOrder: 2, isActive: true },
      { id: "bs-3", productId: "springease",  displayOrder: 3, isActive: true },
      { id: "bs-4", productId: "latexpure",   displayOrder: 4, isActive: true },
    ];
  });

  const [returnToBestSellers, setReturnToBestSellers] = useState(false);

  // Hydrate notifications from localStorage
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error("Failed to load notifications from localStorage:", e);
      }
    }
    return [];
  });

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const isFirstBannersRef = useRef(true);
  const isFirstNARef = useRef(true);
  const isFirstBSRef = useRef(true);
  const isFirstHomepageRef = useRef(true);

  // Persist banners to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners));
      if (isFirstBannersRef.current) {
        isFirstBannersRef.current = false;
        return;
      }
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
        }, 0);
      }
    } catch (e) {
      console.error("Failed to save banners to localStorage:", e);
    }
  }, [banners]);

  // Persist banner types to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BANNER_TYPES_STORAGE_KEY, JSON.stringify(bannerTypes));
    } catch (e) {
      console.error("Failed to save banner types to localStorage:", e);
    }
  }, [bannerTypes]);

  // Persist new arrival items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("mellosoft_new_arrivals_config", JSON.stringify(newArrivalItems));
      if (isFirstNARef.current) {
        isFirstNARef.current = false;
        return;
      }
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
        }, 0);
      }
    } catch (e) {
      console.error("Failed to save new arrivals config to localStorage:", e);
    }
  }, [newArrivalItems]);

  // Persist best seller items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("mellosoft_best_sellers_config", JSON.stringify(bestSellerItems));
      if (isFirstBSRef.current) {
        isFirstBSRef.current = false;
        return;
      }
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
        }, 0);
      }
    } catch (e) {
      console.error("Failed to save best sellers config to localStorage:", e);
    }
  }, [bestSellerItems]);

  // Persist homepage config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HOMEPAGE_CONFIG_KEY, JSON.stringify(homepageConfig));
      if (isFirstHomepageRef.current) {
        isFirstHomepageRef.current = false;
        return;
      }
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
        }, 0);
      }
    } catch (e) {
      console.error("Failed to save homepage config to localStorage:", e);
    }
  }, [homepageConfig]);

  // One-time automatic migration of any legacy base64 images in localStorage products & reviews to IndexedDB
  useEffect(() => {
    let isMounted = true;
    async function runStorageMigration() {
      try {
        const { migratedProducts, hasChanges: prodChanges } = await migrateProductsBase64(products);
        if (isMounted && prodChanges) {
          setProducts(migratedProducts);
          persistAndDispatchProducts(migratedProducts);
        }

        const savedReviewsStr = typeof window !== "undefined" ? localStorage.getItem(REVIEWS_STORAGE_KEY) : null;
        if (savedReviewsStr) {
          const parsedReviews = JSON.parse(savedReviewsStr);
          const { migratedReviews, hasChanges: revChanges } = await migrateReviewsBase64(parsedReviews);
          if (isMounted && revChanges) {
            localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(migratedReviews));
            window.dispatchEvent(new Event("storage"));
          }
        }
      } catch (err) {
        console.error("Storage migration error:", err);
      }
    }
    runStorageMigration();
    return () => { isMounted = false; };
  }, []);

  const auth = useAdminAuth();
  const currentUserId = auth?.currentUserId || (typeof window !== "undefined" ? localStorage.getItem("mellosoft_current_user_id") : null) || "user-001";
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const currentUserRole = roles.find((r) => r.id === currentUser?.roleId) || roles[0];

  const isFirstProductsRef = useRef(true);
  const isFirstOrdersRef = useRef(true);
  const isFirstCustRef = useRef(true);
  const isFirstNotifRef = useRef(true);

  // Persist products to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        if (isFirstProductsRef.current) {
          isFirstProductsRef.current = false;
          return;
        }
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_products_updated"));
        }, 0);
      } catch (e) {
        console.error("Failed to save products to localStorage:", e);
      }
    }
  }, [products]);

  // Persist categories to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
      } catch (e) {
        console.error("Failed to save categories to localStorage:", e);
      }
    }
  }, [categories]);

  // Persist roles to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
      } catch (e) {
        console.error("Failed to save roles to localStorage:", e);
      }
    }
  }, [roles]);

  // Persist users to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } catch (e) {
        console.error("Failed to save users to localStorage:", e);
      }
    }
  }, [users]);

  // Persist orders to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
        if (isFirstOrdersRef.current) {
          isFirstOrdersRef.current = false;
          return;
        }
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_orders_updated"));
        }, 0);
      } catch (e) {
        console.error("Failed to save orders to localStorage:", e);
      }
    }
  }, [orders]);

  // Real-time synchronization for shared data across same tab & multi-tab
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncAdminData = () => {
      try {
        const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (savedOrders) {
          const parsed = JSON.parse(savedOrders);
          if (Array.isArray(parsed)) {
            setOrders((prev) => (JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed));
          }
        }
      } catch (e) {
        console.error("Failed to sync orders in AdminContext:", e);
      }

      try {
        const savedCustomers = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
        if (savedCustomers) {
          const parsed = JSON.parse(savedCustomers);
          if (Array.isArray(parsed)) {
            const mergedMap = new Map();
            (MOCK_CUSTOMERS || []).forEach((mc) => {
              const canonicalId = normalizeCustomerId(mc.customerId || mc.id);
              mergedMap.set(mc.email.toLowerCase(), { ...mc, id: canonicalId, customerId: canonicalId });
            });
            parsed.forEach((c) => {
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
            const nextCustList = Array.from(mergedMap.values());
            setCustomers((prev) => (JSON.stringify(prev) === JSON.stringify(nextCustList) ? prev : nextCustList));
          }
        }
      } catch (e) {
        console.error("Failed to sync customers in AdminContext:", e);
      }

      try {
        const savedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
        if (savedReviews) {
          const parsed = JSON.parse(savedReviews);
          if (Array.isArray(parsed)) {
            setReviews((prev) => (JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed));
          }
        }
      } catch (e) {
        console.error("Failed to sync reviews in AdminContext:", e);
      }

      try {
        const savedNotifs = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (savedNotifs) {
          const parsed = JSON.parse(savedNotifs);
          if (Array.isArray(parsed)) {
            setNotifications((prev) => (JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed));
          }
        }
      } catch (e) {
        console.error("Failed to sync notifications in AdminContext:", e);
      }
    };

    window.addEventListener("storage", syncAdminData);
    window.addEventListener("mellosoft_orders_updated", syncAdminData);
    window.addEventListener("mellosoft_customers_updated", syncAdminData);
    window.addEventListener("mellosoft_reviews_updated", syncAdminData);
    window.addEventListener("mellosoft_products_updated", syncAdminData);
    window.addEventListener("mellosoft_notifications_updated", syncAdminData);

    return () => {
      window.removeEventListener("storage", syncAdminData);
      window.removeEventListener("mellosoft_orders_updated", syncAdminData);
      window.removeEventListener("mellosoft_customers_updated", syncAdminData);
      window.removeEventListener("mellosoft_reviews_updated", syncAdminData);
      window.removeEventListener("mellosoft_products_updated", syncAdminData);
      window.removeEventListener("mellosoft_notifications_updated", syncAdminData);
    };
  }, []);

  // Persist customers to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
        if (isFirstCustRef.current) {
          isFirstCustRef.current = false;
          return;
        }
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_customers_updated"));
        }, 0);
      } catch (e) {
        console.error("Failed to save customers to localStorage:", e);
      }
    }
  }, [customers]);

  // Persist wishlists to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(WISHLISTS_STORAGE_KEY, JSON.stringify(wishlists));
      } catch (e) {
        console.error("Failed to save wishlists to localStorage:", e);
      }
    }
  }, [wishlists]);

  // Persist customer carts to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CARTS_STORAGE_KEY, JSON.stringify(carts));
      } catch (e) {
        console.error("Failed to save customer carts to localStorage:", e);
      }
    }
  }, [carts]);

  // Persist reviews to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_reviews_updated"));
        }, 0);
      } catch (e) {
        console.error("Failed to save reviews to localStorage:", e);
      }
    }
  }, [reviews]);

  // Persist notifications to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
        if (isFirstNotifRef.current) {
          isFirstNotifRef.current = false;
          return;
        }
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_notifications_updated"));
        }, 0);
      } catch (e) {
        console.error("Failed to save notifications to localStorage:", e);
      }
    }
  }, [notifications]);

  /** Notification Handlers */
  const addNotification = useCallback((notif) => {
    setNotifications((prev) => {
      if (notif.orderId && prev.some((n) => n.orderId === notif.orderId && n.type === notif.type)) {
        return prev;
      }
      const newNotif = {
        id: notif.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: notif.type || "new_order",
        orderId: notif.orderId || null,
        title: notif.title || "New Order",
        message: notif.message || notif.text || "",
        text: notif.message || notif.text || "",
        read: false,
        createdAt: new Date().toISOString(),
        time: notif.time || "Just now"
      };
      return [newNotif, ...prev];
    });
  }, []);

  const markNotificationAsRead = useCallback((idOrOrderId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === idOrOrderId || n.orderId === idOrOrderId ? { ...n, read: true } : n
      )
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((idOrOrderId) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== idOrOrderId && n.orderId !== idOrOrderId)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /** Review Handlers */
  const approveReview = useCallback((reviewId) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: "Approved" } : r))
    );
  }, []);

  const rejectReview = useCallback((reviewId) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: "Rejected", showOnHome: false } : r))
    );
  }, []);

  const deleteReview = useCallback((reviewId) => {
    const deletedDate = new Date().toISOString().split("T")[0];
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              status: "Deleted",
              showOnHome: false,
              previousStatus: r.status !== "Deleted" ? r.status : r.previousStatus || "Approved",
              deletedAt: deletedDate,
            }
          : r
      )
    );
  }, []);

  const restoreReview = useCallback((reviewId, targetStatus) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const restoredStatus = targetStatus || r.previousStatus || "Approved";
          return {
            ...r,
            status: restoredStatus,
          };
        }
        return r;
      })
    );
  }, []);

  const toggleShowOnHome = useCallback((reviewId) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const isApproved = r.status === "Approved" || r.status === "approved";
          if (!isApproved && !r.showOnHome) return r; // Cannot enable home display for unapproved reviews
          return { ...r, showOnHome: !r.showOnHome };
        }
        return r;
      })
    );
  }, []);

  /** Customer Handlers */
  const updateCustomerStatus = useCallback((customerId, status) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, status } : c))
    );
  }, []);

  /** Order Handlers */
  const updateOrder = useCallback(
    (orderId, updatedFields) => {
      let updatedOrderObj = null;
      setOrders((prev) => {
        const nextOrders = prev.map((o) => {
          if (o.id === orderId || o.orderId === orderId) {
            let history = Array.isArray(o.trackingHistory) && o.trackingHistory.length > 0
              ? [...o.trackingHistory]
              : buildInitialTrackingHistory(o);

            if (updatedFields.orderStatus && o.orderStatus !== updatedFields.orderStatus) {
              const newStatus = updatedFields.orderStatus;
              const lastEntry = history[history.length - 1];
              if (!lastEntry || lastEntry.status.toLowerCase() !== newStatus.toLowerCase()) {
                const descMap = {
                  "Confirmed": "Your order has been placed & confirmed.",
                  "Order Confirmed": "Your order has been placed & confirmed.",
                  "Processing": "Your order is being prepared and quality inspected.",
                  "Packed": "Package packed and ready for carrier dispatch.",
                  "Shipped": "Package handed over to courier. In transit.",
                  "Out for Delivery": "Out for delivery with local courier agent.",
                  "Delivered": "Package delivered to destination address.",
                  "Cancelled": "Order has been cancelled."
                };
                history.push({
                  status: newStatus,
                  timestamp: new Date().toISOString(),
                  description: updatedFields.description || descMap[newStatus] || `Order status updated to ${newStatus}.`
                });
              }
            }

            updatedOrderObj = {
              ...o,
              ...updatedFields,
              updatedAt: new Date().toISOString(),
              trackingHistory: history
            };
            return updatedOrderObj;
          }
          return o;
        });

        // Persist to localStorage for real-time customer UI sync
        try {
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders));
          if (typeof window !== "undefined") {
            setTimeout(() => {
              window.dispatchEvent(new Event("storage"));
              window.dispatchEvent(new CustomEvent("mellosoft_orders_updated"));
            }, 0);
          }
        } catch (e) {
          console.error("Failed to save orders to localStorage:", e);
        }

        return nextOrders;
      });

      // Sync with backend API
      try {
        fetch(`/api/admin/orders/${orderId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUserId,
          },
          body: JSON.stringify(updatedFields),
        }).catch((err) => console.warn("Background API order sync warning:", err));
      } catch {
        // Ignore
      }

      return { success: true, order: updatedOrderObj };
    },
    [currentUserId]
  );

  // Check if current user has permission
  const hasPermission = useCallback(
    (moduleName, action) => {
      if (!currentUserRole) return false;
      return checkPermission(currentUserRole, moduleName, action);
    },
    [currentUserRole]
  );

  // navigateTo supports optional itemId for product/user/role views
  const navigateTo = useCallback((view, itemId) => {
    setAdminView(view);
    if (view === "add-product" && itemId === "new-arrivals") {
      setReturnToNewArrivals(true);
    }
    if (view === "add-product" && itemId === "best-sellers") {
      setReturnToBestSellers(true);
    }
    if (view === "content" && itemId) {
      setContentActiveTab(itemId);
    }
    if (itemId !== undefined) {
      if (view === "product-details" || view === "edit-product") {
        setSelectedProductId(itemId);
      } else if (view === "user-details" || view === "edit-user") {
        setSelectedUserId(itemId);
      } else if (view === "role-details" || view === "edit-role") {
        setSelectedRoleId(itemId);
      }
    }
    setSidebarMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setSidebarMobileOpen((prev) => !prev);
  }, []);

  /** Helper to persist products and notify storefront */
  const persistAndDispatchProducts = async (nextProducts) => {
    try {
      // 1. Ensure no base64 payloads remain in localStorage record
      const { migratedProducts } = await migrateProductsBase64(nextProducts);
      const cleanProducts = migratedProducts || nextProducts;

      const jsonStr = JSON.stringify(cleanProducts);
      
      // Development storage size diagnostics
      if (process.env.NODE_ENV !== "production" && typeof Blob !== "undefined") {
        const mbSize = new Blob([jsonStr]).size / 1024 / 1024;
        console.log("mellosoft_products storage size:", mbSize.toFixed(3), "MB");
      }

      localStorage.setItem(PRODUCTS_STORAGE_KEY, jsonStr);
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft:products-updated", { detail: cleanProducts }));
        }, 0);
      }
    } catch (e) {
      console.error("QuotaExceededError saving products to localStorage:", e);
      if (typeof window !== "undefined" && (e?.name === "QuotaExceededError" || e?.code === 22 || e?.code === 1014)) {
        setTimeout(() => {
          alert("Unable to save product because browser storage is full. Please clear unused browser data or remove unnecessary uploads.");
        }, 0);
      }
    }
  };

  /** Product Handlers */
  const addProduct = useCallback((newProduct) => {
    const primaryImg = getProductPrimaryImage(newProduct);
    const imagesArray = Array.isArray(newProduct.images) && newProduct.images.length > 0
      ? newProduct.images
      : (primaryImg ? [primaryImg] : []);
    const normalized = {
      ...newProduct,
      image: primaryImg,
      images: imagesArray,
      imageUrl: primaryImg,
      thumbnail: primaryImg
    };
    setProducts((prev) => {
      const next = [normalized, ...prev];
      persistAndDispatchProducts(next);
      return next;
    });
  }, []);

  const updateProduct = useCallback((updatedProduct) => {
    const primaryImg = getProductPrimaryImage(updatedProduct);
    const imagesArray = Array.isArray(updatedProduct.images) && updatedProduct.images.length > 0
      ? updatedProduct.images
      : (primaryImg ? [primaryImg] : []);
    const normalized = {
      ...updatedProduct,
      image: primaryImg,
      images: imagesArray,
      imageUrl: primaryImg,
      thumbnail: primaryImg,
      name: updatedProduct.name || updatedProduct.Product_Name,
      Product_Name: updatedProduct.Product_Name || updatedProduct.name
    };
    setProducts((prev) => {
      let matched = false;
      const next = prev.map((p) => {
        if (isSameProduct(p, normalized)) {
          matched = true;
          return { ...p, ...normalized };
        }
        return p;
      });
      if (!matched) {
        next.unshift(normalized);
      }
      persistAndDispatchProducts(next);
      return next;
    });
  }, []);

  const deleteProduct = useCallback((targetProductOrId) => {
    const targetId = typeof targetProductOrId === "object" ? targetProductOrId?.id : targetProductOrId;
    const targetProdId = typeof targetProductOrId === "object" ? targetProductOrId?.Product_Id : null;
    const targetSlug = typeof targetProductOrId === "object" ? targetProductOrId?.slug : null;

    if (targetId) saveDeletedProductId(targetId);
    if (targetProdId) saveDeletedProductId(targetProdId);
    if (targetSlug) saveDeletedProductId(targetSlug);

    const deletedSet = new Set(getDeletedProductIds().map((i) => String(i).trim().toLowerCase()));

    setProducts((prev) => {
      const next = prev.filter((p) => {
        const id = String(p.id || "").trim().toLowerCase();
        const prodId = String(p.Product_Id || "").trim().toLowerCase();
        const slug = String(p.slug || "").trim().toLowerCase();
        return !deletedSet.has(id) && !deletedSet.has(prodId) && !deletedSet.has(slug);
      });
      persistAndDispatchProducts(next);
      return next;
    });

    setNewArrivalItems((prev) => {
      const filtered = prev.filter((item) => !deletedSet.has(String(item.productId || item.id || "").trim().toLowerCase()));
      return filtered.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    });

    setBestSellerItems((prev) => {
      const filtered = prev.filter((item) => !deletedSet.has(String(item.productId || item.id || "").trim().toLowerCase()));
      return filtered.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    });

    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("mellosoft:products-updated"));
      }, 0);
    }
  }, []);

  /** User Handlers */
  const addUser = useCallback((userData) => {
    const newUser = {
      id: userData.id || `user-${Date.now()}`,
      name: userData.name ? userData.name.trim() : "New User",
      email: userData.email ? userData.email.toLowerCase().trim() : "",
      phone: userData.phone || "",
      passwordHash: hashPassword(userData.password || "Password@123"),
      roleId: userData.roleId || "role-staff",
      status: userData.status || "Active",
      lastLogin: "Never",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUsers((prev) => [newUser, ...prev]);

    // Sync with backend API
    try {
      fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify({
          ...userData,
          passwordHash: newUser.passwordHash,
        }),
      }).catch((err) => console.warn("Background API user create warning:", err));
    } catch {
      // Ignore offline
    }

    return { success: true, user: newUser };
  }, [currentUserId]);

  const updateUser = useCallback((userId, updatedData) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, error: "User not found." };

    // Super Admin Protection check
    if (targetUser.roleId === "role-super-admin" && targetUser.status === "Active") {
      const activeSuperAdmins = users.filter((u) => u.roleId === "role-super-admin" && u.status === "Active");
      if (activeSuperAdmins.length <= 1) {
        if (updatedData.status && updatedData.status !== "Active") {
          return { success: false, error: "At least one active Super Admin is required. You cannot deactivate the last Super Admin." };
        }
        if (updatedData.roleId && updatedData.roleId !== "role-super-admin") {
          return { success: false, error: "At least one active Super Admin is required. You cannot demote the last Super Admin." };
        }
      }
    }

    let updatedUserObj = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          updatedUserObj = {
            ...u,
            name: updatedData.name !== undefined ? updatedData.name.trim() : u.name,
            email: updatedData.email !== undefined ? updatedData.email.toLowerCase().trim() : u.email,
            phone: updatedData.phone !== undefined ? updatedData.phone : u.phone,
            roleId: updatedData.roleId !== undefined ? updatedData.roleId : u.roleId,
            status: updatedData.status !== undefined ? updatedData.status : u.status,
          };
          if (updatedData.password) {
            updatedUserObj.passwordHash = hashPassword(updatedData.password);
          }
          return updatedUserObj;
        }
        return u;
      })
    );

    // Sync with backend API
    try {
      fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify(updatedData),
      }).catch((err) => console.warn("Background API user update warning:", err));
    } catch {
      // Ignore offline
    }

    return { success: true, user: updatedUserObj };
  }, [users, currentUserId]);

  const toggleUserStatus = useCallback((userId) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, error: "User not found." };

    if (targetUser.roleId === "role-super-admin" && targetUser.status === "Active") {
      const activeSuperAdmins = users.filter((u) => u.roleId === "role-super-admin" && u.status === "Active");
      if (activeSuperAdmins.length <= 1) {
        return { success: false, error: "At least one active Super Admin is required. You cannot deactivate the last Super Admin." };
      }
    }

    const nextStatus = targetUser.status === "Active" ? "Inactive" : "Active";
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );

    // Sync with backend API
    try {
      fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify({ status: nextStatus }),
      }).catch((err) => console.warn("Background API user status toggle warning:", err));
    } catch {
      // Ignore offline
    }

    return { success: true, status: nextStatus };
  }, [users, currentUserId]);

  const deleteUser = useCallback(
    (userId) => {
      const targetUser = users.find((u) => u.id === userId);
      if (!targetUser) return { success: false, error: "User not found." };

      if (userId === currentUserId) {
        return { success: false, error: "You cannot delete your own account." };
      }

      if (targetUser.roleId === "role-super-admin") {
        const activeSuperAdmins = users.filter((u) => u.roleId === "role-super-admin" && u.status === "Active");
        if (activeSuperAdmins.length <= 1) {
          return { success: false, error: "At least one active Super Admin is required. You cannot delete the last Super Admin account." };
        }
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));

      // Sync with backend API
      try {
        fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
          headers: {
            "x-user-id": currentUserId,
          },
        }).catch((err) => console.warn("Background API user delete warning:", err));
      } catch {
        // Ignore offline
      }

      return { success: true };
    },
    [users, currentUserId]
  );

  /** Role Handlers */
  const addRole = useCallback((roleData) => {
    const newRole = {
      id: roleData.id || `role-${Date.now()}`,
      name: roleData.name ? roleData.name.trim() : "Custom Role",
      description: roleData.description ? roleData.description.trim() : `${roleData.name} custom role`,
      isSystemRole: false,
      createdAt: new Date().toISOString().split("T")[0],
      permissions: roleData.permissions || {
        dashboard: ["view"],
        products: ["view"],
        orders: ["view"],
        customers: ["view"],
        reviews: ["view"],
        content: ["view"],
        users: [],
        roles: [],
        settings: [],
      },
    };

    setRoles((prev) => [...prev, newRole]);

    // Sync with backend API
    try {
      fetch("/api/admin/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify(roleData),
      }).catch((err) => console.warn("Background API role create warning:", err));
    } catch {
      // Ignore offline
    }

    return { success: true, role: newRole };
  }, [currentUserId]);

  const updateRole = useCallback((roleId, updatedData) => {
    let updatedRoleObj = null;
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id === roleId) {
          updatedRoleObj = {
            ...r,
            name: r.isSystemRole ? r.name : (updatedData.name ? updatedData.name.trim() : r.name),
            description: updatedData.description !== undefined ? updatedData.description : r.description,
            permissions: r.id === "role-super-admin" ? r.permissions : (updatedData.permissions || r.permissions),
          };
          return updatedRoleObj;
        }
        return r;
      })
    );

    // Sync with backend API
    try {
      fetch(`/api/admin/roles/${roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify(updatedData),
      }).catch((err) => console.warn("Background API role sync warning:", err));
    } catch {
      // Ignore client offline
    }

    return { success: true, role: updatedRoleObj };
  }, [currentUserId]);

  const deleteRole = useCallback(
    (roleId) => {
      const role = roles.find((r) => r.id === roleId);
      if (!role) return { success: false, error: "Role not found." };

      if (role.isSystemRole || role.id === "role-super-admin") {
        return { success: false, error: "System default roles cannot be deleted." };
      }

      const assignedUsers = users.filter((u) => u.roleId === roleId);
      if (assignedUsers.length > 0) {
        return {
          success: false,
          error: `Cannot delete role "${role.name}" because ${assignedUsers.length} user${assignedUsers.length > 1 ? "s are" : " is"} currently assigned to it. Please reassign the user(s) first.`,
        };
      }

      setRoles((prev) => prev.filter((r) => r.id !== roleId));

      // Sync with backend API
      try {
        fetch(`/api/admin/roles/${roleId}`, {
          method: "DELETE",
          headers: {
            "x-user-id": currentUserId,
          },
        }).catch((err) => console.warn("Background API role delete warning:", err));
      } catch {
        // Ignore offline
      }

      return { success: true };
    },
    [roles, users, currentUserId]
  );

  const addBanner = useCallback((bannerData) => {
    let createdBanner;
    setBanners((prev) => {
      const targetType = bannerData.type || "Offer";
      const sameTypeItems = prev.filter((b) => (b.type || "Offer") === targetType);
      
      createdBanner = {
        id: bannerData.id || `banner-${Date.now().toString().slice(-4)}`,
        title: bannerData.title || "Untitled Banner",
        type: targetType,
        image: bannerData.image || "/asset/img2.jpg",
        subtitle: bannerData.subtitle || "",
        description: bannerData.description || "",
        ctaText: bannerData.ctaText !== undefined ? bannerData.ctaText : "Shop Now",
        ctaLink: bannerData.ctaLink || "mattress",
        isActive: bannerData.isActive !== false,
        productId: bannerData.productId || "",
        displayOrder: sameTypeItems.length + 1
      };
      return [...prev, createdBanner];
    });

    if (bannerData.type === "Promotion") {
      setHomepageConfig((prevConfig) => {
        const prevSections = prevConfig?.sections || [];
        const exists = prevSections.some((s) => s.bannerId === createdBanner.id || s.id === createdBanner.id);
        if (exists) return prevConfig;
        const newSectionItem = {
          id: createdBanner.id,
          bannerId: createdBanner.id,
          type: "promo-banner",
          label: createdBanner.title || "Promotional Banner",
          description: `Promotional Banner • ${createdBanner.type || "Promotion"}`,
          visible: true
        };
        return {
          ...prevConfig,
          sections: [...prevSections, newSectionItem]
        };
      });
    }

    return { success: true, banner: createdBanner };
  }, []);

  const updateBanner = useCallback((id, updatedFields) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updatedFields } : b))
    );
    if (updatedFields.title) {
      setHomepageConfig((prevConfig) => {
        const prevSections = prevConfig?.sections || [];
        const updatedSections = prevSections.map((s) =>
          (s.id === id || s.bannerId === id) ? { ...s, label: updatedFields.title } : s
        );
        return { ...prevConfig, sections: updatedSections };
      });
    }
    return { success: true };
  }, []);

  const deleteBanner = useCallback((id) => {
    setBanners((prev) => {
      const deleted = prev.find((b) => b.id === id);
      const targetType = deleted?.type || "Offer";
      const remaining = prev.filter((b) => b.id !== id);
      
      let count = 1;
      return remaining.map((b) => {
        if ((b.type || "Offer") === targetType) {
          return { ...b, displayOrder: count++ };
        }
        return b;
      });
    });
    setHomepageConfig((prevConfig) => {
      const prevSections = prevConfig?.sections || [];
      const updatedSections = prevSections.filter((s) => s.id !== id && s.bannerId !== id);
      return { ...prevConfig, sections: updatedSections };
    });
    return { success: true };
  }, []);

  const toggleBannerStatus = useCallback((id) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
    return { success: true };
  }, []);

  const reorderBanners = useCallback((reorderedItems) => {
    setBanners((prev) => {
      const orderMap = new Map(reorderedItems.map((item, index) => [item.id, index + 1]));
      return prev.map((b) => {
        if (orderMap.has(b.id)) {
          return { ...b, displayOrder: orderMap.get(b.id) };
        }
        return b;
      });
    });
    return { success: true };
  }, []);

  const addBannerType = useCallback((typeNameInput) => {
    const rawName = typeof typeNameInput === "string" ? typeNameInput : typeNameInput?.name || "";
    const cleanName = rawName.trim();
    if (!cleanName) {
      return { success: false, error: "Type Name is required." };
    }

    const isDuplicate = bannerTypes.some(
      (t) => (typeof t === "string" ? t : t.name).toLowerCase() === cleanName.toLowerCase()
    );
    if (isDuplicate) {
      return { success: false, error: "This Hero Slide Type already exists." };
    }

    const newType = {
      id: `type-${Date.now()}`,
      name: cleanName
    };
    setBannerTypes((prev) => [...prev, newType]);
    return { success: true, bannerType: newType };
  }, [bannerTypes]);

  const deleteBannerType = useCallback((typeNameOrId) => {
    setBannerTypes((prev) =>
      prev.filter((t) => {
        const name = typeof t === "string" ? t : t.name;
        const id = typeof t === "string" ? t : t.id;
        return name.toLowerCase() !== typeNameOrId.toLowerCase() && id !== typeNameOrId;
      })
    );
    return { success: true };
  }, []);

  const updateHomepageConfig = useCallback((updatedConfig) => {
    setHomepageConfig(updatedConfig);
  }, []);

  const addProductsToNewArrivals = useCallback((productIds) => {
    setNewArrivalItems((prev) => {
      const existingProductIds = new Set(prev.map((item) => item.productId));
      const newItems = [];
      
      productIds.forEach((pid) => {
        if (!existingProductIds.has(pid)) {
          newItems.push({
            id: `na-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            productId: pid,
            isActive: true
          });
        }
      });
      const combined = [...prev, ...newItems];
      return combined.map((item, idx) => ({
        ...item,
        displayOrder: idx + 1
      }));
    });
    return { success: true };
  }, []);

  const addNewProductAndAddToNewArrivals = useCallback((productData) => {
    const res = addProduct(productData);
    if (res && res.success && res.product) {
      addProductsToNewArrivals([res.product.id]);
    }
    return res;
  }, [addProduct, addProductsToNewArrivals]);

  const removeFromNewArrivals = useCallback((id) => {
    setNewArrivalItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id && item.productId !== id);
      return filtered.map((item, idx) => ({
        ...item,
        displayOrder: idx + 1
      }));
    });
    return { success: true };
  }, []);

  const toggleNewArrivalStatus = useCallback((id) => {
    setNewArrivalItems((prev) =>
      prev.map((item) => (item.id === id || item.productId === id ? { ...item, isActive: !item.isActive } : item))
    );
    return { success: true };
  }, []);

  const reorderNewArrivals = useCallback((reorderedItems) => {
    setNewArrivalItems(() => {
      return reorderedItems.map((item, idx) => ({
        ...item,
        displayOrder: idx + 1
      }));
    });
    return { success: true };
  }, []);

  const addProductsToBestSellers = useCallback((productIds) => {
    setBestSellerItems((prev) => {
      const existingProductIds = new Set(prev.map((item) => item.productId));
      const newItems = [];
      
      productIds.forEach((pid) => {
        if (!existingProductIds.has(pid)) {
          newItems.push({
            id: `bs-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            productId: pid,
            isActive: true
          });
        }
      });
      const combined = [...prev, ...newItems];
      return combined.map((item, idx) => ({
        ...item,
        displayOrder: idx + 1
      }));
    });
    return { success: true };
  }, []);

  const addNewProductAndAddToBestSellers = useCallback((productData) => {
    const res = addProduct(productData);
    if (res && res.success && res.product) {
      addProductsToBestSellers([res.product.id]);
    }
    return res;
  }, [addProduct, addProductsToBestSellers]);

  const removeFromBestSellers = useCallback((id) => {
    setBestSellerItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id && item.productId !== id);
      return filtered.map((item, idx) => ({
        ...item,
        displayOrder: idx + 1
      }));
    });
    return { success: true };
  }, []);

  const toggleBestSellerStatus = useCallback((id) => {
    setBestSellerItems((prev) =>
      prev.map((item) => (item.id === id || item.productId === id ? { ...item, isActive: !item.isActive } : item))
    );
    return { success: true };
  }, []);

  const reorderBestSellers = useCallback((reorderedItems) => {
    setBestSellerItems(() => {
      return reorderedItems.map((item, idx) => ({
        ...item,
        displayOrder: idx + 1
      }));
    });
    return { success: true };
  }, []);

  const addCategory = useCallback((newCatData) => {
    const newMainCat = {
      id: newCatData.id || `CAT-${(newCatData.name || "NEW").toUpperCase().replace(/[^A-Z0-9]/g, "")}`,
      name: newCatData.name.trim(),
      slug: newCatData.slug || newCatData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      image: newCatData.image || "/assets/categories/memory-foam.jpg",
      description: newCatData.description || "",
      type: "main",
      active: newCatData.active !== false && newCatData.status !== "Inactive",
      order: newCatData.order || Date.now(),
      subcategories: newCatData.subcategories || []
    };

    setCategories((prev) => {
      const updated = [...prev, newMainCat];
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_categories_updated"));
        }
      } catch (e) {
        console.error("Failed to save categories:", e);
      }
      return updated;
    });
  }, []);

  const updateCategory = useCallback((catId, updatedData) => {
    setCategories((prev) => {
      const updated = prev.map((cat) => {
        if (cat.id === catId || cat.slug === catId) {
          return {
            ...cat,
            ...updatedData,
            name: updatedData.name ? updatedData.name.trim() : cat.name,
            slug: updatedData.slug || (updatedData.name ? updatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : cat.slug),
          };
        }
        return cat;
      });
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_categories_updated"));
        }
      } catch (e) {
        console.error("Failed to save edited category:", e);
      }
      return updated;
    });
  }, []);

  const deleteCategory = useCallback((catId) => {
    const targetCat = categories.find((c) => c.id === catId || c.slug === catId);
    if (!targetCat) return { success: false, error: "Category not found." };

    const prodCount = getMainCategoryProductCount(targetCat, products, categories);
    const subCount = (targetCat.subcategories || []).length;

    if (prodCount > 0 || subCount > 0) {
      return {
        success: false,
        error: `Cannot delete "${targetCat.name}". It contains ${prodCount} product(s) and ${subCount} subcategory/subcategories. Please remove or reassign products and subcategories first.`
      };
    }

    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== catId && c.slug !== catId);
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_categories_updated"));
        }
      } catch (e) {
        console.error("Failed to save categories after delete:", e);
      }
      return updated;
    });

    return { success: true };
  }, [categories, products]);

  const addSubcategory = useCallback((parentId, subData) => {
    const newSub = {
      id: subData.id || `SUB-${(subData.name || "SUB").toUpperCase().replace(/[^A-Z0-9]/g, "")}`,
      parentId: parentId,
      name: subData.name.trim(),
      slug: subData.slug || subData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      aliases: subData.aliases || [subData.name.toLowerCase().trim()],
      active: subData.active !== false && subData.status !== "Inactive",
      order: subData.order || Date.now()
    };

    setCategories((prev) => {
      const updated = prev.map((cat) => {
        if (cat.id === parentId || cat.slug === parentId) {
          const subs = cat.subcategories || [];
          return { ...cat, subcategories: [...subs, newSub] };
        }
        return cat;
      });
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_categories_updated"));
        }
      } catch (e) {
        console.error("Failed to save subcategory:", e);
      }
      return updated;
    });
  }, []);

  const updateSubcategory = useCallback((parentId, subId, updatedData) => {
    setCategories((prev) => {
      const updated = prev.map((cat) => {
        if (cat.id === parentId || cat.slug === parentId) {
          const subs = (cat.subcategories || []).map((sub) => {
            if (sub.id === subId || sub.slug === subId) {
              return {
                ...sub,
                ...updatedData,
                name: updatedData.name ? updatedData.name.trim() : sub.name,
                slug: updatedData.slug || (updatedData.name ? updatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : sub.slug),
              };
            }
            return sub;
          });
          return { ...cat, subcategories: subs };
        }
        return cat;
      });
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_categories_updated"));
        }
      } catch (e) {
        console.error("Failed to save edited subcategory:", e);
      }
      return updated;
    });
  }, []);

  const deleteSubcategory = useCallback((parentId, subId) => {
    let targetSub = null;
    for (const mainCat of categories) {
      const found = (mainCat.subcategories || []).find((s) => s.id === subId || s.slug === subId);
      if (found) {
        targetSub = found;
        break;
      }
    }

    if (!targetSub) return { success: false, error: "Subcategory not found." };

    const prodCount = getSubcategoryProductCount(targetSub, products, categories);
    if (prodCount > 0) {
      return {
        success: false,
        error: `Cannot delete subcategory "${targetSub.name}". It contains ${prodCount} product(s). Please reassign or remove products first.`
      };
    }

    setCategories((prev) => {
      const updated = prev.map((cat) => {
        if (cat.id === parentId || cat.slug === parentId) {
          const subs = (cat.subcategories || []).filter((s) => s.id !== subId && s.slug !== subId);
          return { ...cat, subcategories: subs };
        }
        return cat;
      });
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_categories_updated"));
        }
      } catch (e) {
        console.error("Failed to save categories after subcategory delete:", e);
      }
      return updated;
    });

    return { success: true };
  }, [categories, products]);

  return (
    <AdminContext.Provider
      value={{
        adminView,
        navigateTo,
        sidebarCollapsed,
        toggleSidebar,
        sidebarMobileOpen,
        toggleMobileSidebar,
        notifications,
        unreadNotificationsCount: (notifications || []).filter((n) => !n.read).length,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearNotifications,
        selectedOrderId,
        setSelectedOrderId,
        selectedProductId,
        selectedUserId,
        selectedRoleId,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerStatus,
        reorderBanners,
        bannerTypes,
        addBannerType,
        deleteBannerType,
        newArrivalItems,
        addProductsToNewArrivals,
        addNewProductAndAddToNewArrivals,
        removeFromNewArrivals,
        toggleNewArrivalStatus,
        reorderNewArrivals,
        bestSellerItems,
        addProductsToBestSellers,
        addNewProductAndAddToBestSellers,
        removeFromBestSellers,
        toggleBestSellerStatus,
        reorderBestSellers,
        returnToNewArrivals,
        setReturnToNewArrivals,
        returnToBestSellers,
        setReturnToBestSellers,
        contentActiveTab,
        setContentActiveTab,
        homepageConfig,
        updateHomepageConfig,
        users,
        addUser,
        updateUser,
        toggleUserStatus,
        deleteUser,
        roles,
        addRole,
        updateRole,
        deleteRole,
        orders,
        updateOrder,
        customers,
        updateCustomerStatus,
        wishlists,
        carts,
        reviews,
        approveReview,
        rejectReview,
        deleteReview,
        restoreReview,
        toggleShowOnHome,
        currentUser,
        currentUserRole,
        hasPermission,
        getFirstAllowedAdminView: () => getFirstAllowedAdminView(currentUserRole),
        settings,
        updateSettings,
        saveSettings: updateSettings,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}



