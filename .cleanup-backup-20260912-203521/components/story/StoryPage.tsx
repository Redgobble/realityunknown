"use client";

import { useState } from "react";
import Link from "next/link";

type Choice = {
  id: string;
  label: string;
  description: string;
};

const choices: Choice[] = [
  {
    id: "identity",
    label: "Ask who they are.",
    description: "You want to understand the presence standing before you.",
  },
  {
    id: "watching",
    label: "Ask why they were watching you.",
    description: "Something tells you this encounter was not accidental.",
  },
  {
    id: "silence",
    label: "Say nothing.",
    description: "You remain still and allow the unknown to speak first.",
  },
];

export function StoryPage() {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [dialogueStep, setDialogueStep] = useState(0);

  const dialogue = [
    {
      speaker: "THE WATCHER",
      text: "You finally noticed me.",
    },
    {
      speaker: "THE WATCHER",
      text: "Most people look at this world without ever truly seeing it.",
    },
    {
      speaker: "THE WATCHER",
      text: "But you... you looked closer.",
    },
  ];

  const currentDialogue = dialogue[dialogueStep];

  const continueDialogue = () => {
    if (dialogueStep < dialogue.length - 1) {
      setDialogueStep((step) => step + 1);
    }
  };

  const selectChoice = (choice: Choice) => {
    setSelectedChoice(choice.id);
  };

  return (
    <main className="ru-story">

      {/* ATMOSPHERE */}
      <div className="ru-story-background" />
      <div className="ru-story-vignette" />
      <div className="ru-story-glow" />
      <div className="ru-story-noise" />

      {/* TOP HUD */}
      <header className="ru-story-header">

        <Link href="/discovery" className="ru-story-logo">
          <img
            src="/assets/applogo/reality_unknown_logo.png"
            alt="Reality Unknown"
          />
        </Link>

        <div className="ru-story-chapter">
          <span>CHAPTER</span>
          <strong>01</strong>
          <i />
          <span>FIRST CONTACT</span>
        </div>

        <div className="ru-story-player">
          <span>EXPERIENCE</span>
          <strong>120 XP</strong>
        </div>

      </header>

      {/* LEFT GAME HUD */}
      <aside className="ru-story-left">

        <div className="ru-story-vertical">
          REALITY UNKNOWN // STORY
        </div>

        <div className="ru-story-stat">
          <span>DISCOVERY</span>
          <strong>001</strong>
        </div>

        <div className="ru-story-stat">
          <span>ENTITY</span>
          <strong>WATCHER</strong>
        </div>

        <div className="ru-story-stat">
          <span>THREAT</span>
          <strong className="safe">NONE</strong>
        </div>

      </aside>

      {/* SCENE */}
      <section className="ru-story-scene">

        {/* distant environment */}
        <div className="ru-story-mountains" />

        {/* CHARACTER */}
        <div className="ru-watcher">

          <div className="ru-watcher-halo" />

          <img
            src="/assets/character/c14.png"
            alt="The Watcher"
          />

          <div className="ru-watcher-label">
            <span>UNKNOWN ENTITY</span>
            <strong>THE WATCHER</strong>
          </div>

        </div>

        {/* CHARACTER LIGHT */}
        <div className="ru-ground-light" />

        {/* STORY CONTENT */}
        <div className="ru-story-content">

          <div className="ru-story-eyebrow">
            <span />
            DISCOVERY 001
            <span />
          </div>

          <h1>
            The
            <em>Watcher.</em>
          </h1>

          <div className="ru-dialogue">

            <div className="ru-speaker">
              <span className="ru-speaker-dot" />
              {currentDialogue.speaker}
            </div>

            <p key={dialogueStep}>
              “{currentDialogue.text}”
            </p>

          </div>

          {dialogueStep < dialogue.length - 1 && (
            <button
              type="button"
              className="ru-dialogue-button"
              onClick={continueDialogue}
            >
              <span>CONTINUE</span>
              <b>→</b>
            </button>
          )}

        </div>

      </section>

      {/* CHOICE PANEL */}
      {dialogueStep === dialogue.length - 1 && !selectedChoice && (
        <section className="ru-choice-panel">

          <div className="ru-choice-heading">
            <span>THE WATCHER WAITS</span>
            <strong>What will you do?</strong>
          </div>

          <div className="ru-choices">

            {choices.map((choice, index) => (
              <button
                key={choice.id}
                type="button"
                className="ru-choice"
                onClick={() => selectChoice(choice)}
              >

                <span className="ru-choice-number">
                  0{index + 1}
                </span>

                <span className="ru-choice-copy">
                  <strong>{choice.label}</strong>
                  <small>{choice.description}</small>
                </span>

                <span className="ru-choice-arrow">
                  →
                </span>

              </button>
            ))}

          </div>

        </section>
      )}

      {/* CHOICE RESULT */}
      {selectedChoice && (
        <section className="ru-choice-result">

          <div className="ru-result-inner">

            <div className="ru-result-label">
              <span />
              YOUR CHOICE
              <span />
            </div>

            <h2>
              The Watcher
              <em>listens.</em>
            </h2>

            <p>
              Your decision has changed the direction of this encounter.
              The story will remember what you chose.
            </p>

            <div className="ru-result-meta">

              <div>
                <span>DISCOVERY</span>
                <strong>001</strong>
              </div>

              <div>
                <span>CHOICE</span>
                <strong>
                  {choices.find((choice) => choice.id === selectedChoice)?.id}
                </strong>
              </div>

              <div>
                <span>XP</span>
                <strong>+50</strong>
              </div>

            </div>

            <button
              type="button"
              className="ru-next-button"
              onClick={() => {
                window.location.href = "/mission";
              }}
            >
              <span>CONTINUE THE JOURNEY</span>
              <b>→</b>
            </button>

          </div>

        </section>
      )}

      {/* BOTTOM HUD */}
      <footer className="ru-story-footer">

        <div>
          <span>MISSION</span>
          <strong>FIRST CONTACT</strong>
        </div>

        <div className="ru-story-progress">
          <span>STORY PROGRESS</span>
          <div>
            <i
              style={{
                width: `${((dialogueStep + 1) / dialogue.length) * 100}%`,
              }}
            />
          </div>
          <small>
            {dialogueStep + 1} / {dialogue.length}
          </small>
        </div>

        <div className="ru-story-footer-right">
          <span>REALITY LINK</span>
          <strong>
            <i />
            STABLE
          </strong>
        </div>

      </footer>

      <style jsx global>{`

        .ru-story {
          position: relative;
          min-height: 100svh;
          overflow: hidden;
          background: #02070e;
          color: #f4ead6;
          isolation: isolate;
          font-family: Arial, Helvetica, sans-serif;
        }

        .ru-story-background {
          position: absolute;
          inset: 0;
          z-index: -6;
          background:
            linear-gradient(
              180deg,
              rgba(1, 7, 14, .36),
              rgba(1, 7, 14, .72)
            ),
            url("/assets/backgrounds/hub-bg.png");
          background-size: cover;
          background-position: center;
          transform: scale(1.04);
        }

        .ru-story-vignette {
          position: absolute;
          inset: 0;
          z-index: -5;
          background:
            radial-gradient(
              circle at 50% 48%,
              transparent 12%,
              rgba(1, 6, 13, .22) 42%,
              rgba(0, 4, 10, .88) 100%
            );
        }

        .ru-story-glow {
          position: absolute;
          width: 700px;
          height: 700px;
          left: 50%;
          top: 47%;
          transform: translate(-50%, -50%);
          z-index: -4;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(55, 91, 122, .13),
            transparent 68%
          );
          pointer-events: none;
        }

        .ru-story-noise {
          position: absolute;
          inset: 0;
          z-index: 20;
          pointer-events: none;
          opacity: .025;
          background-image: url("/assets/backgrounds/landing-bg.png");
          background-size: 850px;
          mix-blend-mode: screen;
        }

        /* HEADER */

        .ru-story-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 92px;
          z-index: 30;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 4vw;
          border-bottom: 1px solid rgba(218, 181, 85, .14);
        }

        .ru-story-logo img {
          width: 76px;
          display: block;
        }

        .ru-story-chapter {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(236, 218, 181, .4);
          font-size: 7px;
          letter-spacing: .3em;
        }

        .ru-story-chapter strong {
          color: #d8b75f;
          font-size: 13px;
          font-weight: 400;
        }

        .ru-story-chapter i {
          width: 24px;
          height: 1px;
          background: rgba(213, 176, 78, .35);
        }

        .ru-story-player {
          justify-self: end;
          display: flex;
          flex-direction: column;
          gap: 5px;
          text-align: right;
        }

        .ru-story-player span {
          color: rgba(235, 212, 165, .35);
          font-size: 6px;
          letter-spacing: .25em;
        }

        .ru-story-player strong {
          color: #e2ca91;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: .14em;
        }

        /* LEFT */

        .ru-story-left {
          position: absolute;
          left: 2.3vw;
          top: 50%;
          transform: translateY(-50%);
          height: 42vh;
          z-index: 25;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .ru-story-vertical {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          color: rgba(226, 205, 161, .3);
          font-size: 6px;
          letter-spacing: .28em;
        }

        .ru-story-stat {
          padding-left: 12px;
          border-left: 1px solid rgba(211, 175, 77, .27);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ru-story-stat span {
          color: rgba(231, 208, 159, .32);
          font-size: 6px;
          letter-spacing: .25em;
        }

        .ru-story-stat strong {
          color: rgba(240, 225, 197, .75);
          font-size: 9px;
          letter-spacing: .14em;
          font-weight: 400;
        }

        .ru-story-stat strong.safe {
          color: #d4b968;
        }

        /* SCENE */

        .ru-story-scene {
          position: relative;
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ru-story-mountains {
          position: absolute;
          inset: 15% 0 0;
          opacity: .28;
          background:
            linear-gradient(
              transparent 50%,
              rgba(0, 5, 11, .75)
            );
          pointer-events: none;
        }

        /* WATCHER */

        .ru-watcher {
          position: absolute;
          right: 8%;
          bottom: 6%;
          width: min(420px, 31vw);
          z-index: 6;
          pointer-events: none;
        }

        .ru-watcher img {
          position: relative;
          width: 100%;
          height: auto;
          display: block;
          filter:
            drop-shadow(0 30px 35px rgba(0,0,0,.6))
            saturate(1.08);
          animation: ruWatcherFloat 6s ease-in-out infinite;
        }

        .ru-watcher-halo {
          position: absolute;
          width: 115%;
          height: 90%;
          left: -7%;
          bottom: 5%;
          border-radius: 50%;
          background: radial-gradient(
            ellipse,
            rgba(206, 171, 79, .14),
            transparent 68%
          );
          filter: blur(25px);
        }

        .ru-watcher-label {
          position: absolute;
          right: -15px;
          bottom: 22%;
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding-left: 12px;
          border-left: 1px solid rgba(213, 176, 79, .45);
        }

        .ru-watcher-label span {
          font-size: 6px;
          letter-spacing: .25em;
          color: rgba(234, 210, 164, .4);
        }

        .ru-watcher-label strong {
          font-size: 10px;
          letter-spacing: .14em;
          color: #d9bf80;
          font-weight: 400;
        }

        .ru-ground-light {
          position: absolute;
          right: 9%;
          bottom: 5%;
          width: 390px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(
            ellipse,
            rgba(211, 176, 75, .14),
            transparent 70%
          );
          filter: blur(20px);
        }

        /* CONTENT */

        .ru-story-content {
          position: relative;
          z-index: 10;
          width: min(650px, 48vw);
          margin-left: -10vw;
          margin-top: -7vh;
          text-align: center;
        }

        .ru-story-eyebrow {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 13px;
          color: #c9a75b;
          font-size: 7px;
          letter-spacing: .38em;
        }

        .ru-story-eyebrow span {
          width: 36px;
          height: 1px;
          background: rgba(201, 167, 91, .5);
        }

        .ru-story-content h1 {
          margin: 25px 0 28px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(70px, 7vw, 108px);
          line-height: .78;
          letter-spacing: -.07em;
          font-weight: 400;
          color: #f4ead7;
        }

        .ru-story-content h1 em {
          display: block;
          margin-left: 65px;
          margin-top: 13px;
          color: rgba(166, 174, 184, .76);
          font-style: italic;
        }

        .ru-dialogue {
          width: min(510px, 90%);
          margin: auto;
        }

        .ru-speaker {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          color: #c9a95e;
          font-size: 7px;
          letter-spacing: .28em;
        }

        .ru-speaker-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d7b85f;
          box-shadow: 0 0 10px rgba(215,184,95,.7);
        }

        .ru-dialogue p {
          margin: 18px auto 25px;
          min-height: 60px;
          color: rgba(238, 229, 211, .72);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 17px;
          line-height: 1.65;
          font-style: italic;
          animation: ruDialogueIn .45s ease;
        }

        .ru-dialogue-button,
        .ru-next-button {
          height: 48px;
          min-width: 190px;
          padding: 0 23px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          border: 1px solid rgba(211, 174, 76, .72);
          border-radius: 28px;
          background: rgba(1, 7, 14, .38);
          color: #dfc98f;
          cursor: pointer;
          font-size: 7px;
          letter-spacing: .28em;
          transition: .25s ease;
        }

        .ru-dialogue-button:hover,
        .ru-next-button:hover {
          transform: translateY(-3px);
          background: rgba(205, 168, 68, .09);
          box-shadow: 0 12px 35px rgba(0,0,0,.3);
        }

        .ru-dialogue-button b,
        .ru-next-button b {
          font-size: 15px;
          font-weight: 400;
        }

        /* CHOICES */

        .ru-choice-panel {
          position: absolute;
          left: 50%;
          bottom: 75px;
          transform: translateX(-50%);
          z-index: 40;
          width: min(850px, 70vw);
          animation: ruChoiceIn .5s ease;
        }

        .ru-choice-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-bottom: 13px;
        }

        .ru-choice-heading span {
          font-size: 6px;
          color: rgba(229, 207, 164, .36);
          letter-spacing: .3em;
        }

        .ru-choice-heading strong {
          color: #e2cf9f;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 17px;
          font-weight: 400;
          font-style: italic;
        }

        .ru-choices {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .ru-choice {
          min-height: 105px;
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 17px;
          border: 1px solid rgba(215, 178, 80, .18);
          background: rgba(2, 9, 17, .68);
          color: #eee3ca;
          text-align: left;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition:
            transform .25s ease,
            border-color .25s ease,
            background .25s ease;
        }

        .ru-choice:hover {
          transform: translateY(-5px);
          border-color: rgba(220, 184, 87, .6);
          background: rgba(12, 23, 35, .78);
        }

        .ru-choice-number {
          color: #c7a557;
          font-size: 7px;
          letter-spacing: .15em;
        }

        .ru-choice-copy {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ru-choice-copy strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 14px;
          font-weight: 400;
        }

        .ru-choice-copy small {
          color: rgba(229, 220, 202, .4);
          font-size: 9px;
          line-height: 1.5;
        }

        .ru-choice-arrow {
          position: absolute;
          right: 13px;
          bottom: 13px;
          color: #caa858;
          font-size: 13px;
          opacity: .6;
        }

        /* RESULT */

        .ru-choice-result {
          position: absolute;
          inset: 0;
          z-index: 60;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(1, 6, 13, .82);
          backdrop-filter: blur(16px);
          animation: ruResultIn .5s ease;
        }

        .ru-result-inner {
          width: min(600px, 85vw);
          text-align: center;
        }

        .ru-result-label {
          display: flex;
          justify-content: center;
          gap: 13px;
          align-items: center;
          color: #c9a75a;
          font-size: 7px;
          letter-spacing: .3em;
        }

        .ru-result-label span {
          width: 40px;
          height: 1px;
          background: rgba(201,167,90,.45);
        }

        .ru-result-inner h2 {
          margin: 25px 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(50px, 6vw, 82px);
          line-height: .8;
          font-weight: 400;
          letter-spacing: -.06em;
        }

        .ru-result-inner h2 em {
          display: block;
          color: #a9b0b9;
          font-style: italic;
        }

        .ru-result-inner > p {
          max-width: 480px;
          margin: auto;
          color: rgba(231, 222, 207, .56);
          font-size: 12px;
          line-height: 1.8;
        }

        .ru-result-meta {
          display: flex;
          justify-content: center;
          gap: 55px;
          margin: 32px 0;
        }

        .ru-result-meta div {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ru-result-meta span {
          color: rgba(227, 203, 155, .34);
          font-size: 6px;
          letter-spacing: .24em;
        }

        .ru-result-meta strong {
          color: #dfc98d;
          font-size: 9px;
          font-weight: 400;
          letter-spacing: .12em;
        }

        /* FOOTER */

        .ru-story-footer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 57px;
          z-index: 35;
          display: grid;
          grid-template-columns: 1fr 1.5fr 1fr;
          align-items: center;
          padding: 0 4vw;
          border-top: 1px solid rgba(215, 178, 80, .12);
        }

        .ru-story-footer > div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .ru-story-footer span {
          color: rgba(228, 204, 157, .3);
          font-size: 6px;
          letter-spacing: .25em;
        }

        .ru-story-footer strong {
          color: rgba(226, 207, 170, .7);
          font-size: 8px;
          font-weight: 400;
          letter-spacing: .14em;
        }

        .ru-story-progress {
          justify-self: center;
          width: 220px;
        }

        .ru-story-progress > div {
          width: 100%;
          height: 2px;
          margin-top: 2px;
          background: rgba(224, 195, 121, .12);
        }

        .ru-story-progress i {
          display: block;
          height: 100%;
          background: #c9a657;
          transition: width .4s ease;
        }

        .ru-story-progress small {
          position: absolute;
          margin-left: 230px;
          margin-top: -9px;
          color: rgba(225, 204, 160, .32);
          font-size: 6px;
        }

        .ru-story-footer-right {
          justify-self: end;
          text-align: right;
        }

        .ru-story-footer-right strong {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: flex-end;
          color: #d2b665;
        }

        .ru-story-footer-right i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d2b665;
          box-shadow: 0 0 10px rgba(210,182,101,.7);
        }

        @keyframes ruWatcherFloat {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes ruDialogueIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ruChoiceIn {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }

          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes ruResultIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @media (max-width: 900px) {

          .ru-story-header {
            height: 72px;
            padding: 0 20px;
          }

          .ru-story-logo img {
            width: 58px;
          }

          .ru-story-chapter {
            font-size: 5px;
          }

          .ru-story-left {
            display: none;
          }

          .ru-story-content {
            width: 78vw;
            margin-left: -8vw;
          }

          .ru-watcher {
            width: 280px;
            right: 2%;
            bottom: 7%;
            opacity: .75;
          }

          .ru-choice-panel {
            width: 90vw;
          }

          .ru-choices {
            grid-template-columns: 1fr;
          }

          .ru-choice {
            min-height: 70px;
          }

          .ru-choice-copy small {
            display: none;
          }

          .ru-story-footer {
            grid-template-columns: 1fr 1fr;
          }

          .ru-story-progress {
            display: none;
          }

        }

        @media (max-width: 600px) {

          .ru-story-player {
            display: none;
          }

          .ru-story-header {
            grid-template-columns: 1fr auto;
          }

          .ru-story-chapter {
            justify-self: end;
          }

          .ru-story-content {
            width: 92vw;
            margin: -130px 0 0;
          }

          .ru-story-content h1 {
            font-size: 64px;
          }

          .ru-story-content h1 em {
            margin-left: 25px;
          }

          .ru-dialogue p {
            font-size: 15px;
          }

          .ru-watcher {
            width: 205px;
            right: 50%;
            transform: translateX(50%);
            bottom: 4%;
            opacity: .55;
          }

          .ru-watcher-label {
            right: -20px;
          }

          .ru-story-footer {
            height: 48px;
            padding: 0 15px;
          }

          .ru-story-footer-right {
            display: none !important;
          }

          .ru-story-footer {
            grid-template-columns: 1fr;
          }

        }

      `}</style>
    </main>
  );
}
