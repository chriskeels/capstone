// app/page.tsx
// Public landing page — dark candlelit aesthetic.

import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";

export default async function HomePage() {
  const featured = await getFeaturedProducts(3);

  return (
    <main className="min-h-screen bg-bark text-cream">

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-glow-gold" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="section-label-divider mb-8">
            Hand-poured · Intentional · Soy wax
          </div>

          <h1 className="font-serif font-light text-[clamp(56px,9vw,104px)] leading-[0.95] text-cream mb-8">
            Light your<br />
            <em className="text-gold not-italic">inner glow.</em>
          </h1>

          <p className="text-fog text-base md:text-lg leading-relaxed mb-10 max-w-md mx-auto font-light">
            Rituals rooted in rest. Candles crafted for the moments that matter most to you.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/products" className="btn-primary">
              Explore Collection
            </Link>
            <Link href="/rituals/new" className="btn-ghost">
              Create a Ritual
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-y border-ash">
        <div className="max-w-4xl mx-auto px-6 py-7 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "12+", label: "Scents" },
            { value: "100%", label: "Soy Wax" },
            { value: "60hr", label: "Burn Time" },
            { value: "AI", label: "Ritual Generator" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="font-serif font-light text-3xl text-gold mb-1">{value}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-dusk">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── About ── */}
      <section id="about" className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <p className="section-label mb-3">About</p>
          <h2 className="font-serif font-light text-4xl md:text-5xl text-cream mb-6">
            Rituals rooted in intention.
          </h2>
          <p className="text-fog leading-relaxed max-w-2xl">
            Get Up &amp; Glo blends quiet luxury with mindful ritual. Each candle is hand-poured with premium soy wax, crafted scents, and a calm design to help you create a moment of stillness in your day.
          </p>
        </div>
      </section>

      {/* ── Featured products ── */}
      {featured.length > 0 && (
        <section className="px-6 py-24 max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-label mb-3">The Collection</p>
              <h2 className="font-serif font-light text-4xl md:text-5xl text-cream">
                Made for your ritual.
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden md:inline-flex text-sm text-gold border-b border-gold/40 pb-0.5 hover:border-gold transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group block"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-ember mb-4 border border-ash group-hover:border-gold/30 transition-colors">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.imageAlt ?? product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl opacity-10">🕯</span>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bark/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="font-serif text-xl text-cream">{product.name}</p>
                    <p className="text-sm text-fog mt-0.5">
                      ${Number(product.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/products" className="btn-ghost">View all candles</Link>
          </div>
        </section>
      )}

      {/* ── Ritual generator CTA ── */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto bg-ember border border-ash rounded-3xl px-8 md:px-16 py-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-glow-top pointer-events-none" />
          <div className="relative z-10">
            <p className="section-label mb-5">AI-Powered</p>
            <h2 className="font-serif font-light text-4xl md:text-5xl text-cream mb-6">
              Create Your Perfect Ritual
            </h2>
            <p className="text-fog leading-relaxed max-w-md mx-auto mb-10">
              Tell us how you're feeling and how much time you have.
              We'll build a personalized self-care ritual around you.
            </p>
            <Link href="/ritual/new" className="btn-primary">
              Generate a Ritual
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
