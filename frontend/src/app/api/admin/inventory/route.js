import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireAdminPermission } from "../../../../lib/rbac";

export async function GET(request) {
  const auth = await requireAdminPermission(request, "products", "view");
  if (!auth.authorized) return auth.response;

  try {
    const variants = await prisma.productVariant.findMany({
      orderBy: { productId: "asc" },
      include: {
        product: { select: { id: true, name: true, categorySlug: true } },
      },
    });

    const inventoryList = variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      productId: v.productId,
      productName: v.product?.name || "Product",
      category: v.product?.categorySlug,
      size: v.size,
      thickness: v.thickness,
      firmness: v.firmness,
      dimension: v.dimension,
      stock: v.stock,
      threshold: v.threshold,
      actualPrice: v.actualPrice,
      discountedPrice: v.discountedPrice,
      status: v.stock > v.threshold ? "In Stock" : v.stock > 0 ? "Low Stock" : "Out of Stock",
    }));

    return NextResponse.json({ success: true, inventory: inventoryList });
  } catch (error) {
    console.error("Inventory GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = await requireAdminPermission(request, "products", "edit");
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { variantId, sku, stock, threshold } = body;

    const where = variantId ? { id: variantId } : sku ? { sku } : null;
    if (!where) {
      return NextResponse.json({ success: false, error: "variantId or sku required" }, { status: 400 });
    }

    const updateData = {};
    if (stock !== undefined) updateData.stock = Math.max(0, Number(stock));
    if (threshold !== undefined) updateData.threshold = Math.max(0, Number(threshold));

    const updated = await prisma.productVariant.update({
      where,
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        adminUserId: auth.user.id,
        action: "UPDATE_INVENTORY",
        resource: "inventory",
        resourceId: updated.id,
        details: { sku: updated.sku, stock: updated.stock, threshold: updated.threshold },
      },
    });

    return NextResponse.json({ success: true, variant: updated });
  } catch (error) {
    console.error("Inventory PUT error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
