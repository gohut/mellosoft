import { NextResponse } from "next/server";
import { getStoredRoleById, updateStoredRole, deleteStoredRole } from "../../../../../utils/rolesStore";
import { verifyApiAuthAndPermission } from "../../../../../utils/apiAuth";

export async function GET(request, { params }) {
  const authCheck = verifyApiAuthAndPermission(request, "roles", "view");
  if (!authCheck.authorized) return authCheck.response;

  const { id } = params;
  const role = getStoredRoleById(id);
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
    const updated = updateStoredRole(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: "Role not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, role: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const authCheck = verifyApiAuthAndPermission(request, "roles", "delete");
  if (!authCheck.authorized) return authCheck.response;

  const { id } = params;
  const res = deleteStoredRole(id);
  if (!res.success) {
    return NextResponse.json({ success: false, error: res.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: `Role deleted successfully.` });
}

