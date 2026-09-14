"use client";

import React from "react";
import { useAdmin } from "../../../../admin/context/AdminContext";
import UsersAndRolesView from "../../../../admin/views/UsersAndRolesView";
import AccessDeniedPanel from "../../../../admin/components/AccessDeniedPanel";

export default function AdminUsersRolesPage() {
  const { hasPermission } = useAdmin();

  if (!hasPermission("users", "view") && !hasPermission("roles", "view")) {
    return <AccessDeniedPanel moduleName="Users & Roles" />;
  }

  return <UsersAndRolesView />;
}
