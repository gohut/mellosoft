import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true, isParent: true },
      orderBy: { order: "asc" },
      include: {
        subcategories: {
          where: { active: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
