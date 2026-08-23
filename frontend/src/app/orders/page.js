"use client";

import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import OrdersView from "../../views/OrdersView";
import AuthModal from "../../components/AuthModal";
import { useStore } from "../../context/StoreContext";

export default function OrdersPage() {
  const { authModal } = useStore();

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
        <OrdersView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
