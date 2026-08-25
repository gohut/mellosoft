"use client";

import React, { use } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import AccessoriesView from "../../../views/AccessoriesView";
import AuthModal from "../../../components/AuthModal";
import { useStore } from "../../../context/StoreContext";

export default function AccessoryCategoryPage({ params }) {
  const resolvedParams = use(params);
  const { authModal } = useStore();
  
  let categoryParam = "all";
  if (resolvedParams?.category) {
    try {
      categoryParam = decodeURIComponent(resolvedParams.category).trim().toLowerCase();
    } catch (e) {
      categoryParam = resolvedParams.category.toLowerCase();
    }
  }

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
        <AccessoriesView categoryParam={categoryParam} />
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
