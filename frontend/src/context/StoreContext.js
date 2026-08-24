"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MOCK_PRODUCTS } from "../data/products";
import { MOCK_ORDERS, MOCK_CARTS, MOCK_WISHLISTS, MOCK_BANNERS, MOCK_REVIEWS } from "../admin/data/adminMockData";
import { calculateDiscountedPrice } from "../utils/currency";
import { getVariantForSelection } from "../utils/variantHelpers";
import { ensureProductPricing } from "../utils/pricingEngine";
import { useCustomerAuth } from "./CustomerAuthContext";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const router = useRouter();
  const { currentCustomer, isAuthenticated, setIntendedView, intendedView } = useCustomerAuth();
  
  // Navigation & View State
  const [view, setView] = useState("home");
  const [selectedProductId, setSelectedProductId] = useState("cloudrest");
  
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
  const [wishlist, setWishlist] = useState(["luxe-hybrid"]);
  // Products state is mutable so stock decrements can be applied
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  // Orders State synchronized with localStorage ("mellosoft_orders")
  const [orders, setOrders] = useState(MOCK_ORDERS);

  // Reviews State synchronized with localStorage ("mellosoft_reviews")
  const [reviews, setReviews] = useState(MOCK_REVIEWS);

  const [banners, setBanners] = useState(MOCK_BANNERS);

  // New Arrival Config State synchronized with localStorage ("mellosoft_new_arrivals_config")
  const [newArrivalItems, setNewArrivalItems] = useState([
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
  ]);

  // Best Sellers Config State synchronized with localStorage ("mellosoft_best_sellers_config")
  const [bestSellerItems, setBestSellerItems] = useState([
    { id: "bs-1", productId: "classic-mattress", displayOrder: 1, isActive: true },
    { id: "bs-2", productId: "luxe-hybrid",     displayOrder: 2, isActive: true },
    { id: "bs-3", productId: "ortho-support",   displayOrder: 3, isActive: true },
    { id: "bs-4", productId: "ergo-air",        displayOrder: 4, isActive: true },
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
      { id: "customer-reviews", visible: true, type: "global" },
      { id: "about-us", visible: true, type: "global" },
    ]
  });

  // ─── Checkout Flow State ─────────────────────────────────────────────────────
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [userAddresses, setUserAddresses] = useState({});
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReviews(parsed);
          }
        } else {
          setReviews(MOCK_REVIEWS);
        }
      } catch (e) {
        console.error("Failed to load reviews from localStorage:", e);
      }

      // Sync banners
      try {
        const savedBanners = localStorage.getItem("mellosoft_banners");
        if (savedBanners) {
          const parsed = JSON.parse(savedBanners);
          if (Array.isArray(parsed) && parsed.length > 0) setBanners(parsed);
        } else {
          setBanners(MOCK_BANNERS);
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
            setHomepageConfig(parsed);
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
            setNewArrivalItems(parsed.map((item, idx) => ({ ...item, displayOrder: idx + 1 })));
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
            setBestSellerItems(parsed.map((item, idx) => ({ ...item, displayOrder: idx + 1 })));
          }
        }
      } catch (e) {
        console.error("Failed to load best sellers config from localStorage:", e);
      }

      // Sync products (merging stored overrides with master catalogue)
      try {
        const savedProducts = localStorage.getItem("mellosoft_products") || localStorage.getItem("mellosoft_admin_products");
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const parsedIdMap = new Map(parsed.map((p) => [p.id, p]));
            const merged = MOCK_PRODUCTS.map((masterItem) => {
              const stored = parsedIdMap.get(masterItem.id);
              const combined = {
                ...masterItem,
                ...(stored || {}),
                isNewArrival: stored?.isNewArrival ?? masterItem.isNewArrival ?? false,
                newArrivalOrder: stored?.newArrivalOrder ?? masterItem.newArrivalOrder ?? 999
              };
              return ensureProductPricing(combined);
            });
            setProducts(merged);
          }
        }
      } catch (e) {
        console.error("Failed to load products from localStorage:", e);
      }

      // Sync orders
      try {
        const savedOrders = localStorage.getItem("mellosoft_orders");
        if (savedOrders) {
          const parsed = JSON.parse(savedOrders);
          if (Array.isArray(parsed) && parsed.length > 0) setOrders(parsed);
        }
      } catch (e) {
        console.error("Failed to load orders from localStorage:", e);
      }
    };

    syncStore();
    window.addEventListener("storage", syncStore);
    window.addEventListener("mellosoft_orders_updated", syncStore);

    // Load orders
    try {
      const savedOrders = localStorage.getItem("mellosoft_orders");
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) setOrders(parsed);
      }
    } catch (e) {
      console.error("Failed to load orders from localStorage:", e);
    }

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

    // Load products (merging any admin-updated stock levels with master catalogue)
    try {
      const savedProducts = localStorage.getItem("mellosoft_products");
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const parsedIdMap = new Map(parsed.map((p) => [p.id, p]));
          const merged = MOCK_PRODUCTS.map((masterItem) => {
            const stored = parsedIdMap.get(masterItem.id);
            return {
              ...masterItem,
              ...(stored || {}),
              isNewArrival: stored?.isNewArrival ?? masterItem.isNewArrival ?? false,
              newArrivalOrder: stored?.newArrivalOrder ?? masterItem.newArrivalOrder ?? 999
            };
          });
          setProducts(merged);
        }
      }
    } catch (e) {
      console.error("Failed to load products from localStorage:", e);
    }

    return () => {
      window.removeEventListener("storage", syncStore);
      window.removeEventListener("mellosoft_orders_updated", syncStore);
    };
  }, []);

  // Sync customer-specific cart & wishlist whenever currentCustomerId changes
  useEffect(() => {
    if (!currentCustomerId) return;
    try {
      // Load Cart
      const savedCart = localStorage.getItem(`mellosoft_cart_${currentCustomerId}`);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        const mockCustomerCart = (MOCK_CARTS || [])
          .filter((item) => item.customerId === currentCustomerId)
          .map((item) => {
            const prod = MOCK_PRODUCTS.find((p) => p.id === item.productId);
            return {
              cartItemId: item.cartItemId,
              id: item.productId,
              name: prod?.name || item.productId,
              tagline: prod?.tagline || "",
              firmness: item.variantFirmness,
              size: item.variantSize,
              price: item.actualPrice,
              qty: item.quantity,
              image: prod?.images?.[0] || "/asset/img1.jpg"
            };
          });
        setCart(mockCustomerCart.length > 0 ? mockCustomerCart : []);
      }

      // Load Wishlist
      const savedWishlist = localStorage.getItem(`mellosoft_wishlist_${currentCustomerId}`);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      } else {
        const mockCustomerWishlist = (MOCK_WISHLISTS || [])
          .filter((w) => w.customerId === currentCustomerId)
          .map((w) => w.productId);
        setWishlist(mockCustomerWishlist.length > 0 ? mockCustomerWishlist : ["luxe-hybrid"]);
      }
    } catch (e) {
      console.error("Failed to load customer cart/wishlist:", e);
    }
  }, [currentCustomerId]);

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
    setOrders((prevOrders) => {
      const updated = [newOrder, ...prevOrders];
      try {
        localStorage.setItem("mellosoft_orders", JSON.stringify(updated));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("mellosoft_orders_updated"));
        }
      } catch (e) {
        console.error("Failed to save orders to localStorage on placeOrder:", e);
      }
      return updated;
    });

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
        window.dispatchEvent(new CustomEvent("mellosoft_customers_updated"));
      } catch (e) {
        console.error("Failed to sync customer on placeOrder:", e);
      }
    }

    setCart([]);
    setCheckoutItems([]);
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
  };

  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
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
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist Actions
  const toggleWishlist = (productId) => {
    setWishlist((prevWishlist) => {
      if (prevWishlist.includes(productId)) {
        return prevWishlist.filter((id) => id !== productId);
      } else {
        return [...prevWishlist, productId];
      }
    });
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
        currentCustomerId,
        customerOrders: (orders || []).filter((o) => o.customerId === currentCustomerId || o.userId === currentCustomerId || (currentCustomer?.email && o.email?.toLowerCase() === currentCustomer.email.toLowerCase())),
        // Checkout flow state
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
