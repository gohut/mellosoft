"use client";

import React, { Suspense } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoginView from "../../views/LoginView";

export default function LoginPage() {
  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF", minHeight: "80vh" }}>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginView />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
