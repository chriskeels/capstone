// app/dashboard/page.tsx
// Protected user dashboard.
// Shows activity stats, ritual history, and AI product recommendations.

import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getUserRituals, getUserActivityStats } from "@/lib/rituals";
import { getUserRecommendations, generateRecommendations } from "@/lib/recommendations";
import type { RitualStep } from "@/lib/ritualPrompt";

export default async function DashboardPage() {
  const { user, error } = await getCurrentUser();

  if (!user) {
    console.error("Dashboard:", error);
    redirect("/sign-in");
  }

  // Fetch all dashboard data in parallel
  const [rituals, stats, savedRecs] = await Promise.all([
    getUserRituals(user.id),
    getUserActivityStats(user.id),
    getUserRecommendations(user.id),
  ]);

  // Generate fresh recommendations if none exist yet
  const recommendations =
    savedRecs.length > 0
      ? savedRecs
      : await generateRecommendations(user.id).then(() =>
          getUserRecommendations(user.id)
        );

  return (
    <main className="min-h-screen bg-[#FDFAF6] px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-14">

        {/* Header */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#B89F86] mb-2">
            Your space
          </p>
          <h1 className="font-serif text-4xl text-[#2C2416]">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
        </div>

        {/* Activity stats */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#B89F86] mb-5">
            Your activity
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#EDE6D9] rounded-2xl p-5">
              <p className="text-3xl font-serif text-[#2C2416]">
                {stats.totalRituals}
              </p>
              <p className="text-xs text-[#9A8470] mt-1 uppercase tracking-wider">
                Rituals created
              </p>
            </div>
            {stats.topMoods.slice(0, 3).map(({ mood, count }) => (
              <div key={mood} className="bg-[#EDE6D9] rounded-2xl p-5">
                <p className="text-3xl font-serif text-[#2C2416] capitalize">
                  {mood}
                </p>
                <p className="text-xs text-[#9A8470] mt-1 uppercase tracking-wider">
                  {count}× this mood
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Create ritual CTA */}
        <section>
          <Link
            href="/rituals/new"
            className="flex items-center justify-between bg-[#2C2416] text-[#FDFAF6] rounded-2xl px-8 py-6 hover:bg-[#3D3020] transition-colors group"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#B89F86] mb-1">
                Ready?
              </p>
              <p className="font-serif text-2xl">Create a new ritual</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </section>

        {/* Ritual history */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#B89F86] mb-6">
            Your rituals
          </h2>

          {rituals.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#D9CEBC] rounded-2xl">
              <p className="text-[#B89F86] mb-4">No rituals yet.</p>
              <Link
                href="/rituals/new"
                className="text-sm text-[#2C2416] underline underline-offset-4"
              >
                Create your first ritual
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {rituals.map((ritual) => {
                const steps = ritual.steps as RitualStep[];
                return (
                  <div
                    key={ritual.id}
                    className="bg-white border border-[#EDE6D9] rounded-2xl p-6 hover:border-[#D9CEBC] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          {ritual.mood && (
                            <span className="text-[10px] uppercase tracking-widest text-[#B89F86] bg-[#F5F0E8] px-2.5 py-0.5 rounded-full capitalize">
                              {ritual.mood}
                            </span>
                          )}
                          {ritual.timeAvailable && (
                            <span className="text-[10px] uppercase tracking-widest text-[#B89F86] bg-[#F5F0E8] px-2.5 py-0.5 rounded-full">
                              {ritual.timeAvailable} min
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-xl text-[#2C2416]">
                          {ritual.title ?? "Untitled ritual"}
                        </h3>
                        {ritual.summary && (
                          <p className="text-sm text-[#9A8470] mt-1">
                            {ritual.summary}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-[#C4B5A0] whitespace-nowrap pt-1">
                        {new Date(ritual.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Step previews */}
                    <div className="space-y-2">
                      {steps.slice(0, 3).map((step) => (
                        <div key={step.step} className="flex items-start gap-3 text-sm">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EDE6D9] flex items-center justify-center text-[10px] font-medium text-[#7A6652] mt-0.5">
                            {step.step}
                          </span>
                          <span className="text-[#7A6652] leading-relaxed">
                            {step.title}
                            <span className="text-[#C4B5A0] ml-2">
                              · {step.duration}
                            </span>
                          </span>
                        </div>
                      ))}
                      {steps.length > 3 && (
                        <p className="text-xs text-[#C4B5A0] pl-8">
                          +{steps.length - 3} more steps
                        </p>
                      )}
                    </div>

                    {/* Linked product */}
                    {ritual.product && (
                      <div className="mt-4 pt-4 border-t border-[#F0EBE0] flex items-center gap-2">
                        {ritual.product.imageUrl && (
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#EDE6D9] flex-shrink-0">
                            <Image
                              src={ritual.product.imageUrl}
                              alt={ritual.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <Link
                          href={`/products/${ritual.product.slug}`}
                          className="text-xs text-[#9A8470] hover:text-[#2C2416] transition-colors"
                        >
                          Made with {ritual.product.name}
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-[0.2em] text-[#B89F86] mb-6">
              Chosen for you
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id ?? rec.product.id}
                  href={`/products/${rec.product.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#EDE6D9] mb-3">
                    {rec.product.imageUrl ? (
                      <Image
                        src={rec.product.imageUrl}
                        alt={rec.product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl opacity-25">🕯</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif text-[#2C2416] group-hover:text-[#7A6652] transition-colors mb-1">
                    {rec.product.name}
                  </h3>
                  {rec.reason && (
                    <p className="text-xs text-[#9A8470] leading-relaxed">
                      {rec.reason}
                    </p>
                  )}
                  <p className="text-sm font-medium text-[#2C2416] mt-2">
                    ${Number(rec.product.price).toFixed(2)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
