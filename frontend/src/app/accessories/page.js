"use client";

import React, { useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AccessoriesView from "../../views/AccessoriesView";
import AuthModal from "../../components/AuthModal";

export default function AccessoriesPage() {
  const { setView, authModal } = useStore();

  useEffect(() => {
    setView("accessories");
  }, [setView]);

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
        <AccessoriesView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
