"use client";

import React, { useEffect } from "react";
import { useStore } from "../../../context/StoreContext";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import CancellationPolicyView from "../../../views/CancellationPolicyView";
import AuthModal from "../../../components/AuthModal";

export default function HomeCancellationPolicyPage() {
  const { setView, authModal } = useStore();

  useEffect(() => {
    setView("cancellation-policy");
  }, [setView]);

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
        <CancellationPolicyView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
