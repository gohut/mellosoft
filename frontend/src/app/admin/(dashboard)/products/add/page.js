"use client";

import React from "react";
import { useAdmin } from "../../../../../admin/context/AdminContext";
import AddProductView from "../../../../../admin/views/AddProductView";
import AccessDeniedPanel from "../../../../../admin/components/AccessDeniedPanel";

export default function AdminAddProductPage() {
  const { hasPermission } = useAdmin();

  if (!hasPermission("products", "create")) {
    return <AccessDeniedPanel moduleName="Add Product" />;
  }

  return <AddProductView />;
}
