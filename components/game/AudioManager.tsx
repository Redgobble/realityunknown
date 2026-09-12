"use client";

import { useEffect, useRef } from "react";

const MAIN_MUSIC = "/assets/mainscreen/mainscreenbgmusic.mp3";
const STORY_MUSIC = "/assets/storybgmusic/storybgmusic.mp3";
const CORRECT_SOUND =
  "/assets/correctanswer/freesound_community-correct-83487.mp3";
const WRONG_SOUND = "/assets/wronganswer/wronganswer.mp3";

type MusicMode = "main" | "story" | "off";

export function AudioManager({
  music = "main",
}: {
  music?: MusicMode;
}) {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const effectRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const src =
      music === "main"
        ? MAIN_MUSIC
        : music === "story"
          ? STORY_MUSIC
          : null;

    if (!src) {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
        musicRef.current = null;
      }

      return;
    }

    if (
      musicRef.current &&
      musicRef.current.src.endsWith(src)
    ) {
      return;
    }

    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }

    const audio = new Audio(src);

    audio.loop = true;
    audio.volume = music === "story" ? 0.2 : 0.14;
    audio.preload = "auto";

    musicRef.current = audio;

    audio.play().catch(() => {
      // Browser may require a user gesture.
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [music]);

  useEffect(() => {
    return () => {
      musicRef.current?.pause();
      effectRef.current?.pause();
    };
  }, []);

  function playEffect(type: "correct" | "wrong") {
    if (effectRef.current) {
      effectRef.current.pause();
      effectRef.current.currentTime = 0;
    }

    const audio = new Audio(
      type === "correct"
        ? CORRECT_SOUND
        : WRONG_SOUND,
    );

    audio.volume = 0.65;
    effectRef.current = audio;

    audio.play().catch(() => {});
  }

  return null;
}

export function playCorrectSound() {
  const audio = new Audio(CORRECT_SOUND);
  audio.volume = 0.65;
  audio.play().catch(() => {});
}

export function playWrongSound() {
  const audio = new Audio(WRONG_SOUND);
  audio.volume = 0.65;
  audio.play().catch(() => {});
}
