"use client";

import CinematicDiscoveryStory from "@/components/story/CinematicDiscoveryStory";
import { useEffect, useMemo, useRef, useState } from "react";
type Phase =
  | "identity"
  | "discovery"
  | "camera"
  | "analyzing"
  | "choice"
  | "story"
  | "mission"
  | "target"
  | "validating"
  | "success"
  | "failure";

type World = {
  environment?: string;
  setting?: string;
  objects?: Array<{
    name?: string;
    description?: string;
    interesting?: boolean;
  }>;
  atmosphere?: string;
  possibleClues?: string[];
  storyPotential?: string;
};

type StoryBeat = {
  title: string;
  text: string;
  voiceText?: string;
};

type Story = {
  discoveryTitle?: string;
  locationType?: string;
  subject?: string;
  confidence?: number;

  historicalStory?: string;
  historicalDetails?: string[];

  storyBeats?: StoryBeat[];

  characterOpening?: string;
  characterDialogue?: string[];

  riddleTitle?: string;
  riddle?: string;
  clue?: string;
  objective?: string;
  targetHint?: string;

  storyQuestion?: string;
  storyQuestionOptions?: string[];
  storyQuestionAnswer?: number;
  storyQuestionExplanation?: string;

  curiosityQuestions?: string[];
  visualQuestions?: string[];

  rewardXp?: number;
};

const characters = [
  { id: "c1", src: "/assets/character/c1.png" },
  { id: "c2", src: "/assets/character/c2.png" },
  { id: "c3", src: "/assets/character/c3.png" },
  { id: "c4", src: "/assets/character/c4.png" },
  { id: "c5", src: "/assets/character/c5.png" },
  { id: "c6", src: "/assets/character/c6.png" },
  { id: "c7", src: "/assets/character/c7.png" },
  { id: "c8", src: "/assets/character/c8.png" },
  { id: "c9", src: "/assets/character/c9.png" },
  { id: "c10", src: "/assets/character/c10.png" },
  { id: "c11", src: "/assets/character/c11.png" },
  { id: "c12", src: "/assets/character/c12.png" },
  { id: "c13", src: "/assets/character/c13.png" },
  { id: "c14", src: "/assets/character/c14.png" },
  { id: "c15", src: "/assets/character/c15.png" },
];

