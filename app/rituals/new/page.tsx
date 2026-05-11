"use client";

// app/ritual/new/page.tsx
// User-facing ritual generator page.
// Accepts mood, time available, and optional product context.
// Calls the generate API and displays the result inline.

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

type RitualStep = {
  step: number;
  title: string;
  instruction: string;
  duration: string;
};

type GeneratedRitual = {
  id: string;
  title: string;
  summary: string;
  steps: RitualStep[];
  mood: string;
  timeAvailable: number;
};

const MOODS = [
  { label: "Anxious", value: "anxious" },
  { label: "Tired", value: "tired" },
  { label: "Overwhelmed", value: "overwhelmed" },
  { label: "Sad", value: "sad" },
  { label: "Restless", value: "restless" },
  { label: "Grateful", value: "grateful" },
  { label: "Joyful", value: "joyful" },
  { label: "Unfocused", value: "unfocused" },
];

const TIME_OPTIONS = [
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
  { label: "20 min", value: 20 },
  { label: "30 min", value: 30 },
];

function NewRitualPageContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [mood, setMood] = useState("");
  const [customMood, setCustomMood] = useState("");
  const [timeAvailable, setTimeAvailable] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ritual, setRitual] = useState<GeneratedRitual | null>(null);

  const { isSignedIn } = useAuth();

  const effectiveMood = mood === "custom" ? customMood : mood;

  async function handleGenerate() {
    if (!isSignedIn) {
      setError("You must be signed in to generate rituals. Please sign in first.");
      return;
    }

    if (!effectiveMood.trim()) {
      setError("Please select or describe how you're feeling.");
      return;
    }

    setLoading(true);
    setError("");
    setRitual(null);

    try {
      const res = await fetch("/api/rituals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: effectiveMood.trim(),
          timeAvailable,
          productId: productId ?? undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setRitual(data.ritual);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bark text-cream">
      <div className="relative px-6 py-16">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-glow-gold" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Back button */}
          <div className="mb-8">
            <Link
              href="/"
              className="btn-primary inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm max-w-max"
            >
              ← Back to home
            </Link>
          </div>

          {/* Header */}
          <div className="mb-12">
            <p className="section-label mb-3">
              Your ritual
            </p>
            <h1 className="font-serif text-4xl text-cream leading-tight">
              Let's create your moment.
            </h1>
            <p className="text-fog mt-3 leading-relaxed">
              Tell us how you're feeling and how much time you have. We'll build
              a ritual around you.
            </p>
          </div>

          {!isSignedIn ? (
            <div className="bg-ember border border-ash rounded-xl px-5 py-4 text-sm text-fog">
              You must be signed in to generate rituals. <Link href="/sign-in" className="text-gold underline">Sign in here</Link>.
            </div>
          ) : !ritual ? (
          <div className="space-y-10">

            {/* Mood selector */}
            <div>
              <label className="block text-sm font-medium text-cream mb-4">
                How are you feeling right now?
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`px-4 py-2 rounded-full text-sm border transition-all ${
                      mood === m.value
                        ? "bg-gold text-bark border-gold shadow-sm ring-2 ring-white"
                        : "bg-ember/60 text-fog border-ash hover:border-gold hover:bg-ember"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
                <button
                  onClick={() => setMood("custom")}
                  className={`px-4 py-2 rounded-full text-sm border transition-all ${
                    mood === "custom"
                      ? "bg-gold text-bark border-gold shadow-sm ring-2 ring-white"
                      : "bg-ember/60 text-fog border-ash hover:border-gold hover:bg-ember"
                  }`}
                >
                  Something else...
                </button>
              </div>

              {mood === "custom" && (
                <input
                  type="text"
                  value={customMood}
                  onChange={(e) => setCustomMood(e.target.value)}
                  placeholder="Describe how you're feeling..."
                  className="input"
                />
              )}
            </div>

            {/* Time selector */}
            <div>
              <label className="block text-sm font-medium text-cream mb-4">
                How much time do you have?
              </label>
              <div className="flex gap-2 flex-wrap">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTimeAvailable(t.value)}
                    className={`px-5 py-2.5 rounded-full text-sm border transition-all ${
                      timeAvailable === t.value
                        ? "bg-gold text-bark border-gold shadow-sm ring-2 ring-white"
                        : "bg-ember/60 text-fog border-ash hover:border-gold hover:bg-ember"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product context notice */}
            {productId && (
              <div className="bg-ember border border-ash rounded-xl px-5 py-4 text-sm text-fog">
                ✦ Your selected candle will be woven into this ritual.
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !effectiveMood.trim()}
              className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Creating your ritual..." : "Create my ritual"}
            </button>
          </div>
        ) : (
          /* Generated ritual display */
          <div className="space-y-8">
            <div className="border-b border-ash pb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-gold mb-2">
                {ritual.mood} · {ritual.timeAvailable} minutes
              </p>
              <h2 className="font-serif text-3xl text-cream mb-3">
                {ritual.title}
              </h2>
              <p className="text-fog leading-relaxed">{ritual.summary}</p>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              {ritual.steps.map((step) => (
                <div key={step.step} className="flex gap-5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ember flex items-center justify-center border border-ash">
                    <span className="text-xs font-medium text-gold">
                      {step.step}
                    </span>
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-medium text-cream text-sm">
                        {step.title}
                      </h3>
                      <span className="text-xs text-gold bg-ember px-2.5 py-0.5 rounded-full border border-ash">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-fog text-sm leading-relaxed">
                      {step.instruction}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-ash">
              <button
                onClick={() => {
                  setRitual(null);
                  setMood("");
                  setCustomMood("");
                }}
                className="flex-1 bg-ember/60 border border-ash text-fog rounded-full py-3.5 text-sm hover:border-gold hover:text-gold hover:bg-ember transition-all"
              >
                Create another
              </button>
              <Link
                href="/dashboard"
                className="flex-1 text-center btn-primary py-3.5 text-sm"
              >
                View my rituals
              </Link>
            </div>
          </div>
        )}
        </div>
      </div>
    </main>
  );
}

export default function NewRitualPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewRitualPageContent />
    </Suspense>
  );
}
