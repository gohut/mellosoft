"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MOCK_PRODUCTS } from "../data/products";

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

  // Cart & Wishlist State
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart and wishlist from localStorage on mount (hydration-safe)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedCart = localStorage.getItem("mellosoft_cart");
        if (savedCart) setCart(JSON.parse(savedCart));

        const savedWishlist = localStorage.getItem("mellosoft_wishlist");
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Failed to load store state from localStorage", e);
      }
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("mellosoft_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart, isHydrated]);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("mellosoft_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  }, [wishlist, isHydrated]);

  // Helper: Get product details by ID
  const getProductById = (id) => MOCK_PRODUCTS.find((p) => p.id === id);

  // Cart Actions
  const addToCart = (product, firmness, size, qty = 1) => {
    setCart((prevCart) => {
      // Find index of item with same id, firmness, and size
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.id === product.id &&
          item.firmness === firmness &&
          item.size === size
      );

      // Determine price for the selected size
      const price = product.sizePrices && product.sizePrices[size] 
        ? product.sizePrices[size] 
        : product.price;

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

  // View helper
  const navigateTo = (newView, productId = null) => {
    setView(newView);
    if (productId) {
      setSelectedProductId(productId);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        toggleWishlist,
        moveToCart,
        navigateTo,
        getProductById
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
