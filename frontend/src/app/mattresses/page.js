"use client";

import React, { useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CatalogView from "../../views/CatalogView";
import AuthModal from "../../components/AuthModal";

export default function MattressesPage() {
  const { setView, setActiveFilters, authModal } = useStore();

  useEffect(() => {
    setActiveFilters((prev) => ({ ...prev, category: "mattress" }));
    setView("catalog");
  }, [setView, setActiveFilters]);

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
        <CatalogView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
