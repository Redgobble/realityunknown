"use client";

import { useEffect, useRef } from "react";

const MAIN_MUSIC =
  "/assets/mainscreen/mainscreenbgmusic.mp3";

const STORY_MUSIC =
  "/assets/storybgmusic/storybgmusic.mp3";

export function AudioManager({
  mode = "main",
}: {
  mode?: "main" | "story" | "off";
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const src =
      mode === "main"
        ? MAIN_MUSIC
        : mode === "story"
          ? STORY_MUSIC
          : null;

    if (!src) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      return;
    }

    if (
      audioRef.current &&
      audioRef.current.src.endsWith(src)
    ) {
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(src);

    audio.loop = true;
    audio.volume = mode === "story" ? 0.2 : 0.14;
    audio.preload = "auto";

    audioRef.current = audio;

    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [mode]);

  return null;
}
