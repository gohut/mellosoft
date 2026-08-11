import { NextResponse } from "next/server";
import { getStoredUserById, updateStoredUser, deleteStoredUser } from "../../../../../utils/rolesStore";
import { hashPassword } from "../../../../../utils/security";
import { verifyApiAuthAndPermission } from "../../../../../utils/apiAuth";

export async function GET(request, { params }) {
  const authCheck = verifyApiAuthAndPermission(request, "users", "view");
  if (!authCheck.authorized) return authCheck.response;

  const { id } = params;
  const user = getStoredUserById(id);
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
    const updateData = { ...body };
    if (body.password) {
      updateData.passwordHash = hashPassword(body.password);
    }

    const updated = updateStoredUser(id, updateData);
    if (!updated) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const authCheck = verifyApiAuthAndPermission(request, "users", "delete");
  if (!authCheck.authorized) return authCheck.response;

  const { id } = params;
  const res = deleteStoredUser(id);
  if (!res.success) {
    return NextResponse.json({ success: false, error: res.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: `User deleted successfully.` });
}

