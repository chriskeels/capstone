// app/api/rituals/generate/route.ts
// Generates a personalized self-care ritual using OpenAI gpt-4o-mini.
// Requires authentication. Saves the result to the database.

import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/getCurrentUser";
import {
  buildSystemPrompt,
  buildUserPrompt,
  buildRawPrompt,
  type RitualInput,
  type GeneratedRitual,
} from "@/lib/ritualPrompt";

export async function POST(req: Request) {
  // Auth check
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and validate request body
  const body = await req.json();
  const { mood, timeAvailable, productId } = body;

  if (!mood || typeof mood !== "string" || mood.trim().length === 0) {
    return NextResponse.json(
      { error: "mood is required" },
      { status: 400 }
    );
  }

  if (!timeAvailable || typeof timeAvailable !== "number" || timeAvailable < 1) {
    return NextResponse.json(
      { error: "timeAvailable must be a positive number (minutes)" },
      { status: 400 }
    );
  }

  // Optionally load product details to enrich the prompt
  let product = null;
  if (productId) {
    product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, scent: true, shortDescription: true },
    });
  }

  const ritualInput: RitualInput = {
    mood: mood.trim(),
    timeAvailable,
    productName: product?.name,
    productScent: product?.scent ?? undefined,
    productDescription: product?.shortDescription ?? undefined,
  };

  // Call OpenAI
  let generated: GeneratedRitual;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(ritualInput) },
      ],
      temperature: 0.8,      // slightly creative but still coherent
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("Empty response from OpenAI");
    }

    generated = JSON.parse(raw) as GeneratedRitual;

    // Validate the shape of the response
    if (!generated.title || !generated.summary || !Array.isArray(generated.steps)) {
      throw new Error("Invalid ritual structure returned from AI");
    }
  } catch (err) {
    console.error("[Ritual Generation] OpenAI error:", err);
    return NextResponse.json(
      { error: "Failed to generate ritual. Please try again." },
      { status: 500 }
    );
  }

  // Save to database
  try {
    const ritual = await prisma.ritual.create({
      data: {
        userId: user.id,
        productId: productId ?? null,
        mood: mood.trim(),
        timeAvailable,
        title: generated.title,
        summary: generated.summary,
        steps: generated.steps,
        rawPrompt: buildRawPrompt(ritualInput),
      },
    });

    return NextResponse.json(
      {
        ritual: {
          id: ritual.id,
          title: generated.title,
          summary: generated.summary,
          steps: generated.steps,
          mood: ritual.mood,
          timeAvailable: ritual.timeAvailable,
          createdAt: ritual.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Ritual Generation] Database error:", err);
    return NextResponse.json(
      { error: "Ritual generated but could not be saved." },
      { status: 500 }
    );
  }
}
