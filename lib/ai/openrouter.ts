const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

type OpenRouterContentPart =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image_url";
      image_url: {
        url: string;
      };
    };

type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | OpenRouterContentPart[];
};

type OpenRouterOptions = {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  maxTokens?: number;
};

export async function callOpenRouter({
  model,
  messages,
  temperature = 0.4,
  maxTokens = 1200,
}: OpenRouterOptions): Promise<string> {
  const apiKey =
    process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is missing.",
    );
  }

  const response = await fetch(
    OPENROUTER_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "Reality Unknown",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ??
        `OpenRouter request failed with status ${response.status}.`,
    );
  }

  const content =
    data?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const text = content
      .map(
        (part: { text?: string }) =>
          part?.text ?? "",
      )
      .join("")
      .trim();

    if (text) return text;
  }

  throw new Error(
    "OpenRouter returned no usable text content.",
  );
}
