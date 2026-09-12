"use client";

import { GameNarrator } from "@/components/audio/GameNarrator";

type StoryVoiceProps = {
  text: string;
  autoPlay?: boolean;
  onEnded?: () => void;
};

export function StoryVoice({
  text,
  autoPlay = false,
  onEnded,
}: StoryVoiceProps) {
  return (
    <GameNarrator
      text={text}
      autoPlay={autoPlay}
      onEnded={onEnded}
    />
  );
}
