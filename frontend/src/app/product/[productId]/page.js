"use client";

import React, { use, useEffect, useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import ProductDetailView from "../../../views/ProductDetailView";
import { useStore } from "../../../context/StoreContext";
import MellosoftLoader from "../../../components/MellosoftLoader";

export default function ProductPage({ params }) {
  const resolvedParams = use(params);
  const { setSelectedProductId, setView, products } = useStore();
  const [ready, setReady] = useState(false);

  let productId = "";
  if (resolvedParams?.productId) {
    try {
      productId = decodeURIComponent(String(resolvedParams.productId)).trim();
    } catch (e) {
      productId = String(resolvedParams.productId).trim();
    }
  }

  useEffect(() => {
    if (productId) {
      setSelectedProductId(productId);
      setView("detail");
    }
    // Products are loaded from context/localStorage; mark ready after mount
    const t = setTimeout(() => setReady(true), 180);
    return () => clearTimeout(t);
  }, [productId, setSelectedProductId, setView]);

  // Also mark ready when products array is populated
  useEffect(() => {
    if (products && products.length > 0) {
      setReady(true);
    }
  }, [products]);

  return (
    <>
      <MellosoftLoader show={!ready} minDisplayMs={350} />
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
        <ProductDetailView productId={productId} />
      </main>
      <Footer />
    </>
  );
}
