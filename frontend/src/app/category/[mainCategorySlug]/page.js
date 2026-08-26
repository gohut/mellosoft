"use client";

import React, { use, useMemo, useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import AuthModal from "../../../components/AuthModal";
import EmptyState from "../../../components/EmptyState";
import ProductCard from "../../../components/ProductCard";
import { useStore } from "../../../context/StoreContext";
import { isProductInCategory, getCategoryCount } from "../../../utils/productHelpers";
import { ensureProductPricing } from "../../../utils/pricingEngine";

/**
 * Generic storefront catalogue page for any admin-created main category.
 * Route: /category/[mainCategorySlug]
 */
export default function GenericCategoryPage({ params }) {
  const resolvedParams = use(params);
  const { authModal, products, categories } = useStore();

  const mainCategorySlug = useMemo(() => {
    try {
      return decodeURIComponent(resolvedParams?.mainCategorySlug || "").trim().toLowerCase();
    } catch {
      return (resolvedParams?.mainCategorySlug || "").toLowerCase();
    }
  }, [resolvedParams]);

  // Find main category definition from store context
  const mainCategory = useMemo(() => {
    const cats = Array.isArray(categories) ? categories : [];
    return cats.find((c) =>
      c.slug === mainCategorySlug ||
      c.id?.toLowerCase() === mainCategorySlug ||
      (c.name && c.name.toLowerCase().replace(/\s+/g, "-") === mainCategorySlug)
    ) || null;
  }, [categories, mainCategorySlug]);

  const subcategoryList = useMemo(() => {
    if (!mainCategory) return [];
    if (Array.isArray(mainCategory.subcategories)) return mainCategory.subcategories.filter((s) => s.active !== false);
    const cats = Array.isArray(categories) ? categories : [];
    return cats.filter((c) => c.parentId === mainCategory.id && !c.isParent);
  }, [mainCategory, categories]);

  const [selectedCategory, setSelectedCategory] = useState("all");

  // All products in this main category
  const categoryProducts = useMemo(() => {
    const allProds = (products && products.length > 0) ? products : [];
    if (!mainCategory) return [];
    return allProds
      .filter((p) => isProductInCategory(p, mainCategory.slug || mainCategory.id))
      .map((p) => ensureProductPricing(p));
  }, [products, mainCategory]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return categoryProducts;
    return categoryProducts.filter((p) => isProductInCategory(p, selectedCategory));
  }, [categoryProducts, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts = { all: categoryProducts.length };
    subcategoryList.forEach((c) => {
      counts[c.slug || c.id] = getCategoryCount(categoryProducts, c.slug || c.id);
    });
    return counts;
  }, [categoryProducts, subcategoryList]);

  if (!mainCategory) {
    return (
      <>
        <Header />
        <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#FFFFFF" }}>
          <div style={{ padding: "80px 24px", textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
            <EmptyState
              iconType="search"
              title="Category Not Found"
              message={`The category "${mainCategorySlug}" does not exist or has not been published yet.`}
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

          {/* Category Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              style={{ ...pillStyle, backgroundColor: selectedCategory === "all" ? "#1B1F8C" : "#FFFFFF", color: selectedCategory === "all" ? "#FFFFFF" : "#14151A", borderColor: selectedCategory === "all" ? "#1B1F8C" : "#E7E7E2" }}
            >
              All {mainCategory.name} ({categoryCounts.all})
            </button>
            {subcategoryList.map((cat) => {
              const slug = cat.slug || cat.id;
              const isSelected = selectedCategory === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setSelectedCategory(slug)}
                  style={{ ...pillStyle, backgroundColor: isSelected ? "#1B1F8C" : "#FFFFFF", color: isSelected ? "#FFFFFF" : "#14151A", borderColor: isSelected ? "#1B1F8C" : "#E7E7E2" }}
                >
                  {cat.name} ({categoryCounts[slug] || 0})
                </button>
              );
            })}
          </div>

          {/* Results Count */}
          <div style={{ fontSize: "13px", color: "#6B6B75", marginBottom: "24px" }}>
            Showing <strong>{filteredProducts.length}</strong> {mainCategory.name.toLowerCase()} products
          </div>

          {/* Product Grid */}
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
                title={`No ${mainCategory.name} products found`}
                message="No products have been added to this category yet."
                actionLabel="Reset Filters"
                onAction={() => setSelectedCategory("all")}
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

const pillStyle = {
  padding: "8px 16px",
  borderRadius: "999px",
  borderWidth: "1.5px",
  borderStyle: "solid",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "all 0.2s ease",
  background: "none"
};
