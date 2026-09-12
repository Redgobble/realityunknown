import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return new Response("Text is required.", {
        status: 400,
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response("OPENROUTER_API_KEY is missing.", {
        status: 500,
      });
    }

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
          model:
            process.env.OPENROUTER_TTS_MODEL ||
            "mistralai/voxtral-mini-tts-2603",

          input: text,

          voice:
            process.env.OPENROUTER_TTS_VOICE ||
            "en_paul_neutral",

          response_format: "mp3",

          speed: 0.96,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("OPENROUTER TTS ERROR:", errorText);

      return new Response(errorText || "TTS failed.", {
        status: response.status,
      });
    }

    const audio = await response.arrayBuffer();

    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("TTS ERROR:", error);

    return new Response("Voice generation failed.", {
      status: 500,
    });
  }
}
