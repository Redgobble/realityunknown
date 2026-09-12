import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai/openrouter";
import { parseAIJson } from "@/lib/ai/parseJson";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const image = body?.image;
    const world = body?.world;
    const story = body?.story;

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: "Target image is required.",
        },
        { status: 400 },
      );
    }

    if (!world || !story) {
      return NextResponse.json(
        {
          success: false,
          error:
            "World snapshot and mission are required.",
        },
        { status: 400 },
      );
    }

    const prompt = `
You are the final validation system for Reality Unknown.

The player photographed a real-world target.

Original world observation:
${JSON.stringify(world, null, 2)}

Mission:
${JSON.stringify(
  {
    targetObject: story.targetObject,
    targetHint: story.targetHint,
    mission: story.mission,
    riddle: story.riddle,
  },
  null,
  2,
)}

Now inspect the NEW camera image.

Determine whether the photographed scene actually contains the intended target.

IMPORTANT:
- Do not assume the target exists.
- Do not trust the player's claim.
- Compare the image against the original world observation.
- A visually similar object is not automatically correct.
- Only return valid=true when there is convincing visual evidence.
- Do not invent details.

Return ONLY JSON:

{
  "valid": true,
  "confidence": 0.0,
  "matchedObject": "object name",
  "reason": "short explanation",
  "feedback": "player-facing feedback",
  "xp": 120
}

confidence must be between 0 and 1.

Award:
- 80-180 XP when valid
- 0 XP when invalid
`;

    const text = await callOpenRouter({
      model:
        process.env.OPENROUTER_VALIDATION_MODEL ||
        "google/gemini-3-flash-preview",

      temperature: 0.1,
      maxTokens: 700,

      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
    });

    const result =
      parseAIJson<Record<string, unknown>>(text);

    const valid =
      result.valid === true &&
      Number(result.confidence) >= 0.62;

    return NextResponse.json({
      success: true,
      data: {
        valid,
        confidence:
          Number(result.confidence) || 0,
        matchedObject:
          result.matchedObject || "",
        reason:
          result.reason || "",
        feedback:
          result.feedback ||
          (valid
            ? "Target confirmed."
            : "That does not appear to be the target."),
        xp: valid
          ? Math.max(
              80,
              Math.min(
                180,
                Number(result.xp) || 100,
              ),
            )
          : 0,
      },
    });
  } catch (error) {
    console.error(
      "VALIDATION ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Target validation failed.",
      },
      { status: 500 },
    );
  }
}
