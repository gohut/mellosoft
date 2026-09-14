"use client";

import React from "react";
import { useAdmin } from "../../../../admin/context/AdminContext";
import SettingsView from "../../../../admin/views/SettingsView";
import AccessDeniedPanel from "../../../../admin/components/AccessDeniedPanel";

export default function AdminSettingsPage() {
  const { hasPermission } = useAdmin();

  if (!hasPermission("settings", "view")) {
    return <AccessDeniedPanel moduleName="Settings" />;
  }

  return <SettingsView />;
}
