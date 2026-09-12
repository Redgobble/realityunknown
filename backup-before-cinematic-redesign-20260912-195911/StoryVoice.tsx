"use client";

import { useCallback, useEffect, useRef, useState } from "react";

let activeAudio: HTMLAudioElement | null = null;

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");

  const cleanupAudio = useCallback(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.onplay = null;
      audio.onpause = null;
      audio.onended = null;
      audio.onerror = null;
      audioRef.current = null;
    }

    if (activeAudio === audio) {
      activeAudio = null;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setPlaying(false);
  }, []);

  const playVoice = useCallback(async () => {
    const cleanText = text.trim();

    if (!cleanText) return;

    const requestId = ++requestIdRef.current;

    setError("");
    setLoading(true);

    // Stop any narration currently playing anywhere in the game.
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.onplay = null;
      activeAudio.onpause = null;
      activeAudio.onended = null;
      activeAudio.onerror = null;
      activeAudio = null;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: cleanText,
        }),
      });

      if (!response.ok) {
        const serverMessage = await response.text().catch(() => "");
        throw new Error(
          serverMessage || `TTS request failed (${response.status})`,
        );
      }

      const blob = await response.blob();

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!blob.size) {
        throw new Error("TTS returned an empty audio file.");
      }

      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      const audio = new Audio();
      audio.preload = "auto";
      audio.volume = 0.95;
      audio.src = url;

      audioRef.current = audio;
      activeAudio = audio;

      audio.onplay = () => {
        if (requestId !== requestIdRef.current) return;

        setLoading(false);
        setPlaying(true);
      };

      audio.onpause = () => {
        if (requestId !== requestIdRef.current) return;

        setPlaying(false);
      };

      audio.onended = () => {
        if (requestId !== requestIdRef.current) return;

        setLoading(false);
        setPlaying(false);

        if (activeAudio === audio) {
          activeAudio = null;
        }

        if (audioRef.current === audio) {
          audioRef.current = null;
        }

        if (objectUrlRef.current === url) {
          URL.revokeObjectURL(url);
          objectUrlRef.current = null;
        }

        onEnded?.();
      };

      audio.onerror = () => {
        if (requestId !== requestIdRef.current) return;

        console.error("StoryVoice audio playback error");

        setLoading(false);
        setPlaying(false);
        setError("Voice could not be played. You can continue reading.");

        if (activeAudio === audio) {
          activeAudio = null;
        }

        if (audioRef.current === audio) {
          audioRef.current = null;
        }

        if (objectUrlRef.current === url) {
          URL.revokeObjectURL(url);
          objectUrlRef.current = null;
        }
      };

      // Wait until the browser has loaded enough metadata.
      await new Promise<void>((resolve) => {
        if (audio.readyState >= 2) {
          resolve();
          return;
        }

        const handleReady = () => {
          audio.removeEventListener("canplay", handleReady);
          resolve();
        };

        audio.addEventListener("canplay", handleReady, {
          once: true,
        });
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      await audio.play();

    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error("STORY VOICE ERROR:", error);

      setLoading(false);
      setPlaying(false);

      setError(
        autoPlay
          ? "Narration could not start automatically. Press Hear this part."
          : "Voice could not be played. You can continue reading.",
      );
    }
  }, [text, autoPlay, onEnded]);

  useEffect(() => {
    if (!autoPlay || !text.trim()) {
      return;
    }

    const timer = window.setTimeout(() => {
      playVoice();
    }, 120);

    return () => {
      window.clearTimeout(timer);
      requestIdRef.current += 1;
      cleanupAudio();
    };
  }, [text, autoPlay, playVoice, cleanupAudio]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return (
    <div className="ru-voice">
      <button
        type="button"
        className="ru-voice-button"
        onClick={playVoice}
        disabled={loading}
      >
        <span className="ru-voice-icon">
          {loading ? "…" : playing ? "◼" : "▶"}
        </span>

        <span>
          {loading
            ? "Preparing narration…"
            : playing
              ? "Narrating"
              : "Hear this part"}
        </span>
      </button>

      {error && (
        <span className="ru-voice-error">
          {error}
        </span>
      )}
    </div>
  );
}
