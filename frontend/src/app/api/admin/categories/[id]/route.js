import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireAdminPermission } from "../../../../../lib/rbac";

export async function PUT(request, { params }) {
  const auth = await requireAdminPermission(request, "products", "edit");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, image, description, order, showInNavigation, active } = body;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        image: image !== undefined ? image : undefined,
        description: description !== undefined ? description : undefined,
        order: order !== undefined ? Number(order) : undefined,
        showInNavigation: showInNavigation !== undefined ? Boolean(showInNavigation) : undefined,
        active: active !== undefined ? Boolean(active) : undefined,
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error("Admin category update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdminPermission(request, "products", "delete");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    // Check if category has associated products
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category because ${productCount} active product(s) are assigned to it.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    console.error("Admin category delete error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
