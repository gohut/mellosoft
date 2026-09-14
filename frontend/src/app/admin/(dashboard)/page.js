"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "../../../admin/context/AdminContext";
import DashboardView from "../../../admin/views/DashboardView";
import AccessDeniedPanel from "../../../admin/components/AccessDeniedPanel";

export default function AdminDashboardPage() {
  const { hasPermission, getFirstAllowedAdminView, currentUserRole } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!currentUserRole) return;
    const canAccessDashboard = hasPermission("dashboard", "view");
    if (!canAccessDashboard) {
      const firstAllowed = getFirstAllowedAdminView ? getFirstAllowedAdminView() : "products";
      if (firstAllowed && firstAllowed !== "dashboard") {
        router.replace(`/admin/${firstAllowed}`);
      }
    }
  }, [currentUserRole, hasPermission, getFirstAllowedAdminView, router]);

  if (!hasPermission("dashboard", "view")) {
    return <AccessDeniedPanel moduleName="Dashboard" />;
  }

  return <DashboardView />;
}
