#!/bin/bash
set -euo pipefail

PROJECT="/Users/sanjaypandey/Desktop/realityunknown_v2"
cd "$PROJECT"

STAMP="$(date +%Y%m%d-%H%M%S)"

echo "=============================================="
echo " Reality Unknown — Route Explorer FINAL FIX"
echo "=============================================="
echo "Backup timestamp: $STAMP"

cp components/route-explorer/RouteExplorer.tsx \
  "components/route-explorer/RouteExplorer.tsx.backup-final-$STAMP"

cp app/api/route-explorer/route.ts \
  "app/api/route-explorer/route.ts.backup-final-$STAMP"

python3 - <<'PY'
from pathlib import Path
import re

# ============================================================
# 1. ROUTE EXPLORER CLIENT
# ============================================================

p = Path("components/route-explorer/RouteExplorer.tsx")
s = p.read_text()

# ------------------------------------------------------------
# Add speech synthesis ref
# ------------------------------------------------------------

old = '''  const voiceUrlRef =
    useRef<string | null>(null);

  const selectedDiscovery = useMemo('''

new = '''  const voiceUrlRef =
    useRef<string | null>(null);

  const speechFallbackRef =
    useRef<SpeechSynthesisUtterance | null>(null);

  const selectedDiscovery = useMemo('''

if old in s:
    s = s.replace(old, new, 1)
else:
    print("WARN: speech ref insertion point not found")

# ------------------------------------------------------------
# Replace stopVoice()
# ------------------------------------------------------------

start = s.find("  function stopVoice() {")
end = s.find("\n  async function speak(", start)

if start != -1 and end != -1:
    replacement = '''  function stopVoice() {
    voiceRef.current?.pause();
    voiceRef.current = null;

    if (voiceUrlRef.current) {
      URL.revokeObjectURL(
        voiceUrlRef.current,
      );
      voiceUrlRef.current = null;
    }

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    speechFallbackRef.current = null;
  }
'''
    s = s[:start] + replacement + s[end:]

else:
    print("WARN: stopVoice block not found")

# ------------------------------------------------------------
# Replace speak() with production-safe TTS + fallback
# ------------------------------------------------------------

start = s.find("  async function speak(text: string) {")
end = s.find("\n  function toggleSound()", start)

if start != -1 and end != -1:
    replacement = '''  async function speak(text: string) {
    const cleanText = text.trim();

    if (!soundOn || !cleanText) return;

    stopVoice();

    const browserFallback = () => {
      if (
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      ) {
        return;
      }

      try {
        window.speechSynthesis.cancel();

        const utterance =
          new SpeechSynthesisUtterance(cleanText);

        utterance.rate = 0.94;
        utterance.pitch = 0.92;
        utterance.volume = 1;

        const voices =
          window.speechSynthesis.getVoices();

        const preferredVoice =
          voices.find((voice) =>
            /en[-_](IN|GB|US)/i.test(
              voice.lang,
            ),
          ) ??
          voices.find((voice) =>
            /^en/i.test(voice.lang),
          );

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        speechFallbackRef.current =
          utterance;

        utterance.onend = () => {
          if (
            speechFallbackRef.current ===
            utterance
          ) {
            speechFallbackRef.current = null;
          }
        };

        window.speechSynthesis.speak(
          utterance,
        );
      } catch (error) {
        console.warn(
          "Reality Unknown browser narration failed:",
          error,
        );
      }
    };

    try {
      const response = await fetch(
        "/api/tts",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            text: cleanText,
          }),
        },
      );

      if (!response.ok) {
        console.warn(
          "Reality Unknown TTS API returned:",
          response.status,
        );

        browserFallback();
        return;
      }

      const contentType =
        response.headers.get(
          "content-type",
        ) ?? "";

      if (
        !contentType.includes(
          "audio/",
        )
      ) {
        console.warn(
          "Reality Unknown TTS returned a non-audio response:",
          contentType,
        );

        browserFallback();
        return;
      }

      const blob =
        await response.blob();

      if (!blob.size) {
        browserFallback();
        return;
      }

      const url =
        URL.createObjectURL(blob);

      voiceUrlRef.current = url;

      const audio =
        new Audio(url);

      audio.preload = "auto";
      audio.volume = 0.98;

      voiceRef.current = audio;

      audio.onended = () => {
        if (
          voiceUrlRef.current ===
          url
        ) {
          URL.revokeObjectURL(
            url,
          );

          voiceUrlRef.current =
            null;
        }

        if (
          voiceRef.current ===
          audio
        ) {
          voiceRef.current =
            null;
        }
      };

      try {
        await audio.play();
      } catch (playError) {
        console.warn(
          "Reality Unknown audio playback was blocked; using browser narration:",
          playError,
        );

        if (
          voiceUrlRef.current ===
          url
        ) {
          URL.revokeObjectURL(
            url,
          );

          voiceUrlRef.current =
            null;
        }

        voiceRef.current = null;

        browserFallback();
      }
    } catch (error) {
      console.warn(
        "Reality Unknown TTS request failed; using browser narration:",
        error,
      );

      browserFallback();
    }
  }
'''
    s = s[:start] + replacement + s[end:]

