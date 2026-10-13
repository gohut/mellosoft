import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireAdminPermission } from "../../../../lib/rbac";
import { hashPassword } from "../../../../lib/password";
import { adminUserCreateSchema } from "../../../../lib/validators";

export async function GET(request) {
  const auth = await requireAdminPermission(request, "users", "view");
  if (!auth.authorized) return auth.response;

  try {
    const users = await prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        role: { select: { id: true, name: true } },
      },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      roleId: u.roleId,
      roleName: u.role?.name || "User",
      status: u.status,
      lastLogin: u.lastLogin ? u.lastLogin.toISOString().replace("T", " ").substring(0, 16) : null,
      createdAt: u.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json({ success: true, users: formatted });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdminPermission(request, "users", "create");
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const validation = adminUserCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { name, email, phone, password, roleId, status } = validation.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existing = await prisma.adminUser.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An administrator with this email address already exists." },
        { status: 409 }
      );
    }

    // Verify role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json({ success: false, error: "Specified role does not exist." }, { status: 400 });
    }

    // Privilege escalation check: only Super Admin can create another Super Admin
    if (role.name === "Super Admin" && auth.role.name !== "Super Admin") {
      return NextResponse.json(
        { success: false, error: "Only a Super Admin can assign the Super Admin role." },
        { status: 403 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userId = `user-${Date.now()}`;

    const newUser = await prisma.adminUser.create({
      data: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        phone: phone || null,
        passwordHash,
        roleId,
        status: status || "Active",
      },
      include: {
        role: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        adminUserId: auth.user.id,
        action: "CREATE_ADMIN_USER",
        resource: "users",
        resourceId: newUser.id,
        details: { name: newUser.name, email: newUser.email, role: newUser.role?.name },
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          roleId: newUser.roleId,
          roleName: newUser.role?.name,
          status: newUser.status,
          createdAt: newUser.createdAt.toISOString().split("T")[0],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin user creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
