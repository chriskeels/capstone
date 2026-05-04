// app/api/recommendations/route.ts
// GET  /api/recommendations  — fetch saved recommendations (or generate fresh ones)
// POST /api/recommendations/clicked — mark a recommendation as clicked

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/getCurrentUser";
import {
  getUserRecommendations,
  generateRecommendations,
} from "@/lib/recommendations";

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if there are saved recommendations
  let recommendations = await getUserRecommendations(user.id);

  // If none exist yet, generate fresh ones
  if (recommendations.length === 0) {
    const fresh = await generateRecommendations(user.id);
    // Re-fetch from DB so shape is consistent
    recommendations = await getUserRecommendations(user.id);

    // If still empty (new user, no products), return the fallback directly
    if (recommendations.length === 0) {
      return NextResponse.json(
        fresh.map(({ product, reason }) => ({ product, reason, clicked: false }))
      );
    }
  }

  return NextResponse.json(
    recommendations.map((r) => ({
      id: r.id,
      product: r.product,
      reason: r.reason,
      score: r.score,
      clicked: r.clicked,
    }))
  );
}
