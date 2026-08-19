"use client";

import React, { useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import OrdersView from "../../views/OrdersView";
import AuthModal from "../../components/AuthModal";

export default function OrdersPage() {
  const { setView, authModal } = useStore();

  useEffect(() => {
    setView("orders");
  }, [setView]);

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "transparent" }}>
        <OrdersView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
