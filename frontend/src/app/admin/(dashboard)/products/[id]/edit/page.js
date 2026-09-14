"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAdmin } from "../../../../../../admin/context/AdminContext";
import EditProductView from "../../../../../../admin/views/EditProductView";
import AccessDeniedPanel from "../../../../../../admin/components/AccessDeniedPanel";

export default function AdminEditProductPage() {
  const { hasPermission, setSelectedProductId } = useAdmin();
  const params = useParams();
  const productId = params?.id;

  useEffect(() => {
    if (productId && typeof setSelectedProductId === "function") {
      setSelectedProductId(productId);
    }
  }, [productId, setSelectedProductId]);

  if (!hasPermission("products", "edit")) {
    return <AccessDeniedPanel moduleName="Edit Product" />;
  }

  return <EditProductView productId={productId} />;
}
