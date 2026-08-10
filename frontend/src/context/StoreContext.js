"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MOCK_PRODUCTS } from "../data/products";
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
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  // Sync with localStorage on client load
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("mellosoft_cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem("mellosoft_wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
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

  // Actions & Handlers
  const navigateTo = (newView, productId = null) => {
    if (productId) {
      setSelectedProductId(productId);
    }
    setView(newView);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
