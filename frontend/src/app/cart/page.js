"use client";

import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CartView from "../../views/CartView";
import AuthModal from "../../components/AuthModal";
import { useStore } from "../../context/StoreContext";

export default function CartPage() {
  const { authModal } = useStore();

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
        <CartView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
