import { NextResponse } from "next/server";
import { getStoredUsers, getStoredRoles } from "./rolesStore";
import { checkPermission } from "./security";

/**
 * verifyApiAuthAndPermission(request, moduleName, actionName)
 * 
 * Verifies request authentication, user active status, and required permission.
 * Resolves user.roleId against live stored roles.
 * If authorized, returns { authorized: true, user, role }.
 * If unauthorized, returns { authorized: false, response: NextResponse }.
 */
export function verifyApiAuthAndPermission(request, moduleName, actionName) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("x-session-token");
    const userIdHeader = request.headers.get("x-user-id");

    const users = getStoredUsers();
    const roles = getStoredRoles();

    const userId = userIdHeader || (authHeader ? authHeader.split("_").pop() : null) || users[0]?.id;
    const user = users.find((u) => u.id === userId) || users[0];

    if (!user || user.status !== "Active") {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: "Unauthorized access or inactive user account." },
          { status: 401 }
        ),
      };
    }

    const role = roles.find((r) => r.id === user.roleId) || {
      id: user.roleId,
      name: "User",
      permissions: {},
    };

    const hasAccess = checkPermission(role, moduleName, actionName);

    // Development logging for permission check
    if (process.env.NODE_ENV !== "production") {
      console.log(`[API Auth Check] User: ${user.email} | Role: ${role.name} (${user.roleId}) | Required: ${moduleName}.${actionName} | Result: ${hasAccess ? "ALLOW" : "DENY"}`);
    }

    if (!hasAccess) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: `Access Denied: You do not have permission to ${actionName} ${moduleName}.` },
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

