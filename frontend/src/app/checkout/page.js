"use client";

import React, { useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CheckoutView from "../../views/CheckoutView";
import AuthModal from "../../components/AuthModal";

export default function CheckoutPage() {
  const { setView, authModal } = useStore();

  useEffect(() => {
    setView("checkout");
  }, [setView]);

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "transparent" }}>
        <CheckoutView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
