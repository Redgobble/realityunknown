import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai/openrouter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const world = body?.world ?? body?.data;
    const playerName = body?.playerName ?? "Explorer";
    const discoveryNumber = body?.discoveryNumber ?? 1;

    if (!world) {
      return NextResponse.json(
        {
          success: false,
          error: "World snapshot is required.",
        },
        { status: 400 },
      );
    }

    const prompt = `
You are the Game Master of "Reality Unknown".

The player's name is "${playerName}".
This is discovery number ${discoveryNumber}.

The player's camera has just observed this REAL WORLD SNAPSHOT:

${JSON.stringify(world, null, 2)}

Your job is to turn this real observation into a beautiful interactive
historical discovery experience.

THIS MUST BE GROUNDED IN THE PHOTOGRAPH.

Do NOT invent a fictional location when the photograph appears to show a
real monument, building, temple, fort, statue, memorial, landmark,
architectural feature, object, or historical place.

If the exact identity cannot be established from the available observation,
say so clearly. Use language such as:
"This appears to be..."
"The architecture suggests..."
"If this is the site I think it is..."

Never claim an exact historical identity without sufficient evidence.

Never invent:
- people
- dates
- rulers
- events
- inscriptions
- architectural features
- objects
- historical facts

that are not supported by the observation or reliable general knowledge
about an identified place.

The experience should feel like the player has discovered something real.

IMPORTANT EXPERIENCE DESIGN:

1. Start with what the player actually found.
2. Explain why the place/object is interesting.
3. Teach the player something genuinely useful or surprising.
4. Use three short story beats instead of one giant wall of text.
5. Each story beat must be short enough to speak naturally.
6. The story question must be answerable from the story.
7. There must be exactly four answer choices.
8. storyQuestionAnswer must be the ZERO-BASED index of the correct answer.
9. Explain why the correct answer is correct.
10. Provide contextual follow-up questions about THIS discovery.
11. Provide visual questions that relate to things visible in the photograph.
12. Create a clue/riddle connected to the discovery.
13. The eventual target must be something that can realistically be checked
    with another camera photograph.
14. The character should feel intelligent, warm, mysterious and curious.
15. Avoid generic fantasy language that has nothing to do with the location.
16. Do not create a random "chosen one" story.
17. Keep everything concise and enjoyable.

Return ONLY valid JSON.

Return exactly this structure:

{
  "discoveryTitle": "",
  "locationType": "monument|historical_place|architecture|object|unknown",
  "subject": "",
  "confidence": 0,

  "historicalStory": "",

  "storyBeats": [
    {
      "title": "What you found",
      "text": "",
      "voiceText": ""
    },
    {
      "title": "Why it matters",
      "text": "",
      "voiceText": ""
    },
    {
      "title": "Look closer",
      "text": "",
      "voiceText": ""
    }
  ],

  "historicalDetails": [
    "",
    "",
    ""
  ],

  "characterOpening": "",
  "characterDialogue": [
    "",
    ""
  ],

  "storyQuestion": "",
  "storyQuestionOptions": [
    "",
    "",
    "",
    ""
  ],
  "storyQuestionAnswer": 0,
  "storyQuestionExplanation": "",

  "curiosityQuestions": [
    "",
    "",
    ""
  ],

  "visualQuestions": [
    "",
    "",
    ""
  ],

  "riddleTitle": "",
  "riddle": "",
  "clue": "",
  "objective": "",
  "targetHint": "",

  "rewardXp": 120
}

FIELD RULES:

discoveryTitle:
Short, cinematic and specific to the discovery.

locationType:
Choose the best category.

subject:
The real thing the camera appears to have found.

confidence:
Number from 0 to 100 representing confidence in the identification.

historicalStory:
A concise factual explanation of the discovered place/object.
Do not make this a giant essay.

storyBeats:
Exactly three beats.

Beat 1:
Explain what the player appears to have found.

Beat 2:
Explain why it matters historically, culturally, architecturally,
scientifically, or visually.

Beat 3:
Give the player one interesting thing to notice when looking at it again.

text:
Readable on screen.

voiceText:
Short natural spoken version.
Keep each voiceText under approximately 45 words.

historicalDetails:
Exactly three short observations.
Prefer concrete facts or clearly visible details.

characterOpening:
A short direct line addressing "${playerName}".

characterDialogue:
Exactly two short lines.
The character should react to the actual discovery.

storyQuestion:
One meaningful question based ONLY on the story.

storyQuestionOptions:
Exactly four options.

storyQuestionAnswer:
ZERO-BASED index:
0 = first option
1 = second option
2 = third option
3 = fourth option

The answer must actually be supported by the story.

storyQuestionExplanation:
Briefly explain the correct answer.

curiosityQuestions:
Exactly three questions the player could ask about THIS SPECIFIC discovery.
They must not be generic questions like "Tell me more."

visualQuestions:
Exactly three questions about things the player can inspect in the
photograph.

riddleTitle:
Short and intriguing.

riddle:
A solvable clue connected to this specific discovery.

clue:
Helpful without completely giving away the answer.

objective:
Extremely clear next action.

targetHint:
Tell the player what kind of real-world thing they should photograph
for validation.

rewardXp:
Integer between 80 and 200.

IMPORTANT:
If the exact location is uncertain, the riddle and story must also avoid
pretending that the identity is certain.

Do not include markdown.
`;

    const text = await callOpenRouter({
      model:
        process.env.OPENROUTER_GAME_MASTER_MODEL ||
        "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a cinematic historical discovery game master. Output strict JSON only. Never invent uncertain historical facts.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      maxTokens: 2200,
      temperature: 0.55,
    });

    let parsed: any;

    try {
      parsed = JSON.parse(text);
    } catch {
      const cleaned = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      parsed = JSON.parse(cleaned);
    }

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("GAME MASTER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Game Master failed.",
      },
      { status: 500 },
    );
  }
}
