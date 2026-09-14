"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAdmin } from "../../../../../admin/context/AdminContext";
import AdminProductDetailView from "../../../../../admin/views/AdminProductDetailView";
import AccessDeniedPanel from "../../../../../admin/components/AccessDeniedPanel";

export default function AdminProductDetailPage() {
  const { hasPermission, setSelectedProductId } = useAdmin();
  const params = useParams();
  const productId = params?.id;

  useEffect(() => {
    if (productId && typeof setSelectedProductId === "function") {
      setSelectedProductId(productId);
    }
  }, [productId, setSelectedProductId]);

  if (!hasPermission("products", "view")) {
    return <AccessDeniedPanel moduleName="Products" />;
  }

  return <AdminProductDetailView productId={productId} />;
}
