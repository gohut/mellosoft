"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MOCK_PRODUCTS } from "../data/products";
import { MOCK_ORDERS, MOCK_CARTS, MOCK_WISHLISTS, MOCK_BANNERS, MOCK_REVIEWS, MOCK_CATEGORIES } from "../admin/data/adminMockData";
import { calculateDiscountedPrice } from "../utils/currency";
import { getVariantForSelection } from "../utils/variantHelpers";
import { ensureProductPricing } from "../utils/pricingEngine";
import { getProductPrimaryImage, getDeletedProductIds, isProductDeleted, ensureRequiredCategories } from "../utils/productHelpers";
import { useCustomerAuth } from "./CustomerAuthContext";
import { getSavedSettings, saveSettingsToStorage, normalizeSettings, SETTINGS_UPDATED_EVENT } from "../utils/settingsHelpers";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const router = useRouter();
  const { currentCustomer, isAuthenticated, setIntendedView, intendedView } = useCustomerAuth();
  
  // Navigation & View State
  const [view, setView] = useState("home");
  const [selectedProductId, setSelectedProductId] = useState("foamcloud");
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    category: "All",
    firmness: "All",
    size: "All",
    sort: "Recommended"
  });

  const currentCustomerId = currentCustomer ? currentCustomer.id : "C001";

  // User Commerce State
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(["foamcloud"]);
  // Products state is mutable so stock decrements can be applied
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  // Orders State synchronized with localStorage ("mellosoft_orders")
  const [orders, setOrders] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const isReset = localStorage.getItem("mellosoft_orders_reset_v1");
        if (isReset !== "completed") {
          localStorage.setItem("mellosoft_orders", JSON.stringify([]));
          localStorage.setItem("mellosoft_admin_orders", JSON.stringify([]));
          localStorage.setItem("mellosoft_admin_notifications", JSON.stringify([]));
          localStorage.setItem("mellosoft_orders_reset_v1", "completed");
          return [];
        }
        const saved = localStorage.getItem("mellosoft_orders");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error("Failed to load orders from localStorage:", e);
      }
    }
    return [];
  });

  // Reviews State synchronized with localStorage ("mellosoft_reviews")
  const [reviews, setReviews] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("mellosoft_reviews");
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

  const [banners, setBanners] = useState(MOCK_BANNERS);

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

  // Categories — loaded from localStorage (set by AdminContext) or fall back to defaults
  const [categories, setCategories] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("mellosoft_categories");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return ensureRequiredCategories(parsed);
          }
        }
      } catch (e) {
        // ignore
      }
    }
    return ensureRequiredCategories(MOCK_CATEGORIES);
  });

  // New Arrival Config State synchronized with localStorage ("mellosoft_new_arrivals_config")
  const [newArrivalItems, setNewArrivalItems] = useState([
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
  ]);

  // Best Sellers Config State synchronized with localStorage ("mellosoft_best_sellers_config")
  const [bestSellerItems, setBestSellerItems] = useState([
    { id: "bs-1", productId: "foamcloud",  displayOrder: 1, isActive: true },
    { id: "bs-2", productId: "orthocare",   displayOrder: 2, isActive: true },
    { id: "bs-3", productId: "springease",  displayOrder: 3, isActive: true },
    { id: "bs-4", productId: "latexpure",   displayOrder: 4, isActive: true },
  ]);

  // Homepage Layout Config synchronized with localStorage ("mellosoft_homepage_config")
  const [homepageConfig, setHomepageConfig] = useState({
    sections: [
      { id: "hero-slider", visible: true, type: "global" },
      { id: "shop-by-category", visible: true, type: "global" },
      { id: "promo-001", visible: true, type: "promo-banner", bannerId: "promo-001" },
      { id: "promo-002", visible: true, type: "promo-banner", bannerId: "promo-002" },
      { id: "promo-003", visible: true, type: "promo-banner", bannerId: "promo-003" },
      { id: "new-arrivals", visible: true, type: "global" },
      { id: "best-sellers", visible: true, type: "global" },
      { id: "customer-reviews", visible: true, type: "global" }
    ]
  });

  // ─── Checkout Flow State (persisted to sessionStorage for navigation reliability) ─
  const [checkoutItems, setCheckoutItems] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("mellosoft_checkout_items");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });

  const [selectedAddress, setSelectedAddress] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("mellosoft_selected_address");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") return parsed;
        }
      } catch {}
    }
    return null;
  });

  const [userAddresses, setUserAddresses] = useState({});
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (checkoutItems && checkoutItems.length > 0) {
          sessionStorage.setItem("mellosoft_checkout_items", JSON.stringify(checkoutItems));
        } else {
          sessionStorage.removeItem("mellosoft_checkout_items");
        }
      } catch {}
    }
  }, [checkoutItems]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (selectedAddress) {
          sessionStorage.setItem("mellosoft_selected_address", JSON.stringify(selectedAddress));
        } else {
          sessionStorage.removeItem("mellosoft_selected_address");
        }
      } catch {}
    }
  }, [selectedAddress]);

  // ─── Typed banner selectors — each section has its own data source ─────────
  const sortedBanners = (banners || [])
    .filter((b) => b.isActive !== false && b.status !== "Inactive" && b.status !== "inactive")
    .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

  const activeHeroBanners = sortedBanners.filter((b) => b.type === "Offer");
  const activePromoBanners = sortedBanners.filter((b) => b.type === "Promotion");
  const activeNewArrivalBanners = sortedBanners.filter((b) => b.type === "New Arrival");
  const activeBanners = sortedBanners;

  // Hydration-safe initial loading from localStorage
  useEffect(() => {
    const syncStore = () => {
      // Sync reviews
      try {
        const savedReviews = localStorage.getItem("mellosoft_reviews");
        if (savedReviews) {
          const parsed = JSON.parse(savedReviews);
          if (Array.isArray(parsed)) {
            setReviews((prev) => (JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed));
          }
        } else {
          setReviews([]);
        }
      } catch (e) {
        console.error("Failed to load reviews from localStorage:", e);
      }

      // Sync banners
      try {
        const savedBanners = localStorage.getItem("mellosoft_banners");
        if (savedBanners) {
          const parsed = JSON.parse(savedBanners);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBanners((prev) => (JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed));
          }
        } else {
          setBanners((prev) => (JSON.stringify(prev) === JSON.stringify(MOCK_BANNERS) ? prev : MOCK_BANNERS));
        }
      } catch (e) {
        console.error("Failed to load banners from localStorage:", e);
      }

      // Sync homepage config
      try {
        const savedConfig = localStorage.getItem("mellosoft_homepage_config");
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
            setHomepageConfig((prev) => (JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed));
          }
        }
      } catch (e) {
        console.error("Failed to load homepage config from localStorage:", e);
      }

      // Sync new arrivals config
      try {
        const savedNA = localStorage.getItem("mellosoft_new_arrivals_config");
        if (savedNA) {
          const parsed = JSON.parse(savedNA);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const nextNA = parsed.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
            setNewArrivalItems((prev) => (JSON.stringify(prev) === JSON.stringify(nextNA) ? prev : nextNA));
          }
        }
      } catch (e) {
        console.error("Failed to load new arrivals config from localStorage:", e);
      }

      // Sync best sellers config
      try {
        const savedBS = localStorage.getItem("mellosoft_best_sellers_config");
        if (savedBS) {
          const parsed = JSON.parse(savedBS);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const nextBS = parsed.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
            setBestSellerItems((prev) => (JSON.stringify(prev) === JSON.stringify(nextBS) ? prev : nextBS));
          }
        }
      } catch (e) {
        console.error("Failed to load best sellers config from localStorage:", e);
      }

      // Sync products (merging stored overrides with master catalogue, minus persistent tombstones & respecting v3 migration)
      try {
        const currentVer = localStorage.getItem("mellosoft_catalogue_version");
        if (currentVer !== "v6-bed-frames") {
          localStorage.removeItem("mellosoft_deleted_product_ids");
          localStorage.removeItem("mellosoft_products");
          localStorage.removeItem("mellosoft_admin_products");
          localStorage.setItem("mellosoft_catalogue_version", "v6-bed-frames");
          localStorage.setItem("mellosoft_products", JSON.stringify(MOCK_PRODUCTS));
          setProducts(MOCK_PRODUCTS);
          return;
        }

        const deletedIds = getDeletedProductIds();
        const activeMaster = MOCK_PRODUCTS.filter((m) => !isProductDeleted(m, deletedIds));

        const savedProducts = localStorage.getItem("mellosoft_products") || localStorage.getItem("mellosoft_admin_products");
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts);
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
                const primaryImg = getProductPrimaryImage(stored) || getProductPrimaryImage(masterItem);
                const imagesArray = stored?.images && stored.images.length > 0
                  ? stored.images
                  : (primaryImg ? [primaryImg] : masterItem.images || [masterItem.image]);

                const combined = {
                  ...masterItem,
                  ...stored,
                  name: stored.name || stored.Product_Name || masterItem.name,
                  Product_Name: stored.Product_Name || stored.name || masterItem.Product_Name,
                  parentCategory: stored.parentCategory || masterItem.parentCategory || "mattresses",
                  subCategory: stored.subCategory || stored.subcategory || masterItem.subCategory,
                  subcategory: stored.subcategory || stored.subCategory || masterItem.subcategory,
                  categoryName: stored.categoryName || masterItem.categoryName,
                  image: primaryImg,
                  images: imagesArray,
                  imageUrl: primaryImg,
                  thumbnail: primaryImg,
                  price: stored.price || stored.startingPrice || masterItem.price,
                  startingPrice: stored.startingPrice || stored.price || masterItem.startingPrice,
                  prices: stored.prices || masterItem.prices,
                  variantsList: stored.variantsList || masterItem.variantsList,
                  bedSizes: stored.bedSizes || masterItem.bedSizes,
                  isNewArrival: stored.isNewArrival ?? masterItem.isNewArrival ?? false,
                  newArrivalOrder: stored.newArrivalOrder ?? masterItem.newArrivalOrder ?? 999
                };
                return ensureProductPricing(combined);
              }
              return ensureProductPricing(masterItem);
            });

            validParsed.forEach((storedItem) => {
              const sid = String(storedItem.id || storedItem.Product_Id || storedItem.slug || "").trim().toLowerCase();
              if (sid && !masterIdSet.has(sid)) {
                const primaryImg = getProductPrimaryImage(storedItem);
                const imagesArray = storedItem.images && storedItem.images.length > 0
                  ? storedItem.images
                  : [primaryImg];
                merged.push(ensureProductPricing({
                  ...storedItem,
                  image: primaryImg,
                  images: imagesArray,
                  imageUrl: primaryImg,
                  thumbnail: primaryImg
                }));
              }
            });

            setProducts((prev) => (JSON.stringify(prev) === JSON.stringify(merged) ? prev : merged));
          } else {
            const nextMaster = activeMaster.map((item) => ensureProductPricing(item));
            setProducts((prev) => (JSON.stringify(prev) === JSON.stringify(nextMaster) ? prev : nextMaster));
          }
        } else {
          const nextMaster = activeMaster.map((item) => ensureProductPricing(item));
          setProducts((prev) => (JSON.stringify(prev) === JSON.stringify(nextMaster) ? prev : nextMaster));
        }
      } catch (e) {
        console.error("Failed to load products from localStorage:", e);
      }

      // Sync orders
      try {
        const savedOrders = localStorage.getItem("mellosoft_orders");
        if (savedOrders) {
          const parsed = JSON.parse(savedOrders);
          if (Array.isArray(parsed)) {
            setOrders((prev) => (JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed));
          }
        } else {
          setOrders([]);
        }
      } catch (e) {
        console.error("Failed to load orders from localStorage:", e);
      }
    };

    syncStore();
    window.addEventListener("storage", syncStore);
    window.addEventListener("mellosoft_orders_updated", syncStore);
    window.addEventListener("mellosoft:products-updated", syncStore);

    // Load user addresses
    try {
      const savedAddresses = localStorage.getItem("mellosoft_addresses");
      if (savedAddresses) {
        const parsed = JSON.parse(savedAddresses);
        if (parsed && typeof parsed === "object") setUserAddresses(parsed);
      }
    } catch (e) {
      console.error("Failed to load addresses from localStorage:", e);
    }

    return () => {
      window.removeEventListener("storage", syncStore);
      window.removeEventListener("mellosoft_orders_updated", syncStore);
      window.removeEventListener("mellosoft:products-updated", syncStore);
    };
  }, []);

  // Sync customer-specific cart & wishlist whenever customer or auth state changes
  useEffect(() => {
    if (!isAuthenticated || !currentCustomer) {
      setCart([]);
      setWishlist([]);
      return;
    }

    const cid = currentCustomer.id;

    // Load Cart from API/localStorage for this specific customer
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.cart)) {
          setCart(data.cart);
        } else {
          const savedCart = localStorage.getItem(`mellosoft_cart_${cid}`);
          setCart(savedCart ? JSON.parse(savedCart) : []);
        }
      })
      .catch(() => {
        const savedCart = localStorage.getItem(`mellosoft_cart_${cid}`);
        setCart(savedCart ? JSON.parse(savedCart) : []);
      });

    // Load Wishlist from API/localStorage for this specific customer
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.wishlist)) {
          setWishlist(data.wishlist);
        } else {
          const savedWishlist = localStorage.getItem(`mellosoft_wishlist_${cid}`);
          setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
        }
      })
      .catch(() => {
        const savedWishlist = localStorage.getItem(`mellosoft_wishlist_${cid}`);
        setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
      });
  }, [isAuthenticated, currentCustomer]);

  // Window storage sync for cross-tab / Admin updates
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "mellosoft_orders" && e.newValue) {
        try {
          setOrders(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === "mellosoft_banners" && e.newValue) {
        try {
          setBanners(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === "mellosoft_products" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) setProducts(parsed);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Save cart changes per customerId
  useEffect(() => {
    if (!currentCustomerId) return;
    try {
      localStorage.setItem(`mellosoft_cart_${currentCustomerId}`, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }, [cart, currentCustomerId]);

  // Save wishlist changes per customerId
  useEffect(() => {
    if (!currentCustomerId) return;
    try {
      localStorage.setItem(`mellosoft_wishlist_${currentCustomerId}`, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist:", e);
    }
  }, [wishlist, currentCustomerId]);

  // Save orders changes
  useEffect(() => {
    try {
      localStorage.setItem("mellosoft_orders", JSON.stringify(orders));
    } catch (e) {
      console.error("Failed to save orders:", e);
    }
  }, [orders]);

  // Actions & Handlers
  const refreshOrders = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("mellosoft_orders");
        if (saved) setOrders(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Auth Popup Modal State ("login" | "signup" | "forgot-password" | null)
  const [authModal, setAuthModal] = useState(null);

  const closeAuthModal = useCallback(() => {
    setAuthModal(null);
  }, []);

  const openAuthModal = useCallback((modalType = "login") => {
    setAuthModal(modalType);
  }, []);

  const navigateTo = (newView, param = null) => {
    // Explicit product detail navigation
    if (newView === "detail" || newView === "product") {
      const prodId = param || selectedProductId;
      if (prodId) setSelectedProductId(prodId);
      setView("detail");
      if (router && typeof router.push === "function") {
        router.push(`/product/${encodeURIComponent(String(prodId).trim())}`);
      }
      return;
    }

    // Explicit order confirmation navigation
    if (newView === "confirmation" || newView === "order-confirmation") {
      const ordId = param || selectedOrderId;
      if (ordId) setSelectedOrderId(ordId);
      const targetRoute = ordId
        ? `/order-confirmation/${encodeURIComponent(String(ordId).trim())}`
        : "/order-confirmation";
      setView("confirmation");
      if (router && typeof router.push === "function") {
        router.push(targetRoute);
      }
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    // Modal popup views
    if (newView === "login" || newView === "signup" || newView === "forgot-password") {
      setAuthModal(newView);
      return;
    }

    // Auth protection for customer-specific pages if accessing while logged out
    const protectedViews = ["orders", "profile", "checkout", "payment", "confirmation"];
    if (protectedViews.includes(newView) && !isAuthenticated) {
      setIntendedView(newView);
      setAuthModal("login");
      return;
    }

    setAuthModal(null);
    if (newView === "orders") {
      refreshOrders();
    }
    setView(newView);

    const routeMap = {
      home: "/",
      catalog: "/mattresses",
      mattress: "/mattresses",
      accessories: "/accessories",
      about: "/about",
      contact: "/contact",
      cart: "/cart",
      wishlist: "/wishlist",
      orders: "/orders",
      search: "/search",
      profile: "/profile",
      checkout: "/checkout",
      payment: "/checkout/payment",
      confirmation: selectedOrderId ? `/order-confirmation/${selectedOrderId}` : "/order-confirmation",
      terms: "/terms",
      privacy: "/privacy",
      "return-policy": "/return-policy",
      "cancellation-policy": "/cancellation-policy"
    };

    const targetRoute = routeMap[newView] || "/";
    if (router && typeof router.push === "function") {
      router.push(targetRoute);
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Save user delivery address keyed by userId
  const saveUserAddress = useCallback((userId, address) => {
    setUserAddresses((prev) => {
      const updated = { ...prev, [userId]: address };
      try {
        localStorage.setItem("mellosoft_addresses", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save address:", e);
      }
      return updated;
    });
  }, []);

  // Place order — decrements variant stock, adds order to orders list
  const placeOrder = (newOrder) => {
    // Decrement stock for each ordered item in the matching product variant
    setProducts((prevProducts) => {
      const updated = prevProducts.map((product) => {
        const orderedItem = (newOrder.items || []).find(
          (i) => (i.productId || i.id) === product.id
        );
        if (!orderedItem) return product;

        const updatedVariants = (product.variants || []).map((v) => {
          const sizeMatch = (v.Size || v.size) === (orderedItem.size || orderedItem.variantSize);
          const firmnessMatch = (v.Firmness || v.firmness) === (orderedItem.firmness || orderedItem.variantFirmness);
          if (sizeMatch && firmnessMatch) {
            const currentStock = Number(v.Stock ?? 0);
            const ordered = Number(orderedItem.quantity || orderedItem.qty || 1);
            return { ...v, Stock: Math.max(0, currentStock - ordered) };
          }
          return v;
        });
        return { ...product, variants: updatedVariants };
      });
      try {
        localStorage.setItem("mellosoft_products", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save products after stock decrement:", e);
      }
      return updated;
    });

    // Add the new order & persist to localStorage with real-time sync
    const orderWithSnapshot = {
      ...newOrder,
      storeSnapshot: newOrder.storeSnapshot || {
        storeName: settings?.store?.name || "Mellosoft",
        email: settings?.store?.email || "admin@mellosoft.in",
        phone: settings?.store?.phone || "+91 98765 43210",
        gstNumber: settings?.store?.gstNumber || "07AABCM1234A1Z5",
        address: settings?.store?.address || "42, MG Road, Bengaluru, Karnataka 560001",
        logo: settings?.website?.logo || "/asset/logo.png"
      }
    };

    setOrders((prevOrders) => [orderWithSnapshot, ...prevOrders]);

    // Persist order & dispatch events asynchronously
    if (typeof window !== "undefined") {
      try {
        const currentSaved = localStorage.getItem("mellosoft_orders");
        const parsedSaved = currentSaved ? JSON.parse(currentSaved) : [];
        const updatedOrders = [orderWithSnapshot, ...(Array.isArray(parsedSaved) ? parsedSaved : [])];
        localStorage.setItem("mellosoft_orders", JSON.stringify(updatedOrders));
        setTimeout(() => {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_orders_updated"));
        }, 0);
      } catch (e) {
        console.error("Failed to save orders to localStorage on placeOrder:", e);
      }
    }

    // Also sync/create customer in mellosoft_customers
    if (typeof window !== "undefined") {
      try {
        const savedCusts = localStorage.getItem("mellosoft_customers");
        let custsList = savedCusts ? JSON.parse(savedCusts) : [];
        if (!Array.isArray(custsList)) custsList = [];

        const custId = newOrder.customerId || newOrder.userId || currentCustomerId || "C001";
        const custEmail = newOrder.email || currentCustomer?.email || "customer@mellosoft.com";
        const custName = newOrder.customerName || newOrder.deliveryAddress?.fullName || currentCustomer?.name || "Customer";
        const custPhone = newOrder.phone || newOrder.deliveryAddress?.phone || currentCustomer?.phone || "";

        const existingIdx = custsList.findIndex(
          (c) => c.id === custId || (custEmail && c.email?.toLowerCase() === custEmail.toLowerCase())
        );

        if (existingIdx >= 0) {
          custsList[existingIdx] = {
            ...custsList[existingIdx],
            name: custName || custsList[existingIdx].name,
            phone: custPhone || custsList[existingIdx].phone,
            email: custEmail || custsList[existingIdx].email,
            status: custsList[existingIdx].status || "Active"
          };
        } else {
          custsList.push({
            id: custId,
            name: custName,
            email: custEmail,
            phone: custPhone,
            totalOrders: 1,
            totalSpent: newOrder.totalAmount || 0,
            status: "Active",
            createdAt: new Date().toISOString().split("T")[0]
          });
        }
        localStorage.setItem("mellosoft_customers", JSON.stringify(custsList));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("mellosoft_customers_updated"));
        }, 0);
      } catch (e) {
        console.error("Failed to sync customer on placeOrder:", e);
      }
    }

    // Create admin notification in mellosoft_admin_notifications
    if (typeof window !== "undefined") {
      try {
        const savedNotifs = localStorage.getItem("mellosoft_admin_notifications");
        let notifsList = savedNotifs ? JSON.parse(savedNotifs) : [];
        if (!Array.isArray(notifsList)) notifsList = [];

        const custName = newOrder.customerName || newOrder.deliveryAddress?.fullName || currentCustomer?.name || "Customer";
        const totalFormatted = Number(orderWithSnapshot.totalAmount ?? orderWithSnapshot.total ?? 0).toLocaleString("en-IN");

        const exists = notifsList.some((n) => n.orderId === orderWithSnapshot.id && n.type === "new_order");
        if (!exists) {
          const newNotif = {
            id: `notif-${orderWithSnapshot.id}-${Date.now()}`,
            type: "new_order",
            orderId: orderWithSnapshot.id,
            title: "New Order",
            message: `${custName} placed order #${orderWithSnapshot.id} for ₹${totalFormatted}.`,
            text: `${custName} placed order #${orderWithSnapshot.id} for ₹${totalFormatted}.`,
            read: false,
            createdAt: new Date().toISOString(),
            time: "Just now"
          };
          notifsList.unshift(newNotif);
          localStorage.setItem("mellosoft_admin_notifications", JSON.stringify(notifsList));
          setTimeout(() => {
            window.dispatchEvent(new Event("storage"));
            window.dispatchEvent(new CustomEvent("mellosoft_notifications_updated"));
          }, 0);
        }
      } catch (e) {
        console.error("Failed to save admin notification on placeOrder:", e);
      }
    }

    setCart([]);
    setCheckoutItems([]);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("mellosoft_checkout_items");
        sessionStorage.removeItem("mellosoft_selected_address");
      } catch {}
    }
    return orderWithSnapshot;
  };

  const cancelOrder = (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === orderId ? { ...o, orderStatus: "Cancelled" } : o
      )
    );
  };

  const getProductById = useCallback(
    (identifier) => {
      if (!identifier) return null;
      let target = String(identifier).trim();
      try {
        target = decodeURIComponent(target).trim().toLowerCase();
      } catch (e) {
        target = target.toLowerCase();
      }

      // 1. Search active products state (with potential stock decrements)
      let found = (products || []).find((p) => {
        if (!p) return false;
        const pId = p.id ? String(p.id).toLowerCase() : "";
        const pSlug = p.slug ? String(p.slug).toLowerCase() : "";
        const pProdId = p.Product_Id ? String(p.Product_Id).toLowerCase() : "";
        return pId === target || pSlug === target || pProdId === target;
      });

      // 2. Search MOCK_PRODUCTS master catalogue if products state did not contain the item
      if (!found) {
        found = (MOCK_PRODUCTS || []).find((p) => {
          if (!p) return false;
          const pId = p.id ? String(p.id).toLowerCase() : "";
          const pSlug = p.slug ? String(p.slug).toLowerCase() : "";
          const pProdId = p.Product_Id ? String(p.Product_Id).toLowerCase() : "";
          return pId === target || pSlug === target || pProdId === target;
        });
      }

      return found || null;
    },
    [products]
  );

  const addToCart = (product, firmness, size, qty = 1) => {
    if (!isAuthenticated) {
      setAuthModal("login");
      return;
    }

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.id === product.id &&
          item.firmness === firmness &&
          item.size === size
      );

      const variant = getVariantForSelection(product, size, firmness);
      const discountPercent = product?.discountPercent ?? product?.Discount_Percentage ?? 10;
      const rawPrice = Number(
        (variant && variant.Actual_Price) ??
        (product.firmnessPrices && product.firmnessPrices[firmness]) ??
        (product.sizePrices && product.sizePrices[size]) ??
        (product.Actual_Price ?? product.price) ??
        0
      );
      const price = calculateDiscountedPrice(rawPrice, discountPercent);

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].qty += qty;
        return newCart;
      } else {
        return [
          ...prevCart,
          {
            cartItemId: `${product.id}-${firmness}-${size}`,
            productId: product.id,
            id: product.id,
            name: product.name,
            productName: product.name,
            tagline: product.tagline,
            category: product.category,
            firmness,
            size,
            sku: variant?.SKU || `MEL-${(size || "STD").toUpperCase()}-${(firmness || "STD").toUpperCase()}`,
            actualPrice: rawPrice,
            price,
            discountPrice: price,
            qty,
            quantity: qty,
            image: product.images?.[0] || "/asset/img1.jpg"
          }
        ];
      }
    });

    // Async sync with DB API
    try {
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantSize: size,
          variantFirmness: firmness,
          qty,
          actualPrice: product.Actual_Price || product.price,
          discountPercent: product.discountPercent || 10,
        }),
      }).catch(() => {});
    } catch (e) {}
  };

  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
    try {
      fetch(`/api/cart/${encodeURIComponent(cartItemId)}`, { method: "DELETE" }).catch(() => {});
    } catch (e) {}
  };

  const updateQty = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartItemId === cartItemId ? { ...item, qty: newQty, quantity: newQty } : item
      )
    );
    try {
      fetch(`/api/cart/${encodeURIComponent(cartItemId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty: newQty }),
      }).catch(() => {});
    } catch (e) {}
  };

  const clearCart = () => {
    setCart([]);
    try {
      fetch("/api/cart", { method: "DELETE" }).catch(() => {});
    } catch (e) {}
  };

  // Wishlist Actions
  const toggleWishlist = (productId) => {
    if (!isAuthenticated) {
      setAuthModal("login");
      return;
    }

    setWishlist((prevWishlist) => {
      if (prevWishlist.includes(productId)) {
        return prevWishlist.filter((id) => id !== productId);
      } else {
        return [...prevWishlist, productId];
      }
    });
    try {
      fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }).catch(() => {});
    } catch (e) {}
  };

  const moveToCart = (productId, firmness = "Medium", size = "Queen") => {
    const product = getProductById(productId);
    if (!product) return;
    
    const finalFirmness = product.firmnessOptions.includes(firmness) 
      ? firmness 
      : product.firmnessOptions[0] || "Standard";
    const finalSize = product.sizeOptions.includes(size) 
      ? size 
      : product.sizeOptions[0] || "Standard";

    addToCart(product, finalFirmness, finalSize, 1);
    toggleWishlist(productId);
  };

  return (
    <StoreContext.Provider
      value={{
        view,
        setView,
        selectedProductId,
        setSelectedProductId,
        searchQuery,
        setSearchQuery,
        activeFilters,
        setActiveFilters,
        cart,
        wishlist,
        orders,
        products,
        banners,
        activeBanners,
        activeHeroBanners,
        activePromoBanners,
        activeNewArrivalBanners,
        setBanners,
        reviews,
        homepageConfig,
        newArrivalItems,
        bestSellerItems,
        customerOrders: (orders || []).filter((o) => {
          if (!currentCustomer && !currentCustomerId) return false;
          const matchId = currentCustomerId && (o.customerId === currentCustomerId || o.userId === currentCustomerId);
          const matchCustObjId = currentCustomer?.id && (o.customerId === currentCustomer.id || o.userId === currentCustomer.id);
          const matchCustCode = currentCustomer?.customerId && (o.customerId === currentCustomer.customerId);
          const matchEmail = currentCustomer?.email && (o.email?.toLowerCase() === currentCustomer.email.toLowerCase() || o.customerEmail?.toLowerCase() === currentCustomer.email.toLowerCase());
          return Boolean(matchId || matchCustObjId || matchCustCode || matchEmail);
        }),
        checkoutItems,
        setCheckoutItems,
        selectedAddress,
        setSelectedAddress,
        userAddresses,
        saveUserAddress,
        selectedOrderId,
        setSelectedOrderId,
        // Actions
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        toggleWishlist,
        moveToCart,
        navigateTo,
        getProductById,
        placeOrder,
        cancelOrder,
        refreshOrders,
        authModal,
        setAuthModal,
        openAuthModal,
        closeAuthModal,
        categories,
        settings,
        storeSettings: settings,
        updateSettings,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
