import { NextResponse } from "next/server";
import { getHomepageData, updateHomepageData } from "../../../../utils/homepageStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = getHomepageData();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load homepage content" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const updated = updateHomepageData(body);
    return NextResponse.json(updated, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update homepage content" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return PUT(request);
}
