import { NextResponse } from "next/server";
import { DEFAULT_USERS } from "../../../../data/usersData";
import { DEFAULT_ROLES } from "../../../../data/rolesData";
import { verifyPassword } from "../../../../utils/security";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();

    // Check memory / default users
    const user = DEFAULT_USERS.find((u) => u.email.toLowerCase() === emailTrimmed);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password hash
    const isPasswordValid = verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status !== "Active") {
      return NextResponse.json(
        { success: false, error: "Your account is inactive. Please contact the administrator." },
        { status: 403 }
      );
    }

    // Load role & permissions
    const role = DEFAULT_ROLES.find((r) => r.id === user.roleId) || {
      id: user.roleId,
      name: "User",
      permissions: {},
    };

    const token = `ms_session_${Date.now()}_${user.id}`;

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        roleId: user.roleId,
        roleName: role.name,
        status: user.status,
      },
      role,
      permissions: role.permissions || {},
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
