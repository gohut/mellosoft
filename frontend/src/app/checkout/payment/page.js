"use client";

import React, { useEffect } from "react";
import { useStore } from "../../../context/StoreContext";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import PaymentView from "../../../views/PaymentView";
import AuthModal from "../../../components/AuthModal";

export default function PaymentPage() {
  const { setView, authModal } = useStore();

  useEffect(() => {
    setView("payment");
  }, [setView]);

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "transparent" }}>
        <PaymentView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
