"use client";

import React, { useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ReturnPolicyView from "../../views/ReturnPolicyView";
import AuthModal from "../../components/AuthModal";

export default function ReturnPolicyPage() {
  const { setView, authModal } = useStore();

  useEffect(() => {
    setView("return-policy");
  }, [setView]);

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "transparent" }}>
        <ReturnPolicyView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
