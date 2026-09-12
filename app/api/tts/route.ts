import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const text =
      typeof body?.text === "string"
        ? body.text.trim()
        : "";

    if (!text) {
      return new Response(
        "Text is required.",
        { status: 400 },
      );
    }

    if (text.length > 3000) {
      return new Response(
        "Narration is too long.",
        { status: 400 },
      );
    }

    const apiKey =
      process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(
        "OPENROUTER_API_KEY is missing.",
        { status: 500 },
      );
    }

    const model =
      process.env.OPENROUTER_TTS_MODEL ||
      "x-ai/grok-voice-tts-1.0";

    const voice =
      process.env.OPENROUTER_TTS_VOICE ||
      "eve";

    const response = await fetch(
      "https://openrouter.ai/api/v1/audio/speech",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Reality Unknown",
        },

        body: JSON.stringify({
          model,
          input: text,
          voice,
          response_format: "mp3",
          speed: 0.96,
        }),
      },
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "OPENROUTER TTS ERROR:",
        errorText,
      );

      return new Response(
        errorText ||
          "OpenRouter narration failed.",
        {
          status: response.status,
        },
      );
    }

    const audio =
      await response.arrayBuffer();

    return new Response(audio, {
      status: 200,

      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "Content-Length": String(
          audio.byteLength,
        ),
      },
    });
  } catch (error) {
    console.error(
      "TTS ROUTE ERROR:",
      error,
    );

    return new Response(
      "Voice generation failed.",
      { status: 500 },
    );
  }
}
