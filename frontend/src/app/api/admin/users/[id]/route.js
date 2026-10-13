import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireAdminPermission } from "../../../../../lib/rbac";
import { hashPassword } from "../../../../../lib/password";
import { adminUserUpdateSchema } from "../../../../../lib/validators";

export async function GET(request, { params }) {
  const auth = await requireAdminPermission(request, "users", "view");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const user = await prisma.adminUser.findUnique({
      where: { id },
      include: {
        role: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        roleId: user.roleId,
        roleName: user.role?.name || "User",
        status: user.status,
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
      },
    });
  } catch (error) {
    console.error("Admin user GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdminPermission(request, "users", "edit");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const body = await request.json();
    const validation = adminUserUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const existing = await prisma.adminUser.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const { name, email, phone, password, roleId, status } = validation.data;

    // Protection rule: Prevent demoting or deactivating the last active Super Admin
    if (existing.role.name === "Super Admin") {
      const isDemoting = roleId && roleId !== existing.roleId;
      const isDeactivating = status && status !== "Active";

      if (isDemoting || isDeactivating) {
        const superAdminRole = await prisma.role.findFirst({ where: { name: "Super Admin" } });
        const activeSuperAdminCount = await prisma.adminUser.count({
          where: { roleId: superAdminRole?.id, status: "Active" },
        });

        if (activeSuperAdminCount <= 1) {
          return NextResponse.json(
            {
              success: false,
              error: "Cannot deactivate or demote the last remaining active Super Admin.",
            },
            { status: 400 }
          );
        }
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone.trim() || null;
    if (roleId) updateData.roleId = roleId;
    if (status) updateData.status = status;
    if (password && password.trim()) {
      updateData.passwordHash = await hashPassword(password.trim());
    }

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.adminUser.update({
        where: { id },
        data: updateData,
        include: { role: true },
      });

      await tx.auditLog.create({
        data: {
          adminUserId: auth.user.id,
          action: "UPDATE_ADMIN_USER",
          resource: "users",
          resourceId: id,
          details: { updatedFields: Object.keys(updateData) },
        },
      });

      return u;
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        roleId: updated.roleId,
        roleName: updated.role?.name,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdminPermission(request, "users", "delete");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const existing = await prisma.adminUser.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    // Protection rule: Cannot delete the last active Super Admin
    if (existing.role.name === "Super Admin") {
      const activeSuperAdminCount = await prisma.adminUser.count({
        where: { roleId: existing.roleId, status: "Active" },
      });
      if (activeSuperAdminCount <= 1) {
        return NextResponse.json(
          { success: false, error: "Cannot delete the last remaining active Super Admin." },
          { status: 400 }
        );
      }
    }

    // Protection rule: Cannot delete yourself
    if (existing.id === auth.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own administrative account." },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.session.deleteMany({ where: { adminUserId: id } }),
      prisma.adminUser.delete({ where: { id } }),
      prisma.auditLog.create({
        data: {
          adminUserId: auth.user.id,
          action: "DELETE_ADMIN_USER",
          resource: "users",
          resourceId: id,
          details: { email: existing.email },
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: `User "${existing.name}" deleted successfully.` });
  } catch (error) {
    console.error("Admin user deletion error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
