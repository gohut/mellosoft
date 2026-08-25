"use client";

import React, { useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ContactView from "../../views/ContactView";
import AuthModal from "../../components/AuthModal";

export default function ContactPage() {
  const { setView, authModal } = useStore();

  useEffect(() => {
    setView("contact");
  }, [setView]);

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
        <ContactView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
