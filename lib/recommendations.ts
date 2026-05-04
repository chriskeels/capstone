// lib/recommendations.ts
// AI-powered product recommendation engine.
//
// Strategy:
// 1. Look at the user's recent browsing events
// 2. Find products similar to what they've viewed (via ProductSimilarity table)
// 3. Exclude products already viewed
// 4. Call OpenAI to generate a human-readable reason for each recommendation
// 5. Save and return the recommendations

import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

const BROWSING_LOOKBACK = 10;  // how many recent views to consider
const MAX_RECOMMENDATIONS = 4; // how many to surface

// Main function — generates and saves fresh recommendations for a user
export async function generateRecommendations(userId: string) {
  // 1. Get recently viewed product IDs
  const recentEvents = await prisma.browsingEvent.findMany({
    where: { userId },
    orderBy: { viewedAt: "desc" },
    take: BROWSING_LOOKBACK,
    select: { productId: true },
  });

  const viewedIds = [...new Set(recentEvents.map((e) => e.productId))];

  if (viewedIds.length === 0) {
    // No browsing history — return featured products as fallback
    return getFeaturedFallback(userId);
  }

  // 2. Find similar products via precomputed similarity scores
  const similarProducts = await prisma.productSimilarity.findMany({
    where: {
      productAId: { in: viewedIds },
      productBId: { notIn: viewedIds }, // exclude already-viewed
      score: { gte: 0.4 },             // minimum similarity threshold
    },
    orderBy: { score: "desc" },
    take: MAX_RECOMMENDATIONS * 2,     // fetch extra, then trim after AI
    include: {
      productB: {
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          scent: true,
          category: true,
          price: true,
          imageUrl: true,
        },
      },
    },
  });

  if (similarProducts.length === 0) {
    return getFeaturedFallback(userId);
  }

  // 3. Deduplicate by productB and take the top scoring matches
  const seen = new Set<string>();
  const candidates = similarProducts
    .filter((s) => {
      if (seen.has(s.productBId)) return false;
      seen.add(s.productBId);
      return true;
    })
    .slice(0, MAX_RECOMMENDATIONS);

  // 4. Generate AI reasons for each recommendation
  const withReasons = await Promise.all(
    candidates.map(async (candidate) => {
      const reason = await generateRecommendationReason(
        candidate.productB.name,
        candidate.productB.shortDescription,
        candidate.productB.scent
      );
      return { product: candidate.productB, score: candidate.score, reason };
    })
  );

  // 5. Save to DB and return
  await prisma.recommendation.createMany({
    data: withReasons.map(({ product, score, reason }) => ({
      userId,
      productId: product.id,
      score,
      reason,
    })),
    skipDuplicates: true,
  });

  return withReasons;
}

// Generates a short, on-brand reason for a recommendation
async function generateRecommendationReason(
  productName: string,
  description: string | null,
  scent: string | null
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You write short, warm product recommendation blurbs for Get Up & Glo, a self-care candle brand. Each blurb is one sentence, max 20 words. Tone: gentle, sensory, inviting. Never mention algorithms or recommendations.",
        },
        {
          role: "user",
          content: `Write a one-sentence reason someone might love the "${productName}" candle.${scent ? ` It has a ${scent} scent.` : ""}${description ? ` ${description}` : ""}`,
        },
      ],
      max_tokens: 60,
      temperature: 0.7,
    });

    return (
      completion.choices[0]?.message?.content?.trim() ??
      "A beautiful addition to your self-care ritual."
    );
  } catch {
    return "A beautiful addition to your self-care ritual.";
  }
}

// Fallback: return featured products when no browsing history exists
async function getFeaturedFallback(userId: string) {
  const featured = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: MAX_RECOMMENDATIONS,
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      scent: true,
      category: true,
      price: true,
      imageUrl: true,
    },
  });

  return featured.map((product) => ({
    product,
    score: null,
    reason: "A beautiful addition to your self-care ritual.",
  }));
}

// Fetch saved recommendations for the dashboard UI
export async function getUserRecommendations(userId: string) {
  return prisma.recommendation.findMany({
    where: { userId },
    orderBy: { shownAt: "desc" },
    take: MAX_RECOMMENDATIONS,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          scent: true,
          price: true,
          imageUrl: true,
          category: true,
        },
      },
    },
  });
}

// Mark a recommendation as clicked
export async function markRecommendationClicked(
  recommendationId: string,
  userId: string
) {
  return prisma.recommendation.updateMany({
    where: { id: recommendationId, userId },
    data: { clicked: true },
  });
}

// Utility: compute and store similarity scores between two products
// Call this when adding new products via the admin API
export async function computeProductSimilarity(
  productAId: string,
  productBId: string
) {
  const [a, b] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productAId },
      select: { category: true, scent: true, name: true },
    }),
    prisma.product.findUnique({
      where: { id: productBId },
      select: { category: true, scent: true, name: true },
    }),
  ]);

  if (!a || !b) return null;

  // Simple heuristic score: same category = 0.5 base, matching scent = +0.4
  let score = 0.1;
  if (a.category === b.category) score += 0.5;
  if (
    a.scent &&
    b.scent &&
    a.scent.toLowerCase() === b.scent.toLowerCase()
  ) {
    score += 0.4;
  }
  score = Math.min(score, 1.0);

  await prisma.productSimilarity.upsert({
    where: { productAId_productBId: { productAId, productBId } },
    update: { score },
    create: { productAId, productBId, score },
  });

  return score;
}
