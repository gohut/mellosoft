"use client";

import React from "react";
import { useAdmin } from "../../../../admin/context/AdminContext";
import CustomersView from "../../../../admin/views/CustomersView";
import AccessDeniedPanel from "../../../../admin/components/AccessDeniedPanel";

export default function AdminCustomersPage() {
  const { hasPermission } = useAdmin();

  if (!hasPermission("customers", "view")) {
    return <AccessDeniedPanel moduleName="Customers" />;
  }

  return <CustomersView />;
}
