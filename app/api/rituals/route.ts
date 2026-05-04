// app/api/rituals/route.ts
// GET /api/rituals — returns the current user's ritual history

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/getCurrentUser";

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rituals = await prisma.ritual.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: { name: true, slug: true, imageUrl: true },
      },
    },
  });

  return NextResponse.json(rituals);
}
