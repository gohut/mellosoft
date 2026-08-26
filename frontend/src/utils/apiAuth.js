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

    // Resolve user from session token or explicit x-user-id header
    let user = null;
    if (userIdHeader) {
      user = users.find((u) => u.id === userIdHeader) || null;
    } else if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      const tokenUserId = token.split("_").pop();
      user = users.find((u) => u.id === tokenUserId) || null;
    }

    if (!user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: "Unauthorized access: Valid session token or user ID is required." },
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

