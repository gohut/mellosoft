import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireAdminPermission } from "../../../../lib/rbac";
import { adminProductCreateSchema } from "../../../../lib/validators";

export async function GET(request) {
  const auth = await requireAdminPermission(request, "products", "view");
  if (!auth.authorized) return auth.response;

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { orderBy: { displayOrder: "asc" } },
        variants: true,
      },
    });

    const formatted = products.map((p) => ({
      ...p,
      image: p.images[0]?.url || "/asset/img1.jpg",
      images: p.images.map((img) => img.url),
    }));

    return NextResponse.json({ success: true, products: formatted });
  } catch (error) {
    console.error("Admin products GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdminPermission(request, "products", "create");
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const validation = adminProductCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check unique ID / slug
    const existing = await prisma.product.findFirst({
      where: { OR: [{ id: data.id }, { productId: data.productId }] },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A product with this ID or Product Code already exists." },
        { status: 409 }
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          id: data.id,
          productId: data.productId,
          name: data.name,
          tagline: data.tagline || "",
          description: data.description || "",
          specs: data.specs || "",
          categoryId: data.categoryId,
          categorySlug: data.categorySlug,
          parentCategorySlug: data.parentCategorySlug || null,
          badge: data.badge || null,
          price: data.price,
          actualPrice: data.actualPrice,
          discountPercent: data.discountPercent,
          active: data.active,
          isFeatured: data.isFeatured,
          isNewArrival: data.isNewArrival,
          newArrivalOrder: data.newArrivalOrder,
          isBestSeller: data.isBestSeller,
          construction: data.construction || null,
          thicknessOptions: data.thicknessOptions || null,
          sizeOptions: data.sizeOptions || null,
          dimensions: data.dimensions || null,
          features: data.features || null,
        },
      });

      // Images
      if (Array.isArray(data.images) && data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
          await tx.productImage.create({
            data: {
              productId: prod.id,
              url: data.images[i],
              alt: prod.name,
              isPrimary: i === 0,
              displayOrder: i + 1,
            },
          });
        }
      }

      // Variants
      if (Array.isArray(data.variants) && data.variants.length > 0) {
        for (const v of data.variants) {
          await tx.productVariant.create({
            data: {
              id: v.id || `VAR-${prod.id}-${v.sku}`,
              sku: v.sku,
              productId: prod.id,
              size: v.size || null,
              dimension: v.dimension || null,
              thickness: v.thickness || null,
              firmness: v.firmness || null,
              actualPrice: v.actualPrice,
              discountPercent: v.discountPercent,
              discountedPrice: v.discountedPrice,
              stock: v.stock,
              threshold: v.threshold,
              status: v.status || "Active",
            },
          });
        }
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminUserId: auth.user.id,
          action: "CREATE_PRODUCT",
          resource: "products",
          resourceId: prod.id,
          details: { name: prod.name, price: prod.price },
        },
      });

      return prod;
    });

    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (error) {
    console.error("Admin product create error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
