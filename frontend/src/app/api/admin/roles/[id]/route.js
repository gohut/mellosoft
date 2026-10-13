import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireAdminPermission } from "../../../../../lib/rbac";
import { adminRoleSchema } from "../../../../../lib/validators";

export async function GET(request, { params }) {
  const auth = await requireAdminPermission(request, "roles", "view");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!role) {
      return NextResponse.json({ success: false, error: "Role not found." }, { status: 404 });
    }

    const permsMap = {};
    for (const p of role.permissions) {
      if (!permsMap[p.module]) permsMap[p.module] = [];
      permsMap[p.module].push(p.action);
    }

    return NextResponse.json({
      success: true,
      role: {
        ...role,
        permissions: permsMap,
      },
    });
  } catch (error) {
    console.error("Role GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdminPermission(request, "roles", "edit");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const body = await request.json();
    const validation = adminRoleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Role not found." }, { status: 404 });
    }

    const { name, description, permissions } = validation.data;
    const cleanName = existing.isSystemRole ? existing.name : name.trim();

    await prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id },
        data: {
          name: cleanName,
          description: description !== undefined ? description.trim() : existing.description,
        },
      });

      // Reset and rebuild permissions
      await tx.rolePermission.deleteMany({ where: { roleId: id } });

      if (permissions && typeof permissions === "object") {
        for (const [moduleName, actions] of Object.entries(permissions)) {
          if (Array.isArray(actions)) {
            for (const action of actions) {
              await tx.rolePermission.create({
                data: {
                  roleId: id,
                  module: moduleName,
                  action,
                },
              });
            }
          }
        }
      }

      await tx.auditLog.create({
        data: {
          adminUserId: auth.user.id,
          action: "UPDATE_ROLE",
          resource: "roles",
          resourceId: id,
          details: { name: cleanName },
        },
      });
    });

    return NextResponse.json({ success: true, message: "Role updated successfully." });
  } catch (error) {
    console.error("Role update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdminPermission(request, "roles", "delete");
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!role) {
      return NextResponse.json({ success: false, error: "Role not found." }, { status: 404 });
    }

    if (role.isSystemRole) {
      return NextResponse.json(
        { success: false, error: "System default roles (Super Admin, Admin, Manager, Staff) cannot be deleted." },
        { status: 400 }
      );
    }

    if (role.users.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete role "${role.name}" because ${role.users.length} active user(s) are assigned to it.`,
        },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId: id } }),
      prisma.role.delete({ where: { id } }),
      prisma.auditLog.create({
        data: {
          adminUserId: auth.user.id,
          action: "DELETE_ROLE",
          resource: "roles",
          resourceId: id,
          details: { name: role.name },
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: `Role "${role.name}" deleted successfully.` });
  } catch (error) {
    console.error("Role deletion error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
