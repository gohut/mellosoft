import { NextResponse } from "next/server";
import { DEFAULT_ROLES } from "../../../../../data/rolesData";
import { verifyApiAuthAndPermission } from "../../../../../utils/apiAuth";

let inMemoryRoles = [...DEFAULT_ROLES];

export async function GET(request, { params }) {
  const authCheck = verifyApiAuthAndPermission(request, "roles", "view");
  if (!authCheck.authorized) return authCheck.response;

  const { id } = params;
  const role = inMemoryRoles.find((r) => r.id === id);
  if (!role) {
    return NextResponse.json({ success: false, error: "Role not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true, role });
}

export async function PUT(request, { params }) {
  const authCheck = verifyApiAuthAndPermission(request, "roles", "edit");
  if (!authCheck.authorized) return authCheck.response;

  const { id } = params;
  try {
    const body = await request.json();
    const index = inMemoryRoles.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Role not found." }, { status: 404 });
    }

    const existing = inMemoryRoles[index];
    const updated = {
      ...existing,
      name: existing.isSystemRole ? existing.name : (body.name ? body.name.trim() : existing.name),
      description: body.description !== undefined ? body.description.trim() : existing.description,
      permissions: body.permissions || existing.permissions,
    };

    inMemoryRoles[index] = updated;
    return NextResponse.json({ success: true, role: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const authCheck = verifyApiAuthAndPermission(request, "roles", "delete");
  if (!authCheck.authorized) return authCheck.response;

  const { id } = params;
  const role = inMemoryRoles.find((r) => r.id === id);
  if (!role) {
    return NextResponse.json({ success: false, error: "Role not found." }, { status: 404 });
  }

  if (role.isSystemRole) {
    return NextResponse.json(
      { success: false, error: "System default roles cannot be deleted." },
      { status: 400 }
    );
  }

  inMemoryRoles = inMemoryRoles.filter((r) => r.id !== id);
  return NextResponse.json({ success: true, message: `Role ${role.name} deleted successfully.` });
}
