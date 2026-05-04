// lib/rituals.ts
// Server-side helpers for fetching ritual history and activity data.

import { prisma } from "@/lib/prisma";

// Fetch all rituals for a user, newest first
export async function getUserRituals(userId: string) {
  return prisma.ritual.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: { name: true, slug: true, imageUrl: true },
      },
    },
  });
}

// Fetch a single ritual by ID — enforces ownership
export async function getRitualById(ritualId: string, userId: string) {
  return prisma.ritual.findFirst({
    where: { id: ritualId, userId },
    include: {
      product: {
        select: { name: true, slug: true, imageUrl: true },
      },
    },
  });
}

// Summary stats for the dashboard activity panel
export async function getUserActivityStats(userId: string) {
  const [totalRituals, recentRituals, moodCounts] = await Promise.all([
    prisma.ritual.count({ where: { userId } }),

    prisma.ritual.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, mood: true, createdAt: true },
    }),

    prisma.ritual.groupBy({
      by: ["mood"],
      where: { userId, mood: { not: null } },
      _count: { mood: true },
      orderBy: { _count: { mood: "desc" } },
      take: 3,
    }),
  ]);

  const topMoods = moodCounts.map((m) => ({
    mood: m.mood,
    count: m._count.mood,
  }));

  return { totalRituals, recentRituals, topMoods };
}
