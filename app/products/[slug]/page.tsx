// app/products/[slug]/page.tsx
// Individual product detail page.
// Records a browsing event if the user is logged in,
// then shows full product info with an external purchase link.

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getProductBySlug } from "@/lib/products";
import { recordBrowsingEvent } from "@/lib/products";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.isActive) {
    notFound();
  }

  // Silently record browsing event if the user is signed in
  const { userId: clerkId } = await auth();
  if (clerkId) {
    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (dbUser) {
      // Fire-and-forget — don't await so it doesn't slow the page
      recordBrowsingEvent(dbUser.id, product.id).catch(console.error);
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFAF6]">
      {/* Breadcrumb */}
      <div className="px-6 pt-8 max-w-6xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-[#B89F86]">
          <Link href="/products" className="hover:text-[#2C2416] transition-colors">
            Collection
          </Link>
          <span>/</span>
          <span className="text-[#7A6652]">{product.name}</span>
        </nav>
      </div>

      {/* Product layout */}
      <div className="px-6 py-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

          {/* Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#EDE6D9]">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.imageAlt ?? product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl opacity-20">🕯</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B89F86] mb-3">
              {product.category.charAt(0) +
                product.category.slice(1).toLowerCase()}
            </p>

            <h1 className="font-serif text-4xl text-[#2C2416] leading-tight mb-4">
              {product.name}
            </h1>

            <p className="text-2xl font-medium text-[#2C2416] mb-6">
              ${Number(product.price).toFixed(2)}
            </p>

            <p className="text-[#7A6652] leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Product details */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {product.scent && (
                <div className="bg-[#EDE6D9] rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-[#B89F86] mb-1">
                    Scent
                  </p>
                  <p className="text-sm text-[#2C2416] font-medium">
                    {product.scent}
                  </p>
                </div>
              )}
              {product.burnTime && (
                <div className="bg-[#EDE6D9] rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-[#B89F86] mb-1">
                    Burn time
                  </p>
                  <p className="text-sm text-[#2C2416] font-medium">
                    {product.burnTime} hours
                  </p>
                </div>
              )}
              {product.size && (
                <div className="bg-[#EDE6D9] rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-[#B89F86] mb-1">
                    Size
                  </p>
                  <p className="text-sm text-[#2C2416] font-medium">
                    {product.size}
                  </p>
                </div>
              )}
              {product.ingredients && (
                <div className="bg-[#EDE6D9] rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-[#B89F86] mb-1">
                    Made with
                  </p>
                  <p className="text-sm text-[#2C2416] font-medium">
                    {product.ingredients}
                  </p>
                </div>
              )}
            </div>

            {/* CTA — redirects to external purchase platform */}
            <a
              href={`/api/products/${product.id}/redirect`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#2C2416] text-[#FDFAF6] rounded-full px-8 py-4 text-sm tracking-wide hover:bg-[#3D3020] transition-colors"
            >
              Purchase this candle
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 7h10M7 2l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            {/* Generate ritual CTA */}
            <Link
              href={`/rituals/new?productId=${product.id}`}
              className="mt-3 inline-flex items-center justify-center gap-2 border border-[#D9CEBC] text-[#7A6652] rounded-full px-8 py-4 text-sm tracking-wide hover:border-[#2C2416] hover:text-[#2C2416] transition-colors"
            >
              Create a ritual with this candle
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
