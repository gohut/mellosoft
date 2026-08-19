"use client";

import React, { useEffect, use } from "react";
import { useStore } from "../../../context/StoreContext";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import ProductDetailView from "../../../views/ProductDetailView";
import AuthModal from "../../../components/AuthModal";

export default function ProductPage({ params }) {
  const resolvedParams = use(params);
  const { setSelectedProductId, setView, authModal } = useStore();

  useEffect(() => {
    if (resolvedParams?.productId) {
      setSelectedProductId(resolvedParams.productId);
      setView("detail");
    }
  }, [resolvedParams, setSelectedProductId, setView]);

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "transparent" }}>
        <ProductDetailView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
