// app/products/page.tsx
// Public product catalog page.
// Displays all active candles with category filtering.

import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/products";
import type { ProductCategory } from "@prisma/client";

const CATEGORIES: { label: string; value: ProductCategory | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Relaxation", value: "RELAXATION" },
  { label: "Focus", value: "FOCUS" },
  { label: "Romance", value: "ROMANCE" },
  { label: "Energy", value: "ENERGY" },
  { label: "Sleep", value: "SLEEP" },
  { label: "Seasonal", value: "SEASONAL" },
  { label: "Limited", value: "LIMITED" },
];

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const { category } = await searchParams;

  const activeCategory =
    category && category !== "ALL"
      ? (category as ProductCategory)
      : undefined;

  const products = await getProducts(activeCategory);

  return (
    <main className="min-h-screen bg-[#FDFAF6]">
      {/* Header */}
      <section className="px-6 pt-16 pb-10 max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            ← Back home
          </Link>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#B89F86] mb-3">
          The Collection
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-[#2C2416] leading-tight">
          Hand-poured for your ritual.
        </h1>
      </section>

      {/* Category filter */}
      <div className="px-6 max-w-6xl mx-auto mb-10">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive =
              cat.value === "ALL"
                ? !category || category === "ALL"
                : category === cat.value;

            return (
              <Link
                key={cat.value}
                href={`/products?category=${cat.value}`}
                className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                  isActive
                    ? "bg-[#2C2416] text-[#FDFAF6] border-[#2C2416] shadow-sm"
                    : "bg-[#F4EEE2] text-[#2C2416] border-[#D9CEBC] hover:border-[#2C2416] hover:bg-[#EFE4D4]"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Product grid */}
      <div className="px-6 max-w-6xl mx-auto pb-20">
        {products.length === 0 ? (
          <div className="text-center py-24 text-[#B89F86]">
            <p className="text-lg">No candles found in this category.</p>
            <Link
              href="/products"
              className="mt-4 inline-flex btn-primary text-sm"
            >
              View all candles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group block"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#EDE6D9] mb-4">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.imageAlt ?? product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    // Placeholder when no image is set
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl opacity-30">🕯</span>
                    </div>
                  )}

                  {product.isFeatured && (
                    <span className="absolute top-3 left-3 bg-[#2C2416] text-[#FDFAF6] text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#B89F86]">
                    {product.category.charAt(0) +
                      product.category.slice(1).toLowerCase()}
                  </p>
                  <h2 className="font-serif text-[#2C2416] text-lg leading-snug group-hover:text-[#7A6652] transition-colors">
                    {product.name}
                  </h2>
                  {product.shortDescription && (
                    <p className="text-sm text-[#9A8470] line-clamp-2">
                      {product.shortDescription}
                    </p>
                  )}
                  <p className="text-[#2C2416] font-medium pt-1">
                    ${Number(product.price).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
