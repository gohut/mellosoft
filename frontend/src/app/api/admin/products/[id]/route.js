import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireAdminPermission } from "../../../../../lib/rbac";
import { adminProductCreateSchema } from "../../../../../lib/validators";

export async function GET(request, { params }) {
  const auth = await requireAdminPermission(request, "products", "view");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { displayOrder: "asc" } },
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        image: product.images[0]?.url || "/asset/img1.jpg",
        images: product.images.map((img) => img.url),
      },
    });
  } catch (error) {
    console.error("Admin product detail error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdminPermission(request, "products", "edit");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const body = await request.json();
    const validation = adminProductCreateSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = validation.data;

    const updated = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          specs: data.specs,
          categoryId: data.categoryId,
          categorySlug: data.categorySlug,
          parentCategorySlug: data.parentCategorySlug,
          badge: data.badge,
          price: data.price,
          actualPrice: data.actualPrice,
          discountPercent: data.discountPercent,
          active: data.active,
          isFeatured: data.isFeatured,
          isNewArrival: data.isNewArrival,
          newArrivalOrder: data.newArrivalOrder,
          isBestSeller: data.isBestSeller,
          construction: data.construction,
          thicknessOptions: data.thicknessOptions,
          sizeOptions: data.sizeOptions,
          dimensions: data.dimensions,
          features: data.features,
        },
      });

      // Update images if provided
      if (Array.isArray(data.images)) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        for (let i = 0; i < data.images.length; i++) {
          await tx.productImage.create({
            data: {
              productId: id,
              url: data.images[i],
              alt: prod.name,
              isPrimary: i === 0,
              displayOrder: i + 1,
            },
          });
        }
      }

      // Update variants if provided
      if (Array.isArray(data.variants)) {
        for (const v of data.variants) {
          if (v.sku) {
            await tx.productVariant.upsert({
              where: { sku: v.sku },
              update: {
                actualPrice: v.actualPrice,
                discountPercent: v.discountPercent || 0,
                discountedPrice: v.discountedPrice || v.actualPrice,
                stock: v.stock,
                threshold: v.threshold || 2,
                status: v.status || "Active",
              },
              create: {
                id: v.id || `VAR-${id}-${v.sku}`,
                sku: v.sku,
                productId: id,
                size: v.size || null,
                dimension: v.dimension || null,
                thickness: v.thickness || null,
                firmness: v.firmness || null,
                actualPrice: v.actualPrice,
                discountPercent: v.discountPercent || 0,
                discountedPrice: v.discountedPrice || v.actualPrice,
                stock: v.stock || 10,
                threshold: v.threshold || 2,
                status: v.status || "Active",
              },
            });
          }
        }
      }

      await tx.auditLog.create({
        data: {
          adminUserId: auth.user.id,
          action: "UPDATE_PRODUCT",
          resource: "products",
          resourceId: id,
          details: { updatedFields: Object.keys(data) },
        },
      });

      return prod;
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Admin product update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdminPermission(request, "products", "delete");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    // Soft delete / archive to protect existing order history
    await prisma.product.update({
      where: { id },
      data: { active: false },
    });

    await prisma.auditLog.create({
      data: {
        adminUserId: auth.user.id,
        action: "ARCHIVE_PRODUCT",
        resource: "products",
        resourceId: id,
      },
    });

    return NextResponse.json({ success: true, message: "Product archived successfully." });
  } catch (error) {
    console.error("Admin product delete error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
