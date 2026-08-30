"use client";

import React, { useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import OrderConfirmationView from "../../views/OrderConfirmationView";
import AuthModal from "../../components/AuthModal";

export default function OrderConfirmationRootPage() {
  const { setView, authModal } = useStore();

  useEffect(() => {
    setView("confirmation");
  }, [setView]);

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
        <OrderConfirmationView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
