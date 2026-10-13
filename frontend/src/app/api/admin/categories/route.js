import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireAdminPermission } from "../../../../lib/rbac";

export async function GET(request) {
  const auth = await requireAdminPermission(request, "products", "view");
  if (!auth.authorized) return auth.response;

  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        subcategories: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdminPermission(request, "products", "create");
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { name, slug, parentId, type, image, description, order, showInNavigation, active } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: "Name and slug are required" }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

    const category = await prisma.category.create({
      data: {
        id: `CAT-${cleanSlug.toUpperCase()}`,
        name: name.trim(),
        slug: cleanSlug,
        parentId: parentId || null,
        isParent: !parentId,
        type: type || (parentId ? "subcategory" : "main"),
        image: image || null,
        description: description || null,
        order: order || 0,
        showInNavigation: showInNavigation ?? true,
        active: active ?? true,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error("Admin category create error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
