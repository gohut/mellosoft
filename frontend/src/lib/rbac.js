import { NextResponse } from "next/server.js";
import { getAdminSession, getCustomerSession } from "./auth.js";

/**
 * Check if a given role object holds permission for a specific module and action.
 * 
 * @param {object} role
 * @param {string} moduleName
 * @param {string} action
 * @returns {boolean}
 */
export function checkPermission(role, moduleName, action) {
  if (!role) return false;

  const roleName = (role.name || "").toLowerCase();
  const roleId = (role.id || "").toLowerCase();

  // Super Admin has unrestricted access to all modules and actions
  if (
    roleName.includes("super admin") ||
    roleId.includes("super-admin") ||
    roleId === "role-super-admin"
  ) {
    return true;
  }

  if (!role.permissions || typeof role.permissions !== "object") return false;

  // Normalize aliases
  const targetModule = (moduleName === "inventory" || moduleName === "categories") ? "products" : moduleName;
  const modulePerms = role.permissions[targetModule];
  if (!modulePerms) return false;

  const isUpdateStatus = action === "updateStatus" || action === "update";
  const isModerate = action === "moderate" || action === "approve" || action === "reject";
  const isShowOnHome = action === "featureOnHome" || action === "showOnHome";

  if (Array.isArray(modulePerms)) {
    if (modulePerms.includes(action)) return true;
    if (isUpdateStatus && (modulePerms.includes("updateStatus") || modulePerms.includes("update"))) return true;
    if (isModerate && (modulePerms.includes("moderate") || modulePerms.includes("approve") || modulePerms.includes("reject"))) return true;
    if (isShowOnHome && (modulePerms.includes("featureOnHome") || modulePerms.includes("showOnHome"))) return true;
    return false;
  }

  return false;
}

/**
 * Authorize an administrative API request against the required module and action.
 * Authenticates via secure server session cookies. Strictly rejects insecure header spoofing.
 * 
 * @param {Request} request
 * @param {string} moduleName
 * @param {string} actionName
 * @returns {Promise<{ authorized: boolean, user?: object, role?: object, response?: NextResponse }>}
 */
export async function requireAdminPermission(request, moduleName, actionName) {
  const sessionResult = await getAdminSession(request);

  if (!sessionResult.authenticated || !sessionResult.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized: Active administrative session required." },
        { status: 401 }
      ),
    };
  }

  const { user, role } = sessionResult;

  if (user.status !== "Active") {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Forbidden: Administrative account is inactive." },
        { status: 403 }
      ),
    };
  }

  const hasPermission = checkPermission(role, moduleName, actionName);

  if (!hasPermission) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: `Insufficient permissions: You do not have permission to ${actionName} ${moduleName}.`,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user, role };
}

/**
 * Authorize a customer storefront API request.
 * 
 * @param {Request} request
 * @returns {Promise<{ authenticated: boolean, customer?: object, response?: NextResponse }>}
 */
export async function requireCustomerAuth(request) {
  const sessionResult = await getCustomerSession(request);

  if (!sessionResult.authenticated || !sessionResult.customer) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in to continue." },
        { status: 401 }
      ),
    };
  }

  return { authenticated: true, customer: sessionResult.customer, session: sessionResult.session };
}
