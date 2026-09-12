"use client";

let musicAudio: HTMLAudioElement | null = null;
let musicUrl: string | null = null;

let audioContext: AudioContext | null = null;

const MAIN_MUSIC = "/assets/mainscreen/mainscreenbgmusic.mp3";
const STORY_MUSIC = "/assets/storybgmusic/storybgmusic.mp3";

const CORRECT_SFX =
  "/assets/correctanswer/freesound_community-correct-83487.mp3";

const WRONG_SFX =
  "/assets/wronganswer/wronganswer.mp3";

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function tone(
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
  delay = 0,
) {
  const ctx = getAudioContext();

  if (!ctx) {
    return;
  }

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(
    frequency,
    ctx.currentTime + delay,
  );

  gain.gain.setValueAtTime(
    0.0001,
    ctx.currentTime + delay,
  );

  gain.gain.exponentialRampToValueAtTime(
    volume,
    ctx.currentTime + delay + 0.012,
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + delay + duration,
  );

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(ctx.currentTime + delay);
  oscillator.stop(
    ctx.currentTime + delay + duration + 0.02,
  );
}

export function playUiHover() {
  tone(1100, 0.045, 0.018, "sine");
}

export function playUiClick() {
  tone(720, 0.055, 0.035, "sine");
  tone(980, 0.075, 0.022, "sine", 0.018);
}

export function playUiConfirm() {
  tone(660, 0.075, 0.035, "sine");
  tone(880, 0.11, 0.028, "sine", 0.055);
  tone(1320, 0.16, 0.018, "sine", 0.11);
}

export function playUiBack() {
  tone(700, 0.06, 0.025, "triangle");
  tone(480, 0.09, 0.018, "triangle", 0.04);
}

export function playSfx(
  kind: "correct" | "wrong",
) {
  if (typeof window === "undefined") {
    return;
  }

  const src =
    kind === "correct"
      ? CORRECT_SFX
      : WRONG_SFX;

  const audio = new Audio(src);

  audio.volume = 0.72;
  audio.preload = "auto";

  void audio.play().catch(() => {
    // Browser may block sound until the player interacts.
  });
}

export function stopMusic() {
  if (musicAudio) {
    musicAudio.pause();
    musicAudio.currentTime = 0;
    musicAudio.removeAttribute("src");
    musicAudio.load();
    musicAudio = null;
  }

  musicUrl = null;
}

export function playMusic(
  kind: "main" | "story",
) {
  if (typeof window === "undefined") {
    return;
  }

  const nextUrl =
    kind === "story"
      ? STORY_MUSIC
      : MAIN_MUSIC;

  if (
    musicAudio &&
    musicUrl === nextUrl &&
    !musicAudio.paused
  ) {
    return;
  }

  stopMusic();

  const audio = new Audio(nextUrl);

  audio.loop = true;
  audio.preload = "auto";
  audio.volume =
    kind === "story" ? 0.18 : 0.22;

  musicAudio = audio;
  musicUrl = nextUrl;

  void audio.play().catch(() => {
    // Autoplay can be blocked until the player interacts.
  });
}

export function attachAudioUnlock() {
  if (typeof window === "undefined") {
    return () => {};
  }

  const unlock = () => {
    const ctx = getAudioContext();

    if (ctx?.state === "suspended") {
      void ctx.resume();
    }

    if (
      musicAudio &&
      musicAudio.paused
    ) {
      void musicAudio.play().catch(() => {});
    }
  };

  window.addEventListener(
    "pointerdown",
    unlock,
    { once: true },
  );

  return () => {
    window.removeEventListener(
      "pointerdown",
      unlock,
    );
  };
}
