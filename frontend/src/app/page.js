"use client";

import { useStore } from "../context/StoreContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HomeView from "../views/HomeView";
import CatalogView from "../views/CatalogView";
import ProductDetailView from "../views/ProductDetailView";
import CartView from "../views/CartView";
import WishlistView from "../views/WishlistView";
import SearchView from "../views/SearchView";
import OrdersView from "../views/OrdersView";
import ProfileView from "../views/ProfileView";
import TermsView from "../views/TermsView";
import PrivacyView from "../views/PrivacyView";
import ReturnPolicyView from "../views/ReturnPolicyView";
import CancellationPolicyView from "../views/CancellationPolicyView";
import AuthModal from "../components/AuthModal";

export default function Home() {
  const { view, authModal } = useStore();

  const renderView = () => {
    switch (view) {
      case "home":
        return <HomeView />;
      case "catalog":
        return <CatalogView />;
      case "detail":
        return <ProductDetailView />;
      case "cart":
        return <CartView />;
      case "wishlist":
        return <WishlistView />;
      case "orders":
        return <OrdersView />;
      case "search":
        return <SearchView />;
      case "profile":
        return <ProfileView />;
      case "terms":
        return <TermsView />;
      case "privacy":
        return <PrivacyView />;
      case "return-policy":
        return <ReturnPolicyView />;
      case "cancellation-policy":
        return <CancellationPolicyView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <>
      <Header />
      <main style={mainContentStyle}>
        {renderView()}
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
