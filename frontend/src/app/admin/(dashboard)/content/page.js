"use client";

import React from "react";
import { useAdmin } from "../../../../admin/context/AdminContext";
import ContentView from "../../../../admin/views/ContentView";
import AccessDeniedPanel from "../../../../admin/components/AccessDeniedPanel";

export default function AdminContentPage() {
  const { hasPermission } = useAdmin();

  if (!hasPermission("content", "view")) {
    return <AccessDeniedPanel moduleName="Content" />;
  }

  return <ContentView />;
}