else:
    print("WARN: speak block not found")

# ------------------------------------------------------------
# Route completion narration:
# ONLY summarize the journey.
# Do NOT read unselected places.
# ------------------------------------------------------------

old = '''      const firstThree =
        payload.data.discoveries
          .slice(0, 3)
          .map(
            (place, index) =>
              `Discovery ${index + 1}: ${place.name}. ${clampText(
                place.history,
                150,
              )}`,
          )
          .join(" ");

      const destination =
        payload.data.destination.name;

      void speak(
        `Journey decoded. You travelled ${payload.data.route.distanceKm} kilometres from Pari Chowk to ${destination}. The route takes about ${payload.data.route.durationMin} minutes. ${
          payload.data.discoveries.length
        } verified historical discoveries were found along the route. ${
          firstThree ||
          "No verified historical site was found on this route segment."
        }`,
      );'''

new = '''      const destination =
        payload.data.destination.name;

      void speak(
        `Journey decoded. You travelled ${payload.data.route.distanceKm} kilometres from Delhi to ${destination}. The route takes about ${payload.data.route.durationMin} minutes. ${
          payload.data.discoveries.length
        } verified historical ${
          payload.data.discoveries.length === 1
            ? "discovery was"
            : "discoveries were"
        } found along the route. Select a discovery to hear its verified history.`,
      );'''

if old in s:
    s = s.replace(old, new, 1)
else:
    # Also handle the case where Pari Chowk was already replaced.
    pattern = re.compile(
        r'''      const firstThree =.*?      void speak\(\n        `Journey decoded\..*?      \);''',
        re.S,
    )

    replacement = '''      const destination =
        payload.data.destination.name;

      void speak(
        `Journey decoded. You travelled ${payload.data.route.distanceKm} kilometres from Delhi to ${destination}. The route takes about ${payload.data.route.durationMin} minutes. ${
          payload.data.discoveries.length
        } verified historical ${
          payload.data.discoveries.length === 1
            ? "discovery was"
            : "discoveries were"
        } found along the route. Select a discovery to hear its verified history.`,
      );'''

    s2, count = pattern.subn(
        replacement,
        s,
        count=1,
    )

    if count:
        s = s2
    else:
        print("WARN: route completion narration block not found")

# ------------------------------------------------------------
# LISTEN button:
# read ONLY the currently selected place
# ------------------------------------------------------------

old = '''                      onClick={() =>
                        speak(
                          `Historical discoveries along your route. ${result.discoveries
                            .map(
                              (
                                discovery,
                                index,
                              ) =>
                                `Discovery ${
                                  index + 1
                                }, ${
                                  discovery.name
                                }. ${clampText(
                                  discovery.history,
                                  130,
                                )}`,
                            )
                            .join(" ")}`,
                        )
                      }
                    >
                      ◉ LISTEN
                    </button>'''

