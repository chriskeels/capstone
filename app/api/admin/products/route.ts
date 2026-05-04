// app/api/admin/products/route.ts
// Admin-only API routes for managing the product catalog.
// GET  /api/admin/products        — list all products
// POST /api/admin/products        — create a new product

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/getCurrentUser";
import type { ProductCategory } from "@prisma/client";

// GET — fetch all products (including inactive)
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

// POST — create a new product
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const {
    name,
    slug,
    description,
    shortDescription,
    price,
    imageUrl,
    imageAlt,
    externalUrl,
    category,
    scent,
    burnTime,
    size,
    ingredients,
    isFeatured,
    stockStatus,
  } = body;

  // Basic validation
  if (!name || !slug || !description || !price || !externalUrl || !category) {
    return NextResponse.json(
      { error: "Missing required fields: name, slug, description, price, externalUrl, category" },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription: shortDescription ?? null,
        price,
        imageUrl: imageUrl ?? null,
        imageAlt: imageAlt ?? null,
        externalUrl,
        category: category as ProductCategory,
        scent: scent ?? null,
        burnTime: burnTime ?? null,
        size: size ?? null,
        ingredients: ingredients ?? null,
        isFeatured: isFeatured ?? false,
        stockStatus: stockStatus ?? "in_stock",
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    // Handle unique constraint violation on slug
    if (
      err instanceof Error &&
      err.message.includes("Unique constraint")
    ) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 409 }
      );
    }

    console.error("Failed to create product:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
