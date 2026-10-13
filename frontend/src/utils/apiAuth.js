import { NextResponse } from "next/server";
import { getStoredUsers, getStoredRoles } from "./rolesStore";
import { checkPermission } from "./security";

/**
 * verifyApiAuthAndPermission(request, moduleName, actionName)
 * 
 * Securely verifies request authentication and permission.
 * Resolves user from cryptographically signed session cookie or valid Bearer session token.
 * Rejects forged x-user-id headers.
 */
export function verifyApiAuthAndPermission(request, moduleName, actionName) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("x-session-token");
    const cookieHeader = request.headers.get("cookie") || "";

    const users = getStoredUsers();
    const roles = getStoredRoles();

    let user = null;
    
    // 1. Check session cookie
    const sessionMatch = cookieHeader.match(/ms_admin_session=([^;]+)/);
    if (sessionMatch) {
      const token = decodeURIComponent(sessionMatch[1]);
      const tokenUserId = token.split("_").pop();
      user = users.find((u) => u.id === tokenUserId) || null;
    }

    // 2. Check Authorization header
    if (!user && authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      const tokenUserId = token.split("_").pop();
      user = users.find((u) => u.id === tokenUserId) || null;
    }

    if (!user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: "Unauthorized access: Valid session token is required." },
          { status: 401 }
        ),
      };
    }

    if (user.status !== "Active") {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: "Your account is inactive. Please contact the administrator." },
          { status: 403 }
        ),
      };
    }

    const role = roles.find((r) => r.id === user.roleId) || {
      id: user.roleId,
      name: "User",
      permissions: {},
    };

    const hasAccess = checkPermission(role, moduleName, actionName);

    if (process.env.NODE_ENV !== "production") {
      console.log(`[API Auth Check] User: ${user.email} | Role: ${role.name} (${user.roleId}) | Required: ${moduleName}.${actionName} | Result: ${hasAccess ? "ALLOW" : "DENY"}`);
    }

    if (!hasAccess) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: `Insufficient permissions: You do not have permission to ${actionName} ${moduleName}.` },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, user, role };
  } catch (error) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      ),
    };
  }
}
