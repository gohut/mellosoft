import { NextResponse } from "next/server";
import { getStoredUsers, getStoredRoles } from "./rolesStore";
import { checkPermission } from "./security";
import { verifyToken } from "../lib/jwt";

/**
 * verifyApiAuthAndPermission(request, moduleName, actionName)
 * 
 * Verifies request authentication (JWT or session token), user active status, and required RBAC permission.
 * If authorized, returns { authorized: true, user, role, tokenPayload }.
 * If unauthorized, returns { authorized: false, response: NextResponse }.
 */
export function verifyApiAuthAndPermission(request, moduleName, actionName) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("x-session-token");
    const userIdHeader = request.headers.get("x-user-id");

    const users = getStoredUsers();
    const roles = getStoredRoles();

    let user = null;
    let tokenPayload = null;

    if (authHeader) {
      tokenPayload = verifyToken(authHeader);
      if (tokenPayload && tokenPayload.sub) {
        user = users.find((u) => u.id === tokenPayload.sub || u.email.toLowerCase() === (tokenPayload.email || "").toLowerCase());
      }
    }

    // Fallback for legacy session header or explicit x-user-id
    if (!user && userIdHeader) {
      user = users.find((u) => u.id === userIdHeader) || null;
    } else if (!user && authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      const tokenUserId = token.split("_").pop();
      user = users.find((u) => u.id === tokenUserId) || null;
    }

    if (!user && tokenPayload && tokenPayload.type === "admin") {
      user = {
        id: tokenPayload.sub,
        name: tokenPayload.name,
        email: tokenPayload.email,
        roleId: tokenPayload.roleId,
        status: "Active",
      };
    }

    if (!user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: "Unauthorized access: Valid JWT session token is required." },
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
      name: tokenPayload?.roleName || "User",
      permissions: tokenPayload?.permissions || {},
    };

    if (moduleName && actionName) {
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
    }

    return { authorized: true, user, role, tokenPayload };
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


