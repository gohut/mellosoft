import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

/**
 * Deterministic Sleep Advisor Rule Engine
 * 
 * Recommends optimal mattress and accessory models based on ergonomic sleep science:
 * - Sleep position (side, back, stomach, combo)
 * - Firmness preference (soft, medium, firm)
 * - Temperature profile (hot, neutral, cool)
 * - Pressure points / back pain concerns
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { position = "side", firmness = "medium", sleepingTemperature = "neutral", concerns = [] } = body;

    // Fetch active mattress products
    const mattresses = await prisma.product.findMany({
      where: { active: true, parentCategorySlug: "mattresses" },
      include: {
        images: { take: 1, orderBy: { displayOrder: "asc" } },
      },
    });

    if (mattresses.length === 0) {
      return NextResponse.json({ success: true, recommendations: [] });
    }

    // Score mattresses based on heuristic compatibility
    const scored = mattresses.map((prod) => {
      let score = 70; // baseline
      const name = (prod.name || "").toLowerCase();
      const cat = (prod.categorySlug || "").toLowerCase();
      const desc = (prod.description || "").toLowerCase();

      // Position logic
      if (position === "side" && (cat === "foam" || cat === "memory-foam" || name.includes("haven") || name.includes("cocoon"))) {
        score += 20;
      } else if (position === "back" && (cat === "ortho" || cat === "latex" || name.includes("ortho") || name.includes("terra"))) {
        score += 20;
      } else if (position === "stomach" && (cat === "ortho" || firmness === "firm")) {
        score += 20;
      } else if (position === "combo" && (cat === "spring" || cat === "latex")) {
        score += 20;
      }

      // Temperature logic
      if (sleepingTemperature === "hot" && (cat === "spring" || cat === "latex" || desc.includes("cool") || desc.includes("breathable"))) {
        score += 15;
      }

      // Pain / Ortho logic
      if (Array.isArray(concerns) && concerns.includes("back_pain") && (cat === "ortho" || name.includes("ortho"))) {
        score += 20;
      }

      return {
        product: {
          id: prod.id,
          productId: prod.productId,
          name: prod.name,
          tagline: prod.tagline,
          price: prod.price,
          rating: prod.rating,
          badge: prod.badge,
          image: prod.images[0]?.url || "/asset/img1.jpg",
        },
        matchPercentage: Math.min(99, score),
        recommendedFirmness: position === "side" ? "Medium" : position === "stomach" ? "Firm" : "Medium-Firm",
        rationale:
          position === "side"
            ? "Adaptive contouring reduces shoulder and hip pressure points for side sleepers."
            : position === "stomach"
            ? "Even spinal alignment prevents lumbar sinking during stomach sleep."
            : "Balanced orthopedic contouring provides consistent lumbar support throughout the night.",
      };
    });

    scored.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return NextResponse.json({
      success: true,
      analysisType: "deterministic_ergonomic_rules",
      topRecommendation: scored[0] || null,
      recommendations: scored.slice(0, 3),
    });
  } catch (error) {
    console.error("Advisor error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
