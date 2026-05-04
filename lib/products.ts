// lib/products.ts
// All product-related database queries.
// Import these in Server Components and API routes.

import { prisma } from "@/lib/prisma";
import type { ProductCategory } from "@prisma/client";

// Fetch all active products, optional filter by category
export async function getProducts(category?: ProductCategory) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
}

// Fetch a single product by slug
export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
  });
}

// Fetch featured products (for homepage/hero sections)
export async function getFeaturedProducts(limit = 4) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

// Fetch all products (admin only — includes inactive)
export async function getAllProductsAdmin() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// Record a browsing event when a user views a product
export async function recordBrowsingEvent(userId: string, productId: string) {
  return prisma.browsingEvent.create({
    data: { userId, productId },
  });
}
