import crypto from "crypto";
import { prisma } from "./db.js";

export const CUSTOMER_SESSION_COOKIE = "ms_customer_session";
export const ADMIN_SESSION_COOKIE = "ms_admin_session";

const CUSTOMER_SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const ADMIN_SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;     // 7 days

/**
 * Generate a cryptographically secure random session token.
 * @returns {string}
 */
export function generateSecureToken() {
  return crypto.randomBytes(48).toString("hex");
}

/**
 * Common secure cookie options.
 */
export function getCookieOptions(maxAgeMs) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}

/**
 * Extract token from Request cookies or Authorization Bearer header.
 * @param {Request} request
 * @param {string} cookieName
 * @returns {string|null}
 */
export function extractToken(request, cookieName) {
  // 1. Check Cookie header
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .filter(([k]) => Boolean(k))
      .map(([k, ...v]) => [k, decodeURIComponent(v.join("="))])
  );

  if (cookies[cookieName]) {
    return cookies[cookieName];
  }

  // 2. Check Authorization Bearer header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.substring(7).trim();
  }

  // 3. Check custom header fallback
  const customHeader = request.headers.get("x-session-token");
  if (customHeader) {
    return customHeader.trim();
  }

  return null;
}

/**
 * Create a new persistent Customer session.
 */
export async function createCustomerSession(customerId, request) {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + CUSTOMER_SESSION_DURATION_MS);
  const ipAddress = request?.headers?.get("x-forwarded-for") || request?.headers?.get("x-real-ip") || null;
  const userAgent = request?.headers?.get("user-agent") || null;

  const session = await prisma.session.create({
    data: {
      token,
      customerId,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  return {
    token,
    session,
    cookieName: CUSTOMER_SESSION_COOKIE,
    cookieOptions: getCookieOptions(CUSTOMER_SESSION_DURATION_MS),
  };
}

/**
 * Validate customer session and resolve current customer profile.
 */
export async function getCustomerSession(request) {
  const token = extractToken(request, CUSTOMER_SESSION_COOKIE);
  if (!token) {
    return { authenticated: false };
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        customer: {
          include: {
            addresses: true,
          },
        },
      },
    });

    if (!session || !session.customer) {
      return { authenticated: false };
    }

    if (session.expiresAt < new Date()) {
      // Session expired — purge asynchronously
      prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return { authenticated: false, error: "Session expired" };
    }

    if (session.customer.status !== "Active") {
      return { authenticated: false, error: "Account is not active" };
    }

    return {
      authenticated: true,
      customer: session.customer,
      session,
    };
  } catch (error) {
    console.error("Error retrieving customer session:", error);
    return { authenticated: false, error: error.message };
  }
}

/**
 * Destroy a customer session.
 */
export async function destroyCustomerSession(request) {
  const token = extractToken(request, CUSTOMER_SESSION_COOKIE);
  if (token) {
    try {
      await prisma.session.deleteMany({ where: { token } });
    } catch {}
  }
  return {
    cookieName: CUSTOMER_SESSION_COOKIE,
    cookieOptions: {
      ...getCookieOptions(0),
      maxAge: 0,
    },
  };
}

/**
 * Create a new persistent Admin session.
 */
export async function createAdminSession(adminUserId, request) {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_DURATION_MS);
  const ipAddress = request?.headers?.get("x-forwarded-for") || request?.headers?.get("x-real-ip") || null;
  const userAgent = request?.headers?.get("user-agent") || null;

  const session = await prisma.session.create({
    data: {
      token,
      adminUserId,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  return {
    token,
    session,
    cookieName: ADMIN_SESSION_COOKIE,
    cookieOptions: getCookieOptions(ADMIN_SESSION_DURATION_MS),
  };
}

/**
 * Validate admin session and resolve current admin user with role and permissions.
 */
export async function getAdminSession(request) {
  const token = extractToken(request, ADMIN_SESSION_COOKIE);
  if (!token) {
    return { authenticated: false };
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        adminUser: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });

    if (!session || !session.adminUser) {
      return { authenticated: false };
    }

    if (session.expiresAt < new Date()) {
      prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return { authenticated: false, error: "Session expired" };
    }

    const user = session.adminUser;
    if (user.status !== "Active") {
      return { authenticated: false, error: "Account inactive" };
    }

    // Format permissions map for convenience
    const permissionsMap = {};
    if (user.role && user.role.permissions) {
      for (const p of user.role.permissions) {
        if (!permissionsMap[p.module]) {
          permissionsMap[p.module] = [];
        }
        permissionsMap[p.module].push(p.action);
      }
    }

    const roleFormatted = {
      ...user.role,
      permissions: permissionsMap,
    };

    return {
      authenticated: true,
      user,
      role: roleFormatted,
      session,
    };
  } catch (error) {
    console.error("Error retrieving admin session:", error);
    return { authenticated: false, error: error.message };
  }
}

/**
 * Destroy an admin session.
 */
export async function destroyAdminSession(request) {
  const token = extractToken(request, ADMIN_SESSION_COOKIE);
  if (token) {
    try {
      await prisma.session.deleteMany({ where: { token } });
    } catch {}
  }
  return {
    cookieName: ADMIN_SESSION_COOKIE,
    cookieOptions: {
      ...getCookieOptions(0),
      maxAge: 0,
    },
  };
}
