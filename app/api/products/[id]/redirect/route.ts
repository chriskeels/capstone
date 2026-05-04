// app/api/products/[id]/redirect/route.ts
// Handles external purchase redirects.
// Validates the product exists and is active before redirecting.
// This keeps external URLs out of the frontend and lets you
// track or swap purchase platforms in one place.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { externalUrl: true, isActive: true, name: true },
  });

  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (!product.externalUrl) {
    return NextResponse.json(
      { error: "No purchase link available for this product" },
      { status: 404 }
    );
  }

  // 307 temporary redirect — preserves the HTTP method
  return NextResponse.redirect(product.externalUrl, { status: 307 });
}
