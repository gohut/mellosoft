import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireAdminPermission } from "../../../../lib/rbac";
import { adminRoleSchema } from "../../../../lib/validators";

export async function GET(request) {
  const auth = await requireAdminPermission(request, "roles", "view");
  if (!auth.authorized) return auth.response;

  try {
    const roles = await prisma.role.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        permissions: true,
        users: { select: { id: true, name: true, email: true } },
      },
    });

    const formatted = roles.map((r) => {
      const permsMap = {};
      for (const p of r.permissions) {
        if (!permsMap[p.module]) permsMap[p.module] = [];
        permsMap[p.module].push(p.action);
      }
      return {
        id: r.id,
        name: r.name,
        description: r.description,
        isSystemRole: r.isSystemRole,
        permissions: permsMap,
        assignedUsersCount: r.users.length,
        createdAt: r.createdAt.toISOString().split("T")[0],
      };
    });

    return NextResponse.json({ success: true, roles: formatted });
  } catch (error) {
    console.error("Admin roles GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdminPermission(request, "roles", "create");
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const validation = adminRoleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { name, description, permissions } = validation.data;
    const cleanName = name.trim();

    const existing = await prisma.role.findUnique({ where: { name: cleanName } });
    if (existing) {
      return NextResponse.json({ success: false, error: "A role with this name already exists." }, { status: 409 });
    }

    const roleId = `role-${Date.now()}`;

    const createdRole = await prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          id: roleId,
          name: cleanName,
          description: description || `${cleanName} custom role`,
          isSystemRole: false,
        },
      });

      if (permissions && typeof permissions === "object") {
        for (const [moduleName, actions] of Object.entries(permissions)) {
          if (Array.isArray(actions)) {
            for (const action of actions) {
              await tx.rolePermission.create({
                data: {
                  roleId: role.id,
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
          action: "CREATE_ROLE",
          resource: "roles",
          resourceId: role.id,
          details: { name: role.name },
        },
      });

      return role;
    });

    return NextResponse.json({ success: true, role: createdRole }, { status: 201 });
  } catch (error) {
    console.error("Admin role creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
