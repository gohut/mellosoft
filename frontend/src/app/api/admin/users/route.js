import { NextResponse } from "next/server";
import { getStoredUsers, createStoredUser } from "../../../../utils/rolesStore";
import { hashPassword } from "../../../../utils/security";
import { verifyApiAuthAndPermission } from "../../../../utils/apiAuth";

export async function GET(request) {
  const authCheck = verifyApiAuthAndPermission(request, "users", "view");
  if (!authCheck.authorized) return authCheck.response;

  return NextResponse.json({ success: true, users: getStoredUsers() });
}

export async function POST(request) {
  const authCheck = verifyApiAuthAndPermission(request, "users", "create");
  if (!authCheck.authorized) return authCheck.response;

  try {
    const body = await request.json();
    const { name, email, phone, password, roleId, status } = body;

    if (!name || !email || !password || !roleId) {
      return NextResponse.json(
        { success: false, error: "Name, email, password, and role are required." },
        { status: 400 }
      );
    }

    const emailTrimmed = email.toLowerCase().trim();
    if (getStoredUsers().some((u) => u.email.toLowerCase() === emailTrimmed)) {
      return NextResponse.json(
        { success: false, error: "A user with this email address already exists." },
        { status: 409 }
      );
    }

    const newUser = createStoredUser({
      name: name.trim(),
      email: emailTrimmed,
      phone: phone || "",
      passwordHash: hashPassword(password),
      roleId,
      status: status || "Active",
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

