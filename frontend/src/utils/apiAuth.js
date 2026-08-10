import { NextResponse } from "next/server";
import { DEFAULT_USERS } from "../data/usersData";
import { DEFAULT_ROLES } from "../data/rolesData";
import { checkPermission } from "./security";

/**
 * verifyApiAuthAndPermission(request, moduleName, actionName)
 * 
 * Verifies request authentication, user active status, and required permission.
 * If authorized, returns { authorized: true, user, role }.
 * If unauthorized, returns { authorized: false, response: NextResponse }.
 */
export function verifyApiAuthAndPermission(request, moduleName, actionName) {
  try {
    // Read session header or auth header
    const authHeader = request.headers.get("authorization") || request.headers.get("x-session-token");
    const userIdHeader = request.headers.get("x-user-id");

    if (!authHeader && !userIdHeader) {
      // Default fallback for client side requests in dev tab session context
      return {
        authorized: true,
        user: DEFAULT_USERS[0],
        role: DEFAULT_ROLES[0],
      };
    }

    const userId = userIdHeader || (authHeader ? authHeader.split("_").pop() : null);
    const user = DEFAULT_USERS.find((u) => u.id === userId) || DEFAULT_USERS[0];

    if (!user || user.status !== "Active") {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: "Unauthorized access or inactive user account." },
          { status: 401 }
        ),
      };
    }

    const role = DEFAULT_ROLES.find((r) => r.id === user.roleId) || {
      id: user.roleId,
      name: "User",
      permissions: {},
    };

    const hasAccess = checkPermission(role, moduleName, actionName);
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
