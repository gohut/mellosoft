import { NextResponse } from "next/server";
import { DEFAULT_USERS } from "../../../../data/usersData";
import { hashPassword } from "../../../../utils/security";
import { verifyApiAuthAndPermission } from "../../../../utils/apiAuth";

let inMemoryUsers = [...DEFAULT_USERS];

export async function GET(request) {
  const authCheck = verifyApiAuthAndPermission(request, "users", "view");
  if (!authCheck.authorized) return authCheck.response;

  return NextResponse.json({ success: true, users: inMemoryUsers });
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
    if (inMemoryUsers.some((u) => u.email.toLowerCase() === emailTrimmed)) {
      return NextResponse.json(
        { success: false, error: "A user with this email address already exists." },
        { status: 409 }
      );
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: emailTrimmed,
      phone: phone || "",
      passwordHash: hashPassword(password),
      roleId,
      status: status || "Active",
      lastLogin: "Never",
      createdAt: new Date().toISOString().split("T")[0],
    };

    inMemoryUsers.unshift(newUser);
    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