new = '''                      onClick={() => {
                        if (selectedDiscovery) {
                          speakDiscovery(
                            selectedDiscovery,
                          );
                        }
                      }}
                    >
                      ◉ LISTEN TO SELECTED
                    </button>'''

if old in s:
    s = s.replace(old, new, 1)
else:
    print("WARN: LISTEN button block not found")

# ------------------------------------------------------------
# Replace RU analysis core with actual Reality Unknown logo
# ------------------------------------------------------------

old = '''            <div className="rx2-analysis-orbit">
              <div className="rx2-analysis-core">
                RU
              </div>
              <i />
              <i />
              <i />
            </div>'''

new = '''            <div className="rx2-analysis-orbit">
              <div className="rx2-analysis-core">
                <img
                  src="/assets/applogo/reality_unknown_logo.png"
                  alt="Reality Unknown"
                />
              </div>
              <i />
              <i />
              <i />
            </div>'''

if old in s:
    s = s.replace(old, new, 1)
else:
    print("WARN: RU analysis core block not found")

# ------------------------------------------------------------
# Selected history image:
# never show an unrelated image.
# If no verified image exists, use branded placeholder.
# ------------------------------------------------------------

old = '''                        {selectedDiscovery.imageUrl && (
                          <img
                            src={
                              selectedDiscovery.imageUrl
                            }
                            alt=""
                            className="rx2-history-image"
                          />
                        )}'''

new = '''                        {selectedDiscovery.imageUrl ? (
                          <img
                            src={
                              selectedDiscovery.imageUrl
                            }
                            alt={
                              selectedDiscovery.name
                            }
                            className="rx2-history-image"
                            loading="eager"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="rx2-history-image-fallback">
                            <img
                              src="/assets/applogo/reality_unknown_logo.png"
                              alt=""
                            />
                            <span>
                              VERIFIED HISTORY RECORD
                            </span>
                          </div>
                        )}'''

if old in s:
    s = s.replace(old, new, 1)
else:
    print("WARN: history image block not found")

# ------------------------------------------------------------
# Make selected discovery read exactly the selected record.
# ------------------------------------------------------------

old = '''  function speakDiscovery(
    discovery: Discovery,
  ) {
    void speak(
      `${discovery.name}. ${
        discovery.category
      }. ${discovery.history}`,
    );
  }'''

new = '''  function speakDiscovery(
    discovery: Discovery,
  ) {
    const narration = [
      discovery.name,
      discovery.category,
      discovery.history,
    ]
      .filter(Boolean)
      .join(". ");

    void speak(narration);
  }'''

if old in s:
    s = s.replace(old, new, 1)
else:
    print("WARN: speakDiscovery block not found")

p.write_text(s)

# ============================================================
# 2. ROUTE API — FIX WRONG WIKIPEDIA IMAGE MATCHING
# ============================================================

p = Path("app/api/route-explorer/route.ts")
s = p.read_text()

# The old code did fuzzy Wikipedia title search using only the
# candidate's name. That can return an unrelated article/image.
#
# Remove that fallback completely.
old = '''      if (!wikipedia) {
        const searchedTitle =
          await searchWikipediaTitle(
            candidate.name,
          );

        if (searchedTitle) {
          wikipedia =
            await getWikipediaSummary(
              searchedTitle,
            );
        }
      }

      const description ='''

new = '''      /*
       * IMPORTANT:
       * Do not fuzzy-search Wikipedia by candidate name here.
       *
       * A fuzzy search can return a different historical place
       * with a visually unrelated thumbnail. We only trust:
       *
       * 1. an explicit OSM wikipedia=* tag
       * 2. an explicit OSM wikidata=* tag resolved to Wikipedia
       *
       * If neither exists, the record may still be shown from
       * verified OSM description data, but it receives NO image.
       */

      const description ='''

