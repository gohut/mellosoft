"use client";

import React from "react";
import { useAdmin } from "../../../../admin/context/AdminContext";
import ReviewsView from "../../../../admin/views/ReviewsView";
import AccessDeniedPanel from "../../../../admin/components/AccessDeniedPanel";

export default function AdminReviewsPage() {
  const { hasPermission } = useAdmin();

  if (!hasPermission("reviews", "view")) {
    return <AccessDeniedPanel moduleName="Reviews" />;
  }

  return <ReviewsView />;
}
