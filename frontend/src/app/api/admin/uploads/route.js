import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../lib/auth";
import { saveUploadedImage } from "../../../../lib/uploads";

export async function POST(request) {
  const auth = await getAdminSession(request);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Active administrative session required for file uploads." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") || formData.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, error: "No file was uploaded." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await saveUploadedImage(buffer, file.name);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
    });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
