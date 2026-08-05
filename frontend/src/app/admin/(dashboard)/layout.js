import "../admin-globals.css";
import { AdminProvider } from "../../../admin/context/AdminContext";
import { AdminAuthProvider } from "../../../context/AdminAuthContext";
import ProtectedRoute from "../../../components/admin/ProtectedRoute";

export const metadata = {
  title: "Mellosoft Admin | Dashboard",
  description: "Manage products, orders, customers and settings for the Mellosoft sleep products store.",
};

export default function AdminDashboardLayout({ children }) {
  return (
    <AdminAuthProvider>
      <ProtectedRoute>
        <AdminProvider>
          {children}
        </AdminProvider>
      </ProtectedRoute>
    </AdminAuthProvider>
  );
}
