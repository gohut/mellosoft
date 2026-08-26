"use client";

import React, { use, useMemo } from "react";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import AuthModal from "../../../../components/AuthModal";
import EmptyState from "../../../../components/EmptyState";
import ProductCard from "../../../../components/ProductCard";
import { useStore } from "../../../../context/StoreContext";
import { isProductInCategory } from "../../../../utils/productHelpers";
import { ensureProductPricing } from "../../../../utils/pricingEngine";

/**
 * Generic storefront subcategory page for any admin-created main category.
 * Route: /category/[mainCategorySlug]/[subcategorySlug]
 */
export default function GenericSubcategoryPage({ params }) {
  const resolvedParams = use(params);
  const { authModal, products, categories } = useStore();

  const mainCategorySlug = useMemo(() => {
    try { return decodeURIComponent(resolvedParams?.mainCategorySlug || "").trim().toLowerCase(); }
    catch { return (resolvedParams?.mainCategorySlug || "").toLowerCase(); }
  }, [resolvedParams]);

  const subcategorySlug = useMemo(() => {
    try { return decodeURIComponent(resolvedParams?.subcategorySlug || "").trim().toLowerCase(); }
    catch { return (resolvedParams?.subcategorySlug || "").toLowerCase(); }
  }, [resolvedParams]);

  const mainCategory = useMemo(() => {
    const cats = Array.isArray(categories) ? categories : [];
    return cats.find((c) => c.slug === mainCategorySlug || c.id?.toLowerCase() === mainCategorySlug) || null;
  }, [categories, mainCategorySlug]);

  const subcategory = useMemo(() => {
    if (!mainCategory) return null;
    const subs = Array.isArray(mainCategory.subcategories) ? mainCategory.subcategories : [];
    return subs.find((s) => s.slug === subcategorySlug || s.id?.toLowerCase() === subcategorySlug) || null;
  }, [mainCategory, subcategorySlug]);

  const filteredProducts = useMemo(() => {
    const allProds = (products && products.length > 0) ? products : [];
    return allProds
      .filter((p) => isProductInCategory(p, subcategorySlug))
      .map((p) => ensureProductPricing(p));
  }, [products, subcategorySlug]);

  if (!mainCategory || !subcategory) {
    return (
      <>
        <Header />
        <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
          <div style={{ padding: "80px 24px", textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
            <EmptyState
              iconType="search"
              title="Category Not Found"
              message={`The subcategory "${subcategorySlug}" does not exist.`}
              actionLabel="Go Home"
              onAction={() => { if (typeof window !== "undefined") window.location.href = "/"; }}
            />
          </div>
        </main>
        <Footer />
        {authModal && <AuthModal type={authModal} />}
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 24px 80px 24px", width: "100%" }}>
          <div style={{ fontSize: "13px", color: "#6B6B75", marginBottom: "24px" }}>
            Showing <strong>{filteredProducts.length}</strong> {subcategory.name.toLowerCase()} products
          </div>
          {filteredProducts.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {filteredProducts.map((item) => (
                <div key={item.id} style={{ height: "100%" }}>
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <EmptyState
                iconType="search"
                title={`No ${subcategory.name} products found`}
                message="No products have been added to this subcategory yet."
                actionLabel="View All"
                onAction={() => { if (typeof window !== "undefined") window.history.back(); }}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
      {authModal && <AuthModal type={authModal} />}
    </>
  );
}
