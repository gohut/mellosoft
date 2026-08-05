"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import AdminLoginForm from "../../../components/admin/AdminLoginForm";

/**
 * /admin/login
 *
 * If the user is already authenticated, redirect them straight to /admin.
 * Otherwise, render the login form.
 */
export default function AdminLoginPage() {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/admin");
    }
  }, [isAuthenticated, loading, router]);

  // Don't render the form while we're checking auth state
  if (loading) return null;

  // If already logged in, nothing to show (redirect is in progress)
  if (isAuthenticated) return null;

  return <AdminLoginForm />;
}
