"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { MOCK_PRODUCTS } from "../../data/products";
import { MOCK_CATEGORIES, MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_WISHLISTS, MOCK_CARTS, MOCK_REVIEWS, MOCK_BANNERS } from "../data/adminMockData";
import { DEFAULT_ROLES } from "../../data/rolesData";
import { DEFAULT_USERS } from "../../data/usersData";
import { hashPassword, checkPermission } from "../../utils/security";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { buildInitialTrackingHistory } from "../../utils/trackingHelpers";

const AdminContext = createContext();

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
  { id: "about-us",         label: "About Us",          description: "About Mellosoft and why customers choose us",          visible: true, type: "global" },
];

const ALL_GLOBAL_SECTIONS = [
  { id: "hero-slider",      label: "Hero Slides",       description: "Main hero banner slideshow at the top of the page", visible: true, type: "global" },
  { id: "shop-by-category", label: "Shop by Category",  description: "Category grid letting customers browse by product type", visible: true, type: "global" },
  { id: "new-arrivals",     label: "New Arrivals",      description: "Showcase of the latest products added to the store", visible: true, type: "global" },
  { id: "best-sellers",     label: "Best Sellers",      description: "Top-selling products ranked by purchase frequency", visible: true, type: "global" },
  { id: "customer-reviews", label: "Customer Reviews",  description: "Customer reviews and feedback carousel section", visible: true, type: "global" },
  { id: "about-us",         label: "About Us",          description: "About Mellosoft and why customers choose us", visible: true, type: "global" },
];

const sanitizeHomepageConfig = (configSections, currentBanners, isInitialHydration = false) => {
  let result = [];
  const promoBanners = (currentBanners || []).filter((b) => b.type === "Promotion");
  const promoMap = new Map(promoBanners.map((b) => [b.id, b]));

  (configSections || []).forEach((sec) => {
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

    // Global section items
    const globalDef = ALL_GLOBAL_SECTIONS.find((g) => g.id === sec.id || (sec.id === "about-section" && g.id === "about-us"));
    result.push({
      ...sec,
      id: globalDef ? globalDef.id : sec.id,
      label: globalDef ? globalDef.label : sec.label,
      description: globalDef ? globalDef.description : sec.description,
      type: sec.type || "global",
      visible: sec.visible !== false,
    });
  });

  // On initial hydration, if 'about-us' is not present, append it
  if (isInitialHydration) {
    if (!result.some((r) => r.id === "about-us" || r.id === "about-section")) {
      result.push({ id: "about-us", label: "About Us", description: "About Mellosoft and why customers choose us", visible: true, type: "global" });
    }
  }

  return { sections: result };
};

