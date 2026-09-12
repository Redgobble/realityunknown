import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai/openrouter";
import { parseAIJson } from "@/lib/ai/parseJson";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const image =
      typeof body?.image === "string"
        ? body.image
        : "";

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: "Camera image is required.",
        },
        { status: 400 },
      );
    }

    const prompt = `
You are the Reality Unknown World Observer.

Analyze ONLY what is genuinely visible in the supplied camera image.

This is a real-world exploration game.

Your job is to identify:
- the environment
- visible objects
- landmarks
- architecture
- monuments
- statues
- buildings
- signs
- artwork
- historical-looking structures
- details that could become clues

IMPORTANT:
Never invent an object.
Never claim a historical fact unless the image gives enough evidence.
If the exact landmark cannot be identified, describe what is visibly present.
If something appears to be a monument or historical place, mark it as potentially historical.

Return ONLY valid JSON.

{
  "environment": "indoor | outdoor | unknown",
  "placeType": "street | monument | historical_place | building | museum | temple | fort | statue | natural_place | object | unknown",
  "setting": "short description",
  "landmarkCandidate": "specific visible landmark if identifiable, otherwise empty string",
  "historicalCandidate": true,
  "objects": [
    {
      "name": "visible object",
      "description": "what is actually visible",
      "interesting": true
    }
  ],
  "visualClues": [
    "visible clue 1",
    "visible clue 2"
  ],
  "storyPotential": "why this scene could become an investigation",
  "confidence": 0.0
}

Rules:
- Maximum 8 objects.
- Maximum 5 visual clues.
- confidence must be between 0 and 1.
- Do not hallucinate names, dates, kings, dynasties, wars or historical events.
`;

    const text = await callOpenRouter({
      model:
        process.env.OPENROUTER_VISION_MODEL ||
        "google/gemini-3-flash-preview",

      temperature: 0.1,
      maxTokens: 900,

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

    const result = parseAIJson<any>(text);

    return NextResponse.json({
      success: true,
      data: {
        environment:
          typeof result.environment === "string"
            ? result.environment
            : "unknown",

        placeType:
          typeof result.placeType === "string"
            ? result.placeType
            : "unknown",

        setting:
          typeof result.setting === "string"
            ? result.setting
            : "",

        landmarkCandidate:
          typeof result.landmarkCandidate === "string"
            ? result.landmarkCandidate
            : "",

        historicalCandidate:
          result.historicalCandidate === true,

        objects: Array.isArray(result.objects)
          ? result.objects
          : [],

        visualClues: Array.isArray(result.visualClues)
          ? result.visualClues
          : [],

        storyPotential:
          typeof result.storyPotential === "string"
            ? result.storyPotential
            : "",

        confidence:
          typeof result.confidence === "number"
            ? result.confidence
            : 0,
      },
    });
  } catch (error) {
    console.error("VISION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "World analysis failed.",
      },
      { status: 500 },
    );
  }
}
