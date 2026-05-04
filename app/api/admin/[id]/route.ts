// app/api/admin/products/[id]/route.ts
// Admin-only API routes for a single product.
// PATCH  /api/admin/products/[id]  — update a product
// DELETE /api/admin/products/[id]  — soft delete (sets isActive: false)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/getCurrentUser";

type Props = {
  params: Promise<{ id: string }>;
};

// PATCH — update any product fields
export async function PATCH(req: Request, { params }: Props) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const product = await prisma.product.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
}

// DELETE — soft delete by setting isActive to false
// Hard deletes are avoided to preserve ritual/recommendation history
export async function DELETE(_req: Request, { params }: Props) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
}
