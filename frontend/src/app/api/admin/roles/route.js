import { NextResponse } from "next/server";
import { DEFAULT_ROLES } from "../../../../data/rolesData";
import { verifyApiAuthAndPermission } from "../../../../utils/apiAuth";

let inMemoryRoles = [...DEFAULT_ROLES];

export async function GET(request) {
  const authCheck = verifyApiAuthAndPermission(request, "roles", "view");
  if (!authCheck.authorized) return authCheck.response;

  return NextResponse.json({ success: true, roles: inMemoryRoles });
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
    if (inMemoryRoles.some((r) => r.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "A role with this name already exists." },
        { status: 409 }
      );
    }

    const newRole = {
      id: `role-${Date.now()}`,
      name: nameTrimmed,
      description: description || `${nameTrimmed} custom role`,
      isSystemRole: false,
      createdAt: new Date().toISOString().split("T")[0],
      permissions: permissions || {
        dashboard: ["view"],
        products: ["view"],
        orders: ["view"],
        customers: ["view"],
        reviews: ["view"],
        users: [],
        roles: [],
        settings: [],
      },
    };

    inMemoryRoles.push(newRole);
    return NextResponse.json({ success: true, role: newRole }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
