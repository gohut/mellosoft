import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireAdminPermission } from "../../../../lib/rbac";

export async function GET(request) {
  const auth = await requireAdminPermission(request, "settings", "view");
  if (!auth.authorized) return auth.response;

  try {
    const record = await prisma.applicationSettings.findUnique({
      where: { id: "global_settings" },
    });

    return NextResponse.json({
      success: true,
      settings: record?.data || {},
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = await requireAdminPermission(request, "settings", "edit");
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();

    const updated = await prisma.applicationSettings.upsert({
      where: { id: "global_settings" },
      update: { data: body },
      create: { id: "global_settings", data: body },
    });

    await prisma.auditLog.create({
      data: {
        adminUserId: auth.user.id,
        action: "UPDATE_SETTINGS",
        resource: "settings",
        resourceId: "global_settings",
        details: { updatedKeys: Object.keys(body) },
      },
    });

    return NextResponse.json({ success: true, settings: updated.data });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
