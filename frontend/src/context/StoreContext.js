"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { MOCK_PRODUCTS } from "../data/products";
import { MOCK_ORDERS, MOCK_CARTS, MOCK_WISHLISTS, MOCK_BANNERS } from "../admin/data/adminMockData";
import { calculateDiscountedPrice } from "../utils/currency";
import { getVariantForSelection } from "../utils/variantHelpers";
import { useCustomerAuth } from "./CustomerAuthContext";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const { currentCustomer, isAuthenticated, setIntendedView, intendedView } = useCustomerAuth();
  
  // Navigation & View State
  const [view, setView] = useState("home");
  const [selectedProductId, setSelectedProductId] = useState("classic-mattress");
  
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
  const [products] = useState(MOCK_PRODUCTS);

  // Orders State synchronized with localStorage ("mellosoft_orders")
  const [orders, setOrders] = useState(MOCK_ORDERS);

  // Promotional Banners State synchronized with localStorage ("mellosoft_banners")
  const [banners, setBanners] = useState(MOCK_BANNERS);

  // Active banners filtered by status and sorted by displayOrder
  const activeBanners = (banners || [])
    .filter((b) => b.isActive !== false && b.status !== "Inactive" && b.status !== "inactive")
    .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

  // Hydration-safe initial loading of orders and banners from localStorage
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("mellosoft_orders");
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) setOrders(parsed);
      }
    } catch (e) {
      console.error("Failed to load orders from localStorage:", e);
    }

    try {
      const savedBanners = localStorage.getItem("mellosoft_banners");
      if (savedBanners) {
        const parsed = JSON.parse(savedBanners);
        if (Array.isArray(parsed) && parsed.length > 0) setBanners(parsed);
      }
    } catch (e) {
      console.error("Failed to load banners from localStorage:", e);
    }
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

  const navigateTo = (newView, productId = null) => {
    if (productId) {
      setSelectedProductId(productId);
    }

    // Modal popup views
    if (newView === "login" || newView === "signup" || newView === "forgot-password") {
      setAuthModal(newView);
      return;
    }

    // Auth protection for customer-specific pages if accessing while logged out
    const protectedViews = ["orders", "profile"];
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = (newOrder) => {
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
  };

  const cancelOrder = (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === orderId ? { ...o, orderStatus: "Cancelled" } : o
      )
    );
  };

  const getProductById = (id) => {
    return products.find((p) => p.id === id);
  };

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
            id: product.id,
            name: product.name,
            tagline: product.tagline,
            firmness,
            size,
            price,
            qty,
            image: product.images[0]
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
        item.cartItemId === cartItemId ? { ...item, qty: newQty } : item
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
        banners,
        activeBanners,
        setBanners,
        currentCustomerId,
        customerOrders: (orders || []).filter((o) => o.customerId === currentCustomerId),
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
