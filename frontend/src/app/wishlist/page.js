"use client";

import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import WishlistView from "../../views/WishlistView";
import AuthModal from "../../components/AuthModal";
import { useStore } from "../../context/StoreContext";

export default function WishlistPage() {
  const { authModal } = useStore();

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
        <WishlistView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
