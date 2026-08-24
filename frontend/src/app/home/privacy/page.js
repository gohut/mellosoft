"use client";

import React, { useEffect } from "react";
import { useStore } from "../../../context/StoreContext";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import PrivacyView from "../../../views/PrivacyView";
import AuthModal from "../../../components/AuthModal";

export default function HomePrivacyPage() {
  const { setView, authModal } = useStore();

  useEffect(() => {
    setView("privacy");
  }, [setView]);

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
        <PrivacyView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
