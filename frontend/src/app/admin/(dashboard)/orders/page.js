"use client";

import React from "react";
import { useAdmin } from "../../../../admin/context/AdminContext";
import OrdersView from "../../../../admin/views/OrdersView";
import AccessDeniedPanel from "../../../../admin/components/AccessDeniedPanel";

export default function AdminOrdersPage() {
  const { hasPermission } = useAdmin();

  if (!hasPermission("orders", "view")) {
    return <AccessDeniedPanel moduleName="Orders" />;
  }

  return <OrdersView />;
}
