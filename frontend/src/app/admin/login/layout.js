import { AdminAuthProvider } from "../../../context/AdminAuthContext";

export const metadata = {
  title: "Mellosoft Admin | Login",
  description: "Sign in to the Mellosoft Admin Portal.",
};

/**
 * Login layout — provides auth context but does NOT apply ProtectedRoute.
 * This is intentionally separate from the (dashboard) layout.
 */
export default function AdminLoginLayout({ children }) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
}
