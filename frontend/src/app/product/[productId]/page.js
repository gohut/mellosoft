"use client";

import React, { use, useEffect } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import ProductDetailView from "../../../views/ProductDetailView";
import { useStore } from "../../../context/StoreContext";

export default function ProductPage({ params }) {
  const resolvedParams = use(params);
  const { setSelectedProductId, setView } = useStore();

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
  }, [productId, setSelectedProductId, setView]);

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "transparent" }}>
        <ProductDetailView productId={productId} />
      </main>
      <Footer />
    </>
  );
}
