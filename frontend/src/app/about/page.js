"use client";

import React, { useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AboutView from "../../views/AboutView";
import AuthModal from "../../components/AuthModal";

export default function AboutPage() {
  const { setView, authModal } = useStore();

  useEffect(() => {
    setView("about");
  }, [setView]);

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
        <AboutView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
