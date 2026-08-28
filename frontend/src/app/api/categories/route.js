import { NextResponse } from "next/server";
import { getDb, schema } from "../../../db";
import { MOCK_CATEGORIES } from "../../../admin/data/adminMockData";

export async function GET() {
  try {
    const db = getDb();
    let categoryList = [];

    if (db) {
      try {
        const rawCategories = await db.select().from(schema.categories);
        if (rawCategories && rawCategories.length > 0) {
          categoryList = rawCategories;
        }
      } catch (e) {}
    }

    if (categoryList.length === 0) {
      categoryList = MOCK_CATEGORIES;
    }

    return NextResponse.json({
      success: true,
      categories: categoryList,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
