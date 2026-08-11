"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { MOCK_PRODUCTS } from "../data/products";
import { MOCK_ORDERS } from "../admin/data/adminMockData";
import { calculateDiscountedPrice } from "../utils/currency";
import { getVariantForSelection } from "../utils/variantHelpers";

const StoreContext = createContext();

export function StoreProvider({ children }) {
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

  // User Commerce State
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(["luxe-hybrid"]);
  const [products] = useState(MOCK_PRODUCTS);
  const [currentCustomerId] = useState("C001");

  // Orders State synchronized with localStorage ("mellosoft_orders")
  const [orders, setOrders] = useState(MOCK_ORDERS);

  // Sync state with localStorage after mount (hydration-safe)
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("mellosoft_orders");
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) setOrders(parsed);
      }

      const savedCart = localStorage.getItem("mellosoft_cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem("mellosoft_wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
  }, []);

  // Window storage sync for cross-tab / Admin updates
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "mellosoft_orders" && e.newValue) {
        try {
          setOrders(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("mellosoft_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("mellosoft_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist:", e);
    }
  }, [wishlist]);

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

  const navigateTo = (newView, productId = null) => {
    if (productId) {
      setSelectedProductId(productId);
    }
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
      // Find index of item with same id, firmness, and size
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
        // Increment quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex].qty += qty;
        return newCart;
      } else {
        // Add new item
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
    
    // Add to cart
    // If the product doesn't support the requested firmness or size, fall back to first available
    const finalFirmness = product.firmnessOptions.includes(firmness) 
      ? firmness 
      : product.firmnessOptions[0] || "Standard";
    const finalSize = product.sizeOptions.includes(size) 
      ? size 
      : product.sizeOptions[0] || "Standard";

    addToCart(product, finalFirmness, finalSize, 1);
    
    // Remove from wishlist
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
