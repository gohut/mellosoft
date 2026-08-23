"use client";

import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HomeView from "../views/HomeView";
import AuthModal from "../components/AuthModal";
import { useStore } from "../context/StoreContext";

export default function Home() {
  const { authModal } = useStore();

  return (
    <>
      <Header />
      <main style={mainContentStyle}>
        <HomeView />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}

const mainContentStyle = {
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  width: "100%",
  backgroundColor: "transparent"
};
