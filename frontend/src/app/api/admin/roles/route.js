import { NextResponse } from "next/server";
import { getStoredRoles, createStoredRole } from "../../../../utils/rolesStore";
import { verifyApiAuthAndPermission } from "../../../../utils/apiAuth";

export async function GET(request) {
  const authCheck = verifyApiAuthAndPermission(request, "roles", "view");
  if (!authCheck.authorized) return authCheck.response;

  return NextResponse.json({ success: true, roles: getStoredRoles() });
}

export async function POST(request) {
  const authCheck = verifyApiAuthAndPermission(request, "roles", "create");
  if (!authCheck.authorized) return authCheck.response;

  try {
    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Role name is required." },
        { status: 400 }
      );
    }

    const nameTrimmed = name.trim();
    if (getStoredRoles().some((r) => r.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "A role with this name already exists." },
        { status: 409 }
      );
    }

    const newRole = createStoredRole({ name: nameTrimmed, description, permissions });
    return NextResponse.json({ success: true, role: newRole }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

