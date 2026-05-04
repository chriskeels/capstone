// lib/ritualPrompt.ts
// Prompt template system for AI ritual generation.
// Builds structured prompts based on user inputs.

export type RitualInput = {
  mood: string;
  timeAvailable: number;       // in minutes
  productName?: string;        // optional candle name
  productScent?: string;       // optional scent notes
  productDescription?: string; // optional product description
};

export type RitualStep = {
  step: number;
  title: string;
  instruction: string;
  duration: string;            // e.g. "2 minutes", "5 minutes"
};

export type GeneratedRitual = {
  title: string;
  summary: string;
  steps: RitualStep[];
};

// Builds the system prompt that shapes the AI's persona and output format
export function buildSystemPrompt(): string {
  return `You are a gentle, intentional self-care guide for Get Up & Glo — a candle brand rooted in rest, inner peace, and mindful living. Your role is to create personalized self-care rituals that help people slow down and reconnect with themselves.

Your rituals should feel:
- Warm, grounded, and accessible — not clinical or prescriptive
- Rooted in sensory experience, especially scent and candlelight
- Genuinely restorative, not performative
- Realistic for the time available

Always respond with a single valid JSON object matching this exact structure, with no additional text or markdown:
{
  "title": "A short evocative ritual name (max 8 words)",
  "summary": "One sentence describing the essence of this ritual (max 25 words)",
  "steps": [
    {
      "step": 1,
      "title": "Step name (3-5 words)",
      "instruction": "Clear, sensory-rich instruction for this step",
      "duration": "X minutes"
    }
  ]
}

Guidelines:
- Generate between 3 and 6 steps depending on time available
- Each step should fit naturally within the total time given
- If a candle is specified, weave it meaningfully into the ritual — not as an afterthought
- Use gentle, second-person language ("Light your candle", "Take a breath", "Let yourself...")
- Never suggest anything that requires purchasing additional products
- Keep instructions grounded and doable`;
}

// Builds the user-facing prompt from their inputs
export function buildUserPrompt(input: RitualInput): string {
  const parts: string[] = [
    `I have ${input.timeAvailable} minutes and I'm feeling ${input.mood}.`,
  ];

  if (input.productName) {
    parts.push(`I'd like to use my ${input.productName} candle for this ritual.`);
  }

  if (input.productScent) {
    parts.push(`It has a ${input.productScent} scent.`);
  }

  if (input.productDescription) {
    parts.push(`Here's a little about it: ${input.productDescription}`);
  }

  parts.push("Please create a personalized self-care ritual for me.");

  return parts.join(" ");
}

// Formats the raw prompt string stored in the DB for traceability
export function buildRawPrompt(input: RitualInput): string {
  return `[SYSTEM]\n${buildSystemPrompt()}\n\n[USER]\n${buildUserPrompt(input)}`;
}