if old in s:
    s = s.replace(old, new, 1)
else:
    print("WARN: fuzzy Wikipedia fallback not found")

# ------------------------------------------------------------
# Also make discovery ordering deterministic.
# ------------------------------------------------------------

old = '''    .sort(
      (a, b) =>
        a.distanceFromRouteM -
        b.distanceFromRouteM,
    )
    .slice(0, 6);'''

new = '''    .sort(
      (a, b) =>
        a.distanceFromRouteM -
          b.distanceFromRouteM ||
        a.name.localeCompare(
          b.name,
          undefined,
          {
            sensitivity: "base",
          },
        ),
    )
    .slice(0, 6);'''

if old in s:
    s = s.replace(old, new, 1)
else:
    print("WARN: discovery sort block not found")

p.write_text(s)

print("Route Explorer client patched.")
print("Route Explorer API patched.")
PY

# ============================================================
# 3. PREMIUM UI OVERRIDES
# ============================================================

cat >> app/globals.css <<'CSS'

/* ============================================================
   REALITY UNKNOWN — ROUTE EXPLORER FINAL POLISH
   Scope: Route Explorer only
   ============================================================ */

.rx2-analysis-core {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.rx2-analysis-core img {
  width: 68%;
  height: 68%;
  object-fit: contain;
  object-position: center;
  filter:
    drop-shadow(0 0 16px rgba(243, 215, 141, 0.28))
    brightness(1.08);
  opacity: 0.96;
}

.rx2-history-image {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  object-position: center;
  background: #050a12;
}

.rx2-history-image-fallback {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background:
    radial-gradient(
      circle at center,
      rgba(215, 184, 106, 0.12),
      transparent 58%
    ),
    linear-gradient(
      135deg,
      rgba(5, 10, 18, 0.98),
      rgba(11, 18, 30, 0.98)
    );
  border-bottom: 1px solid rgba(215, 184, 106, 0.12);
}

.rx2-history-image-fallback::before {
  content: "";
  position: absolute;
  inset: 16%;
  border: 1px solid rgba(215, 184, 106, 0.14);
  transform: rotate(45deg);
}

.rx2-history-image-fallback img {
  position: relative;
  width: 92px;
  height: 92px;
  object-fit: contain;
  opacity: 0.78;
  filter:
    drop-shadow(0 0 18px rgba(215, 184, 106, 0.22));
}

.rx2-history-image-fallback span {
  position: relative;
  font-size: 8px;
  letter-spacing: 0.32em;
  color: rgba(239, 231, 216, 0.48);
}

.rx2-history-card-top button {
  min-width: 38px;
  min-height: 38px;
  border: 1px solid rgba(215, 184, 106, 0.18);
  background: rgba(215, 184, 106, 0.04);
  color: #e9d18e;
  cursor: pointer;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.rx2-history-card-top button:hover {
  border-color: rgba(243, 215, 141, 0.5);
  background: rgba(215, 184, 106, 0.1);
  transform: translateY(-1px);
}

.rx2-listen {
  white-space: nowrap;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.rx2-listen:hover {
  transform: translateY(-1px);
}

.rx2-discovery.active {
  background:
    linear-gradient(
      90deg,
      rgba(215, 184, 106, 0.09),
      rgba(215, 184, 106, 0.025)
    );
}

.rx2-discovery.active .rx2-discovery-copy strong {
  color: #f5e7c4;
}

@media (max-width: 700px) {
  .rx2-history-image-fallback img {
    width: 72px;
    height: 72px;
  }

  .rx2-listen {
    font-size: 8px;
  }
}
CSS

echo
echo "=============================================="
echo " FINAL PATCH COMPLETE"
echo "=============================================="
echo
echo "Now run:"
echo
echo "  npx tsc --noEmit"
echo "  npm run lint"
echo "  npm run dev"
echo
echo "Then:"
echo "  http://localhost:3000/route-explorer"
echo