function CameraCapture({
  onCapture,
  onClose,
}: {
  onCapture: (image: string) => void;
  onClose?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function start() {
      try {
        setError("");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: { ideal: "environment" },
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          await videoRef.current.play();

          setReady(true);
        }
      } catch (err) {
        console.error(err);
        setError(
          "Camera access failed. Please allow camera access and try again.",
        );
      }
    }

    start();

    return () => {
      mounted = false;

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  function capture() {
    const video = videoRef.current;

    if (!video || !ready) return;

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    onCapture(
      canvas.toDataURL("image/jpeg", 0.86),
    );
  }

  return (
    <div className="ru-new-camera">
      <video
        ref={videoRef}
        className="ru-new-camera-video"
        autoPlay
        playsInline
        muted
      />

      <div className="ru-new-camera-vignette" />

      <div className="ru-new-camera-grid" />

      <div className="ru-new-camera-reticle">
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="ru-new-camera-top">
        <span className="ru-camera-status">
          <i />
          REALITY LINK ACTIVE
        </span>

        <span>WORLD SCAN</span>
      </div>

      {!ready && !error && (
        <div className="ru-new-camera-loading">
          <div className="ru-loader" />
          <strong>INITIALIZING CAMERA</strong>
          <span>Point toward the subject.</span>
        </div>
      )}

      {error && (
        <div className="ru-new-camera-loading">
          <strong>CAMERA UNAVAILABLE</strong>
          <span>{error}</span>
        </div>
      )}

      <div className="ru-new-camera-bottom">
        <span>
          {ready ? "VISION SYSTEM / READY" : "VISION SYSTEM / INITIALIZING"}
        </span>

        <button
          type="button"
          className="ru-new-capture"
          onClick={capture}
          disabled={!ready}
        >
          <b>◉</b>
          CAPTURE WORLD
          <span>→</span>
        </button>

        {onClose && (
          <button
            type="button"
            className="ru-new-camera-close"
            onClick={onClose}
          >
            ESC
          </button>
        )}
      </div>
    </div>
  );
}

export default function DiscoveryGame() {
  const [phase, setPhase] =
    useState<Phase>("identity");

  const [playerName, setPlayerName] =
    useState("");

  const [xp, setXp] = useState(0);

  const [world, setWorld] =
    useState<World | null>(null);

  const [story, setStory] =
    useState<Story | null>(null);

  const [error, setError] =
    useState("");

  const [discoveryCount, setDiscoveryCount] =
    useState(1);

  const [selectedCharacter, setSelectedCharacter] =
    useState(characters[13]);

  const [selectedQuestion, setSelectedQuestion] =
    useState("");

  const [storyBeatIndex, setStoryBeatIndex] =
    useState(0);

  const [storyAnswer, setStoryAnswer] =
    useState<number | null>(null);

  const [showStoryQuestion, setShowStoryQuestion] =
    useState(false);

  const [showCuriosity, setShowCuriosity] =
    useState(false);

  const [curiosityAnswer, setCuriosityAnswer] =
    useState("");

  const [targetImage, setTargetImage] =
    useState("");

  async function createDiscovery(image: string) {
    try {
      setError("");
      setPhase("analyzing");

      const visionResponse = await fetch(
        "/api/vision",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image,
          }),
        },
      );

      const visionData =
        await visionResponse.json();

      if (
        !visionResponse.ok ||
        !visionData.success
      ) {
        throw new Error(
          visionData.error ||
            "World analysis failed.",
        );
      }

      const snapshot =
        visionData.data ??
        visionData.world;

      setWorld(snapshot);

      const gameResponse =
        await fetch("/api/game-master", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerName,
            discoveryNumber: discoveryCount,
            world: snapshot,
          }),
        });

      const gameData =
        await gameResponse.json();

      if (
        !gameResponse.ok ||
        !gameData.success
      ) {
        throw new Error(
          gameData.error ||
            "Story generation failed.",
        );
      }

      const generatedStory =
        gameData.data ??
        gameData.story ??
        gameData;

      setStory(generatedStory);

      const characterIndex =
        (discoveryCount - 1) %
        characters.length;

      setSelectedCharacter(
        characters[characterIndex],
      );

      setPhase("choice");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Discovery failed.",
      );

      setPhase("discovery");
    }
  }

  async function validateTarget(image: string) {
    try {
      setTargetImage(image);
      setPhase("validating");

      const response = await fetch(
        "/api/validation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image,
            world,
            story,
            playerName,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Validation failed.",
        );
      }

      if (data.data?.valid) {
        setXp(
          (value) =>
            value +
            Number(
              data.data?.xp ??
                story?.rewardXp ??
                120,
            ),
        );

        setPhase("success");
      } else {
        setPhase("failure");
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Validation failed.",
      );

      setPhase("failure");
    }
  }

  function resetExperience() {
    setPlayerName("");
    setXp(0);
    setWorld(null);
    setStory(null);
    setError("");
    setTargetImage("");
    setSelectedQuestion("");
    setDiscoveryCount(1);
    setPhase("identity");
  }

  function nextDiscovery() {
    setWorld(null);
    setStory(null);
    setTargetImage("");
    setSelectedQuestion("");

    setDiscoveryCount(
      (value) => value + 1,
    );

    setPhase("discovery");
  }

  const background =
    "url('/assets/backgrounds/hub-bg.png')";

  return (
    <main
      className="ru-new-game"
      style={{
        backgroundImage: background,
      }}
    >
      <header className="ru-new-header">
        <img
          src="/assets/applogo/reality_unknown_logo.png"
          alt="Reality Unknown"
        />

        <div className="ru-new-chapter">
          <span>CHAPTER</span>
          <strong>01</strong>
        </div>

        <div className="ru-new-xp">
          <span>EXPERIENCE</span>
          <strong>
            {String(xp).padStart(3, "0")} XP
          </strong>
        </div>
      </header>

      <div className="ru-new-content">
        {phase === "identity" && (
          <section className="ru-identity">
            <div className="ru-identity-character">
              <img
                src="/assets/character/c14.png"
                alt=""
              />
            </div>

            <div className="ru-identity-copy">
              <span className="ru-new-eyebrow">
                REALITY UNKNOWN / FIRST CONTACT
              </span>

              <h1>
                Before we begin,
                <em> tell me your name.</em>
              </h1>

              <p>
                Every discovery is remembered.
                Your guide will use your name
                throughout the journey.
              </p>

              <form
                onSubmit={(event) => {
                  event.preventDefault();

                  if (!playerName.trim()) return;

                  setPhase("discovery");
                }}
                className="ru-identity-form"
              >
                <label htmlFor="player-name">
                  YOUR NAME
                </label>

                <input
                  id="player-name"
                  value={playerName}
                  onChange={(event) =>
                    setPlayerName(
                      event.target.value,
                    )
                  }
                  placeholder="What should I call you?"
                  autoComplete="given-name"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={!playerName.trim()}
                >
                  ENTER REALITY
                  <span>→</span>
                </button>
              </form>
            </div>
          </section>
        )}

        {phase === "discovery" && (
          <section className="ru-discovery-new">
            <div className="ru-discovery-new-copy">
              <span className="ru-new-eyebrow">
                REALITY LINK / ACTIVE
              </span>

              <h1>
                Look closer.
                <em>
                  The world is listening.
                </em>
              </h1>

              <p>
                Hello, {playerName}. Point the
                camera toward a monument,
                historic place, building, statue
                or detail worth remembering.
              </p>

              <div className="ru-discovery-note">
                <i />
                <span>
                  DISCOVERY {String(discoveryCount).padStart(3, "0")}
                </span>
              </div>

              {error && (
                <div className="ru-new-error">
                  {error}
                </div>
              )}
            </div>

            <div className="ru-start-discovery">
              <div className="ru-start-orbit" />

              <span>DISCOVERY SYSTEM</span>

              <h2>
                Something
                <br />
                is waiting.
              </h2>

              <p>
                Start the camera only when
                you're ready to investigate
                the real world.
              </p>

              <button
                type="button"
                onClick={() =>
                  setPhase("camera")
                }
                className="ru-start-button"
              >
                START SCANNING
                <span>→</span>
              </button>

              <div className="ru-start-hint">
                CAMERA WILL OPEN AFTER YOU START
              </div>
            </div>
          </section>
        )}

        {phase === "camera" && (
          <section className="ru-target-new">
            <div className="ru-target-header">
              <span className="ru-new-eyebrow">
                REALITY LINK / CAMERA
              </span>

              <h1>
                Show me
                <em> the world.</em>
              </h1>

              <p>
                Point the camera toward the monument,
                building, statue, historic detail or
                object you want the Watcher to investigate.
              </p>
            </div>

            <CameraCapture
              onCapture={createDiscovery}
              onClose={() => setPhase("discovery")}
            />
          </section>
        )}

        {phase === "analyzing" && (
          <section className="ru-analysis-new">
            <div className="ru-analysis-orbit">
              <span />
              <span />
              <span />
            </div>

            <span className="ru-new-eyebrow">
              OPENROUTER / VISION SYSTEM
            </span>

            <h1>
              Reading the
              <em> world.</em>
            </h1>

            <p>
              Looking for architecture,
              history, objects, details and
              clues in your photograph.
            </p>

            <div className="ru-analysis-progress">
              <span />
            </div>

            <small>
              DO NOT MOVE AWAY
            </small>
          </section>
        )}

        {phase === "choice" && story && (
          <section className="ru-choice-new">
            <div className="ru-choice-character">
              <img
                src={selectedCharacter.src}
                alt=""
              />
            </div>

            <div className="ru-choice-copy">
              <span className="ru-new-eyebrow">
                THE WATCHER / DISCOVERY
              </span>

              <h1>
                I found
                <em>
                  {" "}
                  something, {playerName}.
                </em>
              </h1>

              <p className="ru-choice-subtitle">
                {story.subject ||
                  story.discoveryTitle ||
                  "Something unusual"}
              </p>

              <div className="ru-choice-actions">
                <button
                  type="button"
                  onClick={() =>
                    setPhase("story")
                  }
                >
                  <small>01</small>
                  <strong>
                    Hear the story
                  </strong>
                  <span>
                    Learn what this place
                    might remember.
                  </span>
                  <b>→</b>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPhase("mission")
                  }
                >
                  <small>02</small>
                  <strong>
                    Investigate the clue
                  </strong>
                  <span>
                    Solve the riddle and
                    follow the trail.
                  </span>
                  <b>→</b>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPhase("target")
                  }
                >
                  <small>03</small>
                  <strong>
                    Look closer
                  </strong>
                  <span>
                    Search the world with
                    your camera.
                  </span>
                  <b>→</b>
                </button>
              </div>
            </div>
          </section>
        )}

        {phase === "story" && story && (
          <CinematicDiscoveryStory
            story={story}
            playerName={playerName}
            character={selectedCharacter}
            discoveryCount={discoveryCount}
            onMission={() => setPhase("mission")}
            onTarget={() => setPhase("target")}
            onFinished={(correct: boolean) => {
              if (correct) {
                setXp((value) => value + 40);
              }
            }}
          />
        )}

        {phase === "mission" && story && (
          <section className="ru-mission-new">
            <div className="ru-mission-copy">
              <span className="ru-new-eyebrow">
                MISSION / DISCOVERY
              </span>

              <h1>
                {story.riddleTitle ||
                  "The Hidden Clue"}
              </h1>

              <p>
                {story.objective}
              </p>

              <div className="ru-place-reveal">
                <span>
                  WHAT WE FOUND
                </span>

                <strong>
                  {story.subject ||
                    "Unknown subject"}
                </strong>

                <small>
                  {story.locationType ||
                    "WORLD OBSERVATION"}
                </small>
              </div>
            </div>

            <div className="ru-riddle-card">
              <span>THE RIDDLE</span>

              <blockquote>
                {story.riddle}
              </blockquote>

              <div className="ru-clue-card">
                <span>CLUE</span>

                <p>
                  {story.clue}
                </p>
              </div>

              <div className="ru-objective-card">
                <span>YOUR OBJECTIVE</span>

                <strong>
                  {story.targetHint}
                </strong>
              </div>

              <button
                type="button"
                className="ru-primary-action"
                onClick={() =>
                  setPhase("target")
                }
              >
                SCAN THE ANSWER
                <span>→</span>
              </button>
            </div>
          </section>
        )}

        {phase === "target" && (
          <section className="ru-target-new">
            <div className="ru-target-header">
              <span className="ru-new-eyebrow">
                INVESTIGATION / TARGET SCAN
              </span>

              <h1>
                Find what
                <em> the clue describes.</em>
              </h1>

              <p>
                {story?.targetHint ||
                  "Point your camera at the answer."}
              </p>
            </div>

            <CameraCapture
              onCapture={validateTarget}
              onClose={() =>
                setPhase("mission")
              }
            />
          </section>
        )}

        {phase === "validating" && (
          <section className="ru-analysis-new">
            <div className="ru-analysis-orbit">
              <span />
              <span />
              <span />
            </div>

            <span className="ru-new-eyebrow">
              REALITY UNKNOWN / VALIDATION
            </span>

            <h1>
              Is this
              <em> the answer?</em>
            </h1>

            <p>
              Comparing your second capture
              against the discovered clue.
            </p>

            <div className="ru-analysis-progress">
              <span />
            </div>

            <small>
              AI VALIDATION IN PROGRESS
            </small>
          </section>
        )}

        {phase === "success" && (
          <section className="ru-result-new ru-success">
            <div className="ru-result-art">
              <img
                src="/assets/correctanswer/correct.png"
                alt=""
              />
            </div>

            <div>
              <span className="ru-new-eyebrow">
                DISCOVERY VALIDATED
              </span>

              <h1>
                You
                <em> saw it.</em>
              </h1>

              <p>
                That's exactly what the
                mystery was asking you to find,
                {playerName}.
              </p>

              <div className="ru-reward">
                <span>REWARD</span>
                <strong>
                  +{story?.rewardXp ?? 120} XP
                </strong>
              </div>

              <button
                type="button"
                className="ru-primary-action"
                onClick={nextDiscovery}
              >
                CONTINUE THE JOURNEY
                <span>→</span>
              </button>
            </div>
          </section>
        )}

        {phase === "failure" && (
          <section className="ru-result-new ru-failure">
            <div className="ru-result-art">
              <img
                src="/assets/wronganswer/wrong.png"
                alt=""
              />
            </div>

            <div>
              <span className="ru-new-eyebrow">
                NOT THIS TIME
              </span>

              <h1>
                Look
                <em> again.</em>
              </h1>

              <p>
                The clue is still here.
                Reconsider what the Watcher
                told you and try another angle.
              </p>

              <button
                type="button"
                className="ru-primary-action"
                onClick={() =>
                  setPhase("target")
                }
              >
                TRY AGAIN
                <span>→</span>
              </button>
            </div>
          </section>
        )}
      </div>

      <footer className="ru-new-footer">
        <span>
          REALITY UNKNOWN / DISCOVERY SYSTEM
        </span>

        <button
          type="button"
          onClick={resetExperience}
        >
          RESET EXPERIENCE
        </button>

        <span>
          EVERY PLACE HAS A STORY.
        </span>
      </footer>
    </main>
  );
}
