"use client";

import React from "react";
import { useAdmin } from "../../../../admin/context/AdminContext";
import CategoriesView from "../../../../admin/views/CategoriesView";
import AccessDeniedPanel from "../../../../admin/components/AccessDeniedPanel";

export default function AdminCategoriesPage() {
  const { hasPermission } = useAdmin();

  if (!hasPermission("products", "view")) {
    return <AccessDeniedPanel moduleName="Categories" />;
  }

  return <CategoriesView />;
}
