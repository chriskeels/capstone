// lib/getCurrentUser.ts
// Server-side helper — resolves the Clerk session to a full DB user record.
// Use this in Server Components, API routes, and Server Actions.

import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

type GetCurrentUserResult =
  | { user: User; error: null }
  | { user: null; error: string };

export async function getCurrentUser(): Promise<GetCurrentUserResult> {
  const { userId } = await auth();

  if (!userId) {
    return { user: null, error: "Not authenticated" };
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return { user: null, error: "User not found in database" };
  }

  return { user, error: null };
}

// Convenience wrapper — throws if unauthenticated.
// Use in API routes where you want to return 401 on failure.
export async function requireUser(): Promise<User> {
  const { user, error } = await getCurrentUser();

  if (!user) {
    throw new Error(error ?? "Unauthorized");
  }

  return user;
}

// Admin guard — throws if user is not an admin.
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: admin access required");
  }

  return user;
}
