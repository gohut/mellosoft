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
import LoginView from "../views/LoginView";
import SignupView from "../views/SignupView";
import ForgotPasswordView from "../views/ForgotPasswordView";

export default function Home() {
  const { view } = useStore();

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
      case "login":
        return <LoginView />;
      case "signup":
        return <SignupView />;
      case "forgot-password":
        return <ForgotPasswordView />;
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
    </>
  );
}

const mainContentStyle = {
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  width: "100%",
  backgroundColor: "#F7F7F2"
};
