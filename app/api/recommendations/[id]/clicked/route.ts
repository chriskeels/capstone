// app/api/recommendations/[id]/clicked/route.ts
// PATCH — marks a recommendation as clicked for analytics tracking

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/getCurrentUser";
import { markRecommendationClicked } from "@/lib/recommendations";

type Props = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_req: Request, { params }: Props) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await markRecommendationClicked(id, user.id);

  return NextResponse.json({ success: true });
}
