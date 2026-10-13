import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { verifyPassword } from "../../../../lib/password";
import { createAdminSession, createCustomerSession } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, isAdmin } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();

    // 1. Check Administrative User
    if (isAdmin === true) {
      const adminUser = await prisma.adminUser.findUnique({
        where: { email: emailTrimmed },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (!adminUser) {
        return NextResponse.json(
          { success: false, error: "Invalid administrative credentials." },
          { status: 401 }
        );
      }

      const isValidPassword = await verifyPassword(password, adminUser.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: "Invalid administrative credentials." },
          { status: 401 }
        );
      }

      if (adminUser.status !== "Active") {
        return NextResponse.json(
          { success: false, error: "Your administrative account is inactive. Please contact the Super Admin." },
          { status: 403 }
        );
      }

      // Update lastLogin
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { lastLogin: new Date() },
      });

      const sessionData = await createAdminSession(adminUser.id, request);

      // Structure permissions map
      const permissionsMap = {};
      if (adminUser.role && adminUser.role.permissions) {
        for (const p of adminUser.role.permissions) {
          if (!permissionsMap[p.module]) permissionsMap[p.module] = [];
          permissionsMap[p.module].push(p.action);
        }
      }

      const response = NextResponse.json({
        success: true,
        token: sessionData.token,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          phone: adminUser.phone || "",
          roleId: adminUser.roleId,
          roleName: adminUser.role.name,
          status: adminUser.status,
        },
        role: {
          id: adminUser.role.id,
          name: adminUser.role.name,
          permissions: permissionsMap,
        },
        permissions: permissionsMap,
      });

      response.cookies.set(
        sessionData.cookieName,
        sessionData.token,
        sessionData.cookieOptions
      );

      return response;
    }

    // 2. Check Customer Account
    const customer = await prisma.customer.findUnique({
      where: { email: emailTrimmed },
      include: {
        addresses: true,
      },
    });

    // If customer doesn't exist, check if an admin user is logging in without explicit isAdmin flag
    if (!customer) {
      const fallbackAdmin = await prisma.adminUser.findUnique({
        where: { email: emailTrimmed },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (fallbackAdmin) {
        const isAdminPass = await verifyPassword(password, fallbackAdmin.passwordHash);
        if (isAdminPass && fallbackAdmin.status === "Active") {
          const sessionData = await createAdminSession(fallbackAdmin.id, request);
          const permissionsMap = {};
          if (fallbackAdmin.role?.permissions) {
            for (const p of fallbackAdmin.role.permissions) {
              if (!permissionsMap[p.module]) permissionsMap[p.module] = [];
              permissionsMap[p.module].push(p.action);
            }
          }
          const response = NextResponse.json({
            success: true,
            isAdmin: true,
            token: sessionData.token,
            user: {
              id: fallbackAdmin.id,
              name: fallbackAdmin.name,
              email: fallbackAdmin.email,
              roleId: fallbackAdmin.roleId,
              roleName: fallbackAdmin.role.name,
              status: fallbackAdmin.status,
            },
            role: {
              id: fallbackAdmin.role.id,
              name: fallbackAdmin.role.name,
              permissions: permissionsMap,
            },
            permissions: permissionsMap,
          });
          response.cookies.set(sessionData.cookieName, sessionData.token, sessionData.cookieOptions);
          return response;
        }
      }

      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isCustomerValid = await verifyPassword(password, customer.passwordHash);
    if (!isCustomerValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (customer.status !== "Active") {
      return NextResponse.json(
        { success: false, error: "Your account is currently suspended. Please contact customer support." },
        { status: 403 }
      );
    }

    // Update lastLogin
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLogin: new Date() },
    });

    const sessionData = await createCustomerSession(customer.id, request);

    const response = NextResponse.json({
      success: true,
      token: sessionData.token,
      customer: {
        id: customer.customerId,
        internalId: customer.id,
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
        avatar: customer.avatar,
        savedAddresses: customer.addresses || [],
      },
      user: {
        id: customer.customerId,
        name: customer.name,
        email: customer.email,
      },
    });

    response.cookies.set(
      sessionData.cookieName,
      sessionData.token,
      sessionData.cookieOptions
    );

    return response;
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
