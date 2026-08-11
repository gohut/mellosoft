import { NextResponse } from "next/server";
import { getStoredUsers, getStoredRoles } from "../../../../utils/rolesStore";
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

    const users = getStoredUsers();
    const roles = getStoredRoles();

    // Check memory / stored users
    const user = users.find((u) => u.email.toLowerCase() === emailTrimmed);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password hash or demo passwords
    const isPasswordValid = verifyPassword(password, user.passwordHash) || password === "Admin@123" || password === "Priya@123" || password === "Ankit@123" || password === "Sneha@123";
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
    const role = roles.find((r) => r.id === user.roleId) || {
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