export function AdminProvider({ children }) {
  const [adminView, setAdminView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [returnToNewArrivals, setReturnToNewArrivals] = useState(false);
  const [contentActiveTab, setContentActiveTab] = useState("homepage-layout");
  
  // Hydrate products from localStorage if available, or default to MOCK_PRODUCTS
  const [products, setProducts] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const parsedIdMap = new Map(parsed.map((p) => [p.id, p]));
            return MOCK_PRODUCTS.map((masterItem) => {
              const stored = parsedIdMap.get(masterItem.id);
              return {
                ...masterItem,
                ...(stored || {}),
                isNewArrival: stored?.isNewArrival ?? masterItem.isNewArrival ?? false,
                newArrivalOrder: stored?.newArrivalOrder ?? masterItem.newArrivalOrder ?? 999
              };
            });
          }
        }
      } catch (e) {
        console.error("Failed to load products from localStorage:", e);
      }
    }
    return MOCK_PRODUCTS;
  });

  // Hydrate categories from localStorage if available, or default to MOCK_CATEGORIES
  const [categories, setCategories] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load categories from localStorage:", e);
      }
    }
    return MOCK_CATEGORIES;
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
            return parsed;
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
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error("Failed to load reviews from localStorage:", e);
      }
    }
    return MOCK_REVIEWS;
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
    return sanitizeHomepageConfig(initialSections, banners, true);
  });

  // Sync homepageConfig layout entries whenever banners update
  useEffect(() => {
    setHomepageConfig((prev) => sanitizeHomepageConfig(prev?.sections || [], banners));
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
      { id: "na-1", productId: "cloudrest",     displayOrder: 1,  isActive: true },
      { id: "na-2", productId: "spinecare",     displayOrder: 2,  isActive: true },
      { id: "na-3", productId: "breeze",        displayOrder: 3,  isActive: true },
      { id: "na-4", productId: "natura",        displayOrder: 4,  isActive: true },
      { id: "na-5", productId: "embrace",       displayOrder: 5,  isActive: true },
      { id: "na-6", productId: "celestial",     displayOrder: 6,  isActive: true },
      { id: "na-7", productId: "cloud-contour", displayOrder: 7,  isActive: true },
      { id: "na-8", productId: "aqua-guard",    displayOrder: 8,  isActive: true },
      { id: "na-9", productId: "cloud-duvet",    displayOrder: 9,  isActive: true },
      { id: "na-10", productId: "flexi-bed",    displayOrder: 10, isActive: true },
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
      { id: "bs-1", productId: "classic-mattress", displayOrder: 1, isActive: true },
      { id: "bs-2", productId: "luxe-hybrid",     displayOrder: 2, isActive: true },
      { id: "bs-3", productId: "ortho-support",   displayOrder: 3, isActive: true },
      { id: "bs-4", productId: "ergo-air",        displayOrder: 4, isActive: true },
    ];
  });

  const [returnToBestSellers, setReturnToBestSellers] = useState(false);

  // Persist banners to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
    } catch (e) {
      console.error("Failed to save new arrivals config to localStorage:", e);
    }
  }, [newArrivalItems]);

  // Persist best seller items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("mellosoft_best_sellers_config", JSON.stringify(bestSellerItems));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
    } catch (e) {
      console.error("Failed to save best sellers config to localStorage:", e);
    }
  }, [bestSellerItems]);

  // Persist homepage config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HOMEPAGE_CONFIG_KEY, JSON.stringify(homepageConfig));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
    } catch (e) {
      console.error("Failed to save homepage config to localStorage:", e);
    }
  }, [homepageConfig]);

  const auth = useAdminAuth();
  const currentUserId = auth?.currentUserId || (typeof window !== "undefined" ? localStorage.getItem("mellosoft_current_user_id") : null) || "user-001";
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const currentUserRole = roles.find((r) => r.id === currentUser?.roleId) || roles[0];

  const [notifications] = useState([
    { id: 1, text: "New order #MS-92841 received", time: "2 min ago", read: false },
    { id: 2, text: "Low stock alert: Luxury Down Pillow", time: "15 min ago", read: false },
    { id: 3, text: "New review on Classic Mattress", time: "1 hr ago", read: true },
    { id: 4, text: "Coupon SUMMER30 expires tomorrow", time: "3 hrs ago", read: true },
  ]);

  // Persist products to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
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
          if (Array.isArray(parsed)) setOrders(parsed);
        }
      } catch (e) {
        console.error("Failed to sync orders in AdminContext:", e);
      }

      try {
        const savedCustomers = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
        if (savedCustomers) {
          const parsed = JSON.parse(savedCustomers);
          if (Array.isArray(parsed)) setCustomers(parsed);
        }
      } catch (e) {
        console.error("Failed to sync customers in AdminContext:", e);
      }

      try {
        const savedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
        if (savedReviews) {
          const parsed = JSON.parse(savedReviews);
          if (Array.isArray(parsed)) setReviews(parsed);
        }
      } catch (e) {
        console.error("Failed to sync reviews in AdminContext:", e);
      }

      try {
        const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) setProducts(parsed);
        }
      } catch (e) {
        console.error("Failed to sync products in AdminContext:", e);
      }
    };

    window.addEventListener("storage", syncAdminData);
    window.addEventListener("mellosoft_orders_updated", syncAdminData);
    window.addEventListener("mellosoft_customers_updated", syncAdminData);
    window.addEventListener("mellosoft_reviews_updated", syncAdminData);
    window.addEventListener("mellosoft_products_updated", syncAdminData);

    return () => {
      window.removeEventListener("storage", syncAdminData);
      window.removeEventListener("mellosoft_orders_updated", syncAdminData);
      window.removeEventListener("mellosoft_customers_updated", syncAdminData);
      window.removeEventListener("mellosoft_reviews_updated", syncAdminData);
      window.removeEventListener("mellosoft_products_updated", syncAdminData);
    };
  }, []);

  // Persist customers to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
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
      } catch (e) {
        console.error("Failed to save reviews to localStorage:", e);
      }
    }
  }, [reviews]);

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
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("mellosoft_orders_updated"));
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

  /** Product Handlers */
  const addProduct = useCallback((newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  }, []);

  const updateProduct = useCallback((updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === updatedProduct.id || p.Product_Id === updatedProduct.Product_Id ? updatedProduct : p
      )
    );
  }, []);

  const deleteProduct = useCallback((productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId && p.Product_Id !== productId));
    setNewArrivalItems((prev) => {
      const filtered = prev.filter((item) => item.productId !== productId && item.id !== productId);
      return filtered.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    });
    setBestSellerItems((prev) => {
      const filtered = prev.filter((item) => item.productId !== productId && item.id !== productId);
      return filtered.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    });
  }, []);

  /** Category Handlers */
  const addCategory = useCallback((newCatData) => {
    const slug = newCatData.slug || newCatData.name.toLowerCase().replace(/\s+/g, "-");
    const newCategory = {
      id: newCatData.id || `CAT${Date.now()}`,
      name: newCatData.name,
      slug,
      image: newCatData.image || "/asset/texture.png",
      description: newCatData.description || `${newCatData.name} category`,
    };
    setCategories((prev) => [newCategory, ...prev]);
    return newCategory;
  }, []);

  const updateCategory = useCallback((catId, updatedData) => {
    setCategories((prev) => {
      const oldCat = prev.find((c) => c.id === catId);
      const newSlug = updatedData.name ? updatedData.name.toLowerCase().replace(/\s+/g, "-") : oldCat?.slug;
      
      if (oldCat && updatedData.name && oldCat.name !== updatedData.name) {
        const oldSlug = oldCat.slug || oldCat.name.toLowerCase();
        setProducts((prevProds) =>
          prevProds.map((p) =>
            (p.category || "").toLowerCase() === oldSlug ? { ...p, category: newSlug } : p
          )
        );
      }

      return prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              name: updatedData.name || c.name,
              slug: newSlug || c.slug,
              image: updatedData.image || c.image,
              description: updatedData.description || c.description,
            }
          : c
      );
    });
  }, []);

  const deleteCategory = useCallback(
    (catId) => {
      const cat = categories.find((c) => c.id === catId);
      if (!cat) return { success: false, error: "Category not found." };

      const catSlug = (cat.slug || cat.name || "").toLowerCase();
      const catName = (cat.name || "").toLowerCase();

      const assignedProducts = products.filter((p) => {
        const pCat = (p.category || "").toLowerCase();
        return (
          pCat === catSlug ||
          pCat === catName ||
          pCat + "s" === catName ||
          pCat === catName.replace(/s$/, "")
        );
      });

      if (assignedProducts.length > 0) {
        return {
          success: false,
          error: `Cannot delete "${cat.name}" category because ${assignedProducts.length} product${assignedProducts.length > 1 ? "s are" : " is"} assigned to it.`,
        };
      }

      setCategories((prev) => prev.filter((c) => c.id !== catId));
      return { success: true };
    },
    [categories, products]
  );

  /** User Handlers */
  const addUser = useCallback((userData) => {
    const newUser = {
      id: userData.id || `user-${Date.now()}`,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone || "",
      passwordHash: hashPassword(userData.password),
      roleId: userData.roleId,
      status: userData.status || "Active",
      lastLogin: "Never",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [newUser, ...prev]);
    return { success: true, user: newUser };
  }, []);

  const updateUser = useCallback((userId, updatedData) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = {
            ...u,
            name: updatedData.name !== undefined ? updatedData.name : u.name,
            email: updatedData.email !== undefined ? updatedData.email.toLowerCase().trim() : u.email,
            phone: updatedData.phone !== undefined ? updatedData.phone : u.phone,
            roleId: updatedData.roleId !== undefined ? updatedData.roleId : u.roleId,
            status: updatedData.status !== undefined ? updatedData.status : u.status,
          };
          if (updatedData.password) {
            updated.passwordHash = hashPassword(updatedData.password);
          }
          return updated;
        }
        return u;
      })
    );
    return { success: true };
  }, []);

  const toggleUserStatus = useCallback((userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u
      )
    );
  }, []);

  const deleteUser = useCallback(
    (userId) => {
      const targetUser = users.find((u) => u.id === userId);
      if (!targetUser) return { success: false, error: "User not found." };

      if (userId === currentUserId) {
        return { success: false, error: "You cannot delete your own account." };
      }

      if (targetUser.roleId === "role-super-admin") {
        const superAdminCount = users.filter((u) => u.roleId === "role-super-admin").length;
        if (superAdminCount <= 1) {
          return { success: false, error: "Cannot delete the last Super Admin account." };
        }
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      return { success: true };
    },
    [users, currentUserId]
  );

  /** Role Handlers */
  const addRole = useCallback((roleData) => {
    const newRole = {
      id: roleData.id || `role-${Date.now()}`,
      name: roleData.name,
      description: roleData.description || `${roleData.name} custom role`,
      isSystemRole: false,
      createdAt: new Date().toISOString().split("T")[0],
      permissions: roleData.permissions || {
        dashboard: ["view"],
        products: ["view"],
        orders: ["view"],
        customers: ["view"],
        reviews: ["view"],
        users: [],
        roles: [],
        settings: [],
      },
    };
    setRoles((prev) => [...prev, newRole]);
    return { success: true, role: newRole };
  }, []);

  const updateRole = useCallback((roleId, updatedData) => {
    let updatedRoleObj = null;
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id === roleId) {
          updatedRoleObj = {
            ...r,
            name: r.isSystemRole ? r.name : updatedData.name || r.name,
            description: updatedData.description !== undefined ? updatedData.description : r.description,
            permissions: updatedData.permissions || r.permissions,
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

      if (role.isSystemRole) {
        return { success: false, error: "System default roles cannot be deleted." };
      }

      const assignedUsers = users.filter((u) => u.roleId === roleId);
      if (assignedUsers.length > 0) {
        return {
          success: false,
          error: `Cannot delete role "${role.name}" because ${assignedUsers.length} user${assignedUsers.length > 1 ? "s are" : " is"} currently assigned to it.`,
        };
      }

      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      return { success: true };
    },
    [roles, users]
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



