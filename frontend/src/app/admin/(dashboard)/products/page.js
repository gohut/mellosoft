"use client";

import React from "react";
import { useAdmin } from "../../../../admin/context/AdminContext";
import ProductsView from "../../../../admin/views/ProductsView";
import AccessDeniedPanel from "../../../../admin/components/AccessDeniedPanel";

export default function AdminProductsPage() {
  const { hasPermission } = useAdmin();

  if (!hasPermission("products", "view")) {
    return <AccessDeniedPanel moduleName="Products" />;
  }

  return <ProductsView />;
}
