import "./admin-globals.css";
import { AdminProvider } from "../../admin/context/AdminContext";

export const metadata = {
  title: "Mellosoft Admin | Dashboard",
  description: "Manage products, orders, customers and settings for the Mellosoft sleep products store.",
};

export default function AdminLayout({ children }) {
  return (
    <AdminProvider>
      {children}
    </AdminProvider>
  );
}
