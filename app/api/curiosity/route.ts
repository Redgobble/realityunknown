import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai/openrouter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const question =
      typeof body?.question === "string"
        ? body.question.trim()
        : "";

    const playerName =
      typeof body?.playerName === "string"
        ? body.playerName
        : "Explorer";

    const story = body?.story;

    if (!question || !story) {
      return NextResponse.json(
        {
          success: false,
          error: "Question and discovery context are required.",
        },
        { status: 400 },
      );
    }

    const prompt = `
You are the Watcher in Reality Unknown.

Player:
${playerName}

The player photographed and investigated this REAL discovery:

${JSON.stringify(story, null, 2)}

The player asks:

"${question}"

Answer ONLY from the supplied discovery context.

Rules:
- Be specific to this discovery.
- Do not invent historical facts.
- If the context does not establish something, say that clearly.
- If exact identification is uncertain, preserve that uncertainty.
- Answer in 2 or 3 short paragraphs.
- Make the answer interesting and conversational.
- Do not use markdown.
- Do not mention that you are an AI.
- Do not ask another question at the end.

Return JSON only:

{
  "answer": ""
}
`;

    const result = await callOpenRouter({
      model:
        process.env.OPENROUTER_GAME_MASTER_MODEL ||
        process.env.OPENROUTER_MODEL ||
        "openai/gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const raw =
      typeof result === "string"
        ? result
        : JSON.stringify(result);

    let parsed: { answer?: string };

    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);

      if (!match) {
        throw new Error(
          "Invalid curiosity response.",
        );
      }

      parsed = JSON.parse(match[0]);
    }

    return NextResponse.json({
      success: true,
      answer:
        parsed.answer ||
        "The Watcher cannot establish that detail with enough confidence yet.",
    });
  } catch (error) {
    console.error("CURIOSITY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Curiosity request failed.",
      },
      { status: 500 },
    );
  }
}
