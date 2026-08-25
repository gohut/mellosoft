"use client";

import React, { useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BedFramesView from "../../views/BedFramesView";
import AuthModal from "../../components/AuthModal";

export default function BedFramesPage() {
  const { setView, authModal } = useStore();

  useEffect(() => {
    setView("bed-frames");
  }, [setView]);

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
        <BedFramesView categoryParam="all" />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
