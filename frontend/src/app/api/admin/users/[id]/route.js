import { NextResponse } from "next/server";
import { DEFAULT_USERS } from "../../../../../data/usersData";
import { hashPassword } from "../../../../../utils/security";
import { verifyApiAuthAndPermission } from "../../../../../utils/apiAuth";

let inMemoryUsers = [...DEFAULT_USERS];

export async function GET(request, { params }) {
  const authCheck = verifyApiAuthAndPermission(request, "users", "view");
  if (!authCheck.authorized) return authCheck.response;

  const { id } = params;
  const user = inMemoryUsers.find((u) => u.id === id);
  if (!user) {
    return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true, user });
}

export async function PUT(request, { params }) {
  const authCheck = verifyApiAuthAndPermission(request, "users", "edit");
  if (!authCheck.authorized) return authCheck.response;

  const { id } = params;
  try {
    const body = await request.json();
    const index = inMemoryUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const updated = { ...inMemoryUsers[index] };
    if (body.name) updated.name = body.name.trim();
    if (body.email) updated.email = body.email.toLowerCase().trim();
    if (body.phone !== undefined) updated.phone = body.phone;
    if (body.roleId) updated.roleId = body.roleId;
    if (body.status) updated.status = body.status;
    if (body.password) updated.passwordHash = hashPassword(body.password);

    inMemoryUsers[index] = updated;
    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const authCheck = verifyApiAuthAndPermission(request, "users", "delete");
  if (!authCheck.authorized) return authCheck.response;

  const { id } = params;
  const user = inMemoryUsers.find((u) => u.id === id);
  if (!user) {
    return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
  }

  if (user.roleId === "role-super-admin") {
    const superAdmins = inMemoryUsers.filter((u) => u.roleId === "role-super-admin");
    if (superAdmins.length <= 1) {
      return NextResponse.json(
        { success: false, error: "Cannot delete the last Super Admin account." },
        { status: 400 }
      );
    }
  }

  inMemoryUsers = inMemoryUsers.filter((u) => u.id !== id);
  return NextResponse.json({ success: true, message: `User ${user.name} deleted successfully.` });
}
