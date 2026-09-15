"use client";

import React from "react";
import { useAdmin } from "../../../../admin/context/AdminContext";
import InventoryView from "../../../../admin/views/InventoryView";
import AccessDeniedPanel from "../../../../admin/components/AccessDeniedPanel";

export default function AdminInventoryPage() {
  const { hasPermission } = useAdmin();

  if (!hasPermission("products", "view")) {
    return <AccessDeniedPanel moduleName="Inventory" />;
  }

  return <InventoryView />;
}
