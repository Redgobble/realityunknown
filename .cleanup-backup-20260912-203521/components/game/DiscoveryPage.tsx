"use client";

import { useState } from "react";
import Link from "next/link";

type DiscoveryState = "idle" | "scanning" | "found";

export function DiscoveryPage() {
  const [state, setState] = useState<DiscoveryState>("idle");

  const handleScan = () => {
    setState("scanning");

    window.setTimeout(() => {
      setState("found");
    }, 1600);
  };

  return (
    <main className="ru-discovery">
      {/* BACKGROUND */}
      <div className="ru-discovery-bg" />
      <div className="ru-discovery-vignette" />
      <div className="ru-discovery-grid" />
      <div className="ru-discovery-noise" />

      {/* TOP BAR */}
      <header className="ru-discovery-header">
        <Link href="/enter-reality" className="ru-discovery-logo">
          <img
            src="/assets/applogo/reality_unknown_logo.png"
            alt="Reality Unknown"
          />
        </Link>

        <div className="ru-discovery-status">
          <span className="ru-status-dot" />
          <span>REALITY LINK</span>
          <strong>ACTIVE</strong>
        </div>

        <div className="ru-discovery-chapter">
          <span>CHAPTER</span>
          <strong>01</strong>
        </div>
      </header>

      {/* LEFT HUD */}
      <aside className="ru-discovery-left-hud">
        <div className="ru-vertical-label">UNKNOWN // WORLD</div>

        <div className="ru-location-block">
          <span>LOCATION</span>
          <strong>UNIDENTIFIED</strong>
        </div>

        <div className="ru-coordinate-block">
          <span>COORDINATES</span>
          <strong>---</strong>
          <strong>---</strong>
        </div>
      </aside>

      {/* MAIN WORLD VIEW */}
      <section className="ru-discovery-world">

        {/* TARGET RETICLE */}
        <div
          className={`ru-target ${
            state === "scanning" ? "is-scanning" : ""
          } ${state === "found" ? "is-found" : ""}`}
        >
          <div className="ru-target-corner ru-target-tl" />
          <div className="ru-target-corner ru-target-tr" />
          <div className="ru-target-corner ru-target-bl" />
          <div className="ru-target-corner ru-target-br" />

          <div className="ru-target-ring">
            <div className="ru-target-crosshair horizontal" />
            <div className="ru-target-crosshair vertical" />
            <div className="ru-target-core" />
          </div>

          {state === "scanning" && (
            <div className="ru-scan-line" />
          )}

          {state === "found" && (
            <div className="ru-target-found">
              <span>✦</span>
              SIGNAL FOUND
            </div>
          )}
        </div>

        {/* WORLD CHARACTER */}
        <div className="ru-world-character">
          <div className="ru-character-glow" />

          <img
            src="/assets/character/c14.png"
            alt="Unknown entity"
          />

          <div className="ru-character-tag">
            <span>UNKNOWN ENTITY</span>
            <strong>01</strong>
          </div>
        </div>

        {/* CENTER COPY */}
        <div className="ru-discovery-center">
          <div className="ru-eyebrow">
            <i />
            THE WORLD IS WAITING
            <i />
          </div>

          <h1>
            Discover
            <em>the unknown.</em>
          </h1>

          <p>
            Something exists here that has not yet been understood.
            Search the world. Find the signal. Follow the story.
          </p>

          <button
            type="button"
            className={`ru-scan-button ${
              state === "scanning" ? "is-scanning" : ""
            } ${state === "found" ? "is-found" : ""}`}
            onClick={handleScan}
            disabled={state === "scanning"}
          >
            <span className="ru-button-icon">
              {state === "found" ? "✦" : "◎"}
            </span>

            <span>
              {state === "idle" && "SCAN REALITY"}
              {state === "scanning" && "SEARCHING..."}
              {state === "found" && "DISCOVERY FOUND"}
            </span>

            <span className="ru-button-arrow">→</span>
          </button>

          <div className="ru-scan-message">
            {state === "idle" &&
              "Point your attention toward something unknown."}

            {state === "scanning" &&
              "Analyzing the surrounding reality..."}

            {state === "found" &&
              "An unknown entity has been detected."}
          </div>
        </div>

        {/* FLOATING SIGNALS */}
        <div className="ru-signal ru-signal-1">01</div>
        <div className="ru-signal ru-signal-2">◈</div>
        <div className="ru-signal ru-signal-3">+</div>
        <div className="ru-signal ru-signal-4">02</div>
      </section>

      {/* RIGHT HUD */}
      <aside className="ru-discovery-right-hud">
        <div className="ru-hud-card">
          <span>DISCOVERIES</span>
          <strong>{state === "found" ? "01" : "00"}</strong>
        </div>

        <div className="ru-hud-card">
          <span>EXPERIENCE</span>
          <strong>{state === "found" ? "120" : "000"}</strong>
          <small>XP</small>
        </div>

        <div className="ru-hud-card">
          <span>STATUS</span>
          <strong className="ready">
            <i />
            {state === "scanning"
              ? "SEARCH"
              : state === "found"
                ? "FOUND"
                : "READY"}
          </strong>
        </div>
      </aside>

      {/* BOTTOM BAR */}
      <footer className="ru-discovery-footer">
        <div>
          <span>←</span>
          RETURN TO REALITY GATEWAY
        </div>

        <div className="ru-footer-center">
          REALITY UNKNOWN — 2026
        </div>

        <div>
          DISCOVERY SYSTEM <span>01</span>
        </div>
      </footer>

      {/* DISCOVERY PANEL */}
      {state === "found" && (
        <div className="ru-discovery-reveal">
          <div className="ru-reveal-inner">

            <div className="ru-reveal-line">
              <span />
              DISCOVERY 001
              <span />
            </div>

            <h2>
              The
              <em>Watcher.</em>
            </h2>

            <p>
              An unfamiliar presence has emerged from the unknown.
              It appears to be waiting for you to ask the right question.
            </p>

            <div className="ru-reveal-meta">
              <div>
                <span>ENTITY</span>
                <strong>UNKNOWN</strong>
              </div>

              <div>
                <span>THREAT</span>
                <strong>NONE</strong>
              </div>

              <div>
                <span>XP</span>
                <strong>+120</strong>
              </div>
            </div>

            <button
              type="button"
              className="ru-continue-button"
              onClick={() => {
                window.location.href = "/story";
              }}
            >
              <span>ENTER THE STORY</span>
              <b>→</b>
            </button>

          </div>
        </div>
      )}

      <style jsx global>{`
        .ru-discovery {
          position: relative;
          min-height: 100svh;
          overflow: hidden;
          background: #030912;
          color: #f3ead8;
          isolation: isolate;
          font-family: Arial, Helvetica, sans-serif;
        }

        .ru-discovery-bg {
          position: absolute;
          inset: 0;
          z-index: -5;
          background-image:
            linear-gradient(
              180deg,
              rgba(1, 8, 17, 0.48),
              rgba(1, 8, 17, 0.58)
            ),
            url("/assets/backgrounds/hub-bg.png");
          background-size: cover;
          background-position: center;
          transform: scale(1.035);
          animation: ruWorldDrift 18s ease-in-out infinite alternate;
        }

        .ru-discovery-vignette {
          position: absolute;
          inset: 0;
          z-index: -4;
          background:
            radial-gradient(
              circle at 52% 45%,
              rgba(24, 60, 94, 0.12),
              transparent 38%
            ),
            linear-gradient(
              90deg,
              rgba(0, 6, 13, 0.88),
              transparent 27%,
              transparent 73%,
              rgba(0, 6, 13, 0.88)
            ),
            linear-gradient(
              180deg,
              rgba(0, 5, 12, 0.55),
              transparent 30%,
              rgba(0, 5, 12, 0.72)
            );
        }

        .ru-discovery-grid {
          position: absolute;
          inset: 0;
          z-index: -2;
          opacity: 0.11;
          background-image:
            linear-gradient(
              rgba(214, 174, 78, 0.18) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(214, 174, 78, 0.18) 1px,
              transparent 1px
            );
          background-size: 80px 80px;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 20%,
            black 80%,
            transparent
          );
        }

        .ru-discovery-noise {
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("/assets/backgrounds/landing-bg.png");
          background-size: 900px;
          mix-blend-mode: screen;
        }

        .ru-discovery-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 92px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 5vw;
          border-bottom: 1px solid rgba(215, 178, 87, 0.13);
          z-index: 20;
        }

        .ru-discovery-logo img {
          width: 76px;
          height: auto;
          display: block;
          filter: drop-shadow(0 0 14px rgba(221, 186, 91, 0.14));
        }

        .ru-discovery-status {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 8px;
          letter-spacing: 0.3em;
          color: rgba(241, 220, 177, 0.62);
        }

        .ru-discovery-status strong {
          color: #e3c46c;
          font-weight: 500;
        }

        .ru-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d8b85e;
          box-shadow: 0 0 12px rgba(216, 184, 94, 0.75);
          animation: ruPulse 2s ease-in-out infinite;
        }

        .ru-discovery-chapter {
          justify-self: end;
          display: flex;
          align-items: baseline;
          gap: 12px;
          font-size: 8px;
          letter-spacing: 0.28em;
          color: rgba(241, 220, 177, 0.42);
        }

        .ru-discovery-chapter strong {
          color: #d9b85e;
          font-size: 13px;
          font-weight: 500;
        }

        .ru-discovery-left-hud,
        .ru-discovery-right-hud {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 15;
        }

        .ru-discovery-left-hud {
          left: 2.2vw;
          height: 43vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .ru-vertical-label {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 7px;
          letter-spacing: 0.32em;
          color: rgba(232, 211, 166, 0.35);
        }

        .ru-location-block,
        .ru-coordinate-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-left: 1px solid rgba(210, 174, 79, 0.28);
          padding-left: 12px;
        }

        .ru-location-block span,
        .ru-coordinate-block span {
          font-size: 7px;
          letter-spacing: 0.26em;
          color: rgba(235, 211, 158, 0.36);
        }

        .ru-location-block strong,
        .ru-coordinate-block strong {
          font-size: 8px;
          letter-spacing: 0.16em;
          color: rgba(244, 230, 201, 0.72);
          font-weight: 500;
        }

        .ru-discovery-right-hud {
          right: 3.2vw;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .ru-hud-card {
          min-width: 105px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-left: 13px;
          border-left: 1px solid rgba(214, 178, 82, 0.28);
        }

        .ru-hud-card span {
          font-size: 7px;
          letter-spacing: 0.26em;
          color: rgba(232, 210, 164, 0.38);
        }

        .ru-hud-card strong {
          font-size: 18px;
          letter-spacing: 0.08em;
          font-weight: 400;
          color: rgba(245, 235, 215, 0.88);
        }

        .ru-hud-card small {
          margin-top: -3px;
          font-size: 6px;
          letter-spacing: 0.25em;
          color: rgba(231, 207, 156, 0.35);
        }

        .ru-hud-card strong.ready {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #d9bb68;
        }

        .ru-hud-card strong.ready i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d9bb68;
          box-shadow: 0 0 10px rgba(217, 187, 104, 0.7);
        }

        .ru-discovery-world {
          position: relative;
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ru-discovery-center {
          position: relative;
          z-index: 8;
          width: min(620px, 50vw);
          margin-top: 30px;
          text-align: center;
        }

        .ru-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 13px;
          margin-bottom: 26px;
          color: #c9a95b;
          font-size: 8px;
          letter-spacing: 0.38em;
        }

        .ru-eyebrow i {
          width: 38px;
          height: 1px;
          background: rgba(201, 169, 91, 0.5);
        }

        .ru-discovery-center h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(64px, 7vw, 112px);
          line-height: 0.8;
          letter-spacing: -0.07em;
          font-weight: 400;
          color: #f6eedc;
        }

        .ru-discovery-center h1 em {
          display: block;
          color: rgba(153, 164, 175, 0.72);
          font-style: italic;
          margin-left: 80px;
          margin-top: 13px;
        }

        .ru-discovery-center p {
          width: min(470px, 90%);
          margin: 36px auto 28px;
          font-size: 13px;
          line-height: 1.8;
          color: rgba(225, 224, 220, 0.57);
        }

        .ru-scan-button {
          position: relative;
          height: 52px;
          min-width: 215px;
          padding: 0 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          border: 1px solid rgba(211, 174, 75, 0.7);
          border-radius: 30px;
          background: rgba(3, 10, 18, 0.5);
          color: #e6d09a;
          cursor: pointer;
          font-size: 8px;
          letter-spacing: 0.28em;
          transition:
            transform 250ms ease,
            background 250ms ease,
            box-shadow 250ms ease,
            border-color 250ms ease;
        }

        .ru-scan-button:hover:not(:disabled) {
          transform: translateY(-3px);
          background: rgba(195, 157, 59, 0.09);
          border-color: #e2c16b;
          box-shadow:
            0 10px 35px rgba(0, 0, 0, 0.3),
            0 0 24px rgba(208, 169, 67, 0.12);
        }

        .ru-scan-button:disabled {
          cursor: default;
        }

        .ru-button-icon {
          font-size: 17px;
          color: #e0bd5d;
        }

        .ru-button-arrow {
          font-size: 16px;
          transition: transform 250ms ease;
        }

        .ru-scan-button:hover .ru-button-arrow {
          transform: translateX(4px);
        }

        .ru-scan-button.is-scanning {
          border-color: rgba(228, 198, 104, 0.85);
          box-shadow: 0 0 30px rgba(214, 179, 76, 0.1);
        }

        .ru-scan-button.is-found {
          background: rgba(196, 161, 67, 0.1);
        }

        .ru-scan-message {
          margin-top: 18px;
          min-height: 20px;
          font-size: 9px;
          letter-spacing: 0.08em;
          color: rgba(226, 213, 184, 0.36);
        }

        .ru-world-character {
          position: absolute;
          right: 10%;
          bottom: 7.5%;
          width: min(360px, 25vw);
          z-index: 5;
          pointer-events: none;
        }

        .ru-world-character img {
          position: relative;
          width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
          filter:
            drop-shadow(0 25px 35px rgba(0, 0, 0, 0.45))
            saturate(1.05);
          animation: ruCharacterFloat 5s ease-in-out infinite;
        }

        .ru-character-glow {
          position: absolute;
          left: 10%;
          right: 10%;
          bottom: 2%;
          height: 70%;
          border-radius: 50%;
          background: radial-gradient(
            ellipse,
            rgba(201, 163, 72, 0.12),
            transparent 65%
          );
          filter: blur(20px);
        }

        .ru-character-tag {
          position: absolute;
          right: -25px;
          bottom: 16%;
          display: flex;
          flex-direction: column;
          gap: 5px;
          border-left: 1px solid rgba(218, 181, 84, 0.4);
          padding-left: 12px;
        }

        .ru-character-tag span {
          font-size: 6px;
          letter-spacing: 0.25em;
          color: rgba(232, 211, 165, 0.42);
        }

        .ru-character-tag strong {
          font-size: 14px;
          font-weight: 400;
          color: #e6d19b;
        }

        .ru-target {
          position: absolute;
          left: 17%;
          top: 48%;
          width: 170px;
          height: 170px;
          transform: translate(-50%, -50%);
          z-index: 4;
        }

        .ru-target-corner {
          position: absolute;
          width: 23px;
          height: 23px;
          border-color: rgba(211, 174, 74, 0.68);
          border-style: solid;
        }

        .ru-target-tl {
          top: 0;
          left: 0;
          border-width: 1px 0 0 1px;
        }

        .ru-target-tr {
          top: 0;
          right: 0;
          border-width: 1px 1px 0 0;
        }

        .ru-target-bl {
          bottom: 0;
          left: 0;
          border-width: 0 0 1px 1px;
        }

        .ru-target-br {
          right: 0;
          bottom: 0;
          border-width: 0 1px 1px 0;
        }

        .ru-target-ring {
          position: absolute;
          width: 52px;
          height: 52px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(218, 181, 82, 0.52);
          border-radius: 50%;
        }

        .ru-target-ring::before,
        .ru-target-ring::after {
          content: "";
          position: absolute;
          inset: -9px;
          border: 1px solid rgba(218, 181, 82, 0.1);
          border-radius: 50%;
        }

        .ru-target-ring::after {
          inset: -20px;
          border-color: rgba(218, 181, 82, 0.05);
        }

        .ru-target-crosshair {
          position: absolute;
          background: rgba(218, 181, 82, 0.4);
        }

        .ru-target-crosshair.horizontal {
          width: 88px;
          height: 1px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .ru-target-crosshair.vertical {
          width: 1px;
          height: 88px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .ru-target-core {
          position: absolute;
          width: 5px;
          height: 5px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: #d9b85e;
          box-shadow: 0 0 15px rgba(217, 184, 94, 0.7);
        }

        .ru-scan-line {
          position: absolute;
          left: 7px;
          right: 7px;
          top: 0;
          height: 1px;
          background: #e0bd5b;
          box-shadow: 0 0 14px rgba(224, 189, 91, 0.8);
          animation: ruScan 1.4s linear infinite;
        }

        .ru-target.is-scanning .ru-target-ring {
          animation: ruTargetPulse 900ms ease-in-out infinite;
        }

        .ru-target.is-found .ru-target-ring {
          border-color: rgba(233, 202, 107, 0.9);
          box-shadow: 0 0 30px rgba(221, 185, 79, 0.12);
        }

        .ru-target-found {
          position: absolute;
          left: 50%;
          bottom: -31px;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
          font-size: 7px;
          letter-spacing: 0.25em;
          color: #d9b85e;
        }

        .ru-signal {
          position: absolute;
          color: rgba(211, 179, 99, 0.32);
          font-size: 8px;
          animation: ruSignalFloat 5s ease-in-out infinite;
        }

        .ru-signal-1 {
          top: 28%;
          left: 37%;
        }

        .ru-signal-2 {
          top: 33%;
          right: 30%;
          animation-delay: 1s;
        }

        .ru-signal-3 {
          bottom: 25%;
          left: 42%;
          animation-delay: 2s;
        }

        .ru-signal-4 {
          bottom: 34%;
          right: 39%;
          animation-delay: 3s;
        }

        .ru-discovery-footer {
          position: absolute;
          z-index: 20;
          bottom: 0;
          left: 0;
          right: 0;
          height: 57px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          padding: 0 4vw;
          border-top: 1px solid rgba(215, 178, 87, 0.11);
          color: rgba(224, 204, 160, 0.35);
          font-size: 6px;
          letter-spacing: 0.25em;
        }

        .ru-footer-center {
          text-align: center;
        }

        .ru-discovery-footer > div:last-child {
          text-align: right;
        }

        .ru-discovery-footer span {
          color: #c8a655;
        }

        .ru-discovery-reveal {
          position: absolute;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(1, 7, 14, 0.82);
          backdrop-filter: blur(14px);
          animation: ruRevealIn 500ms ease forwards;
        }

        .ru-reveal-inner {
          width: min(580px, 85vw);
          text-align: center;
        }

        .ru-reveal-line {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: #c7a553;
          font-size: 7px;
          letter-spacing: 0.32em;
        }

        .ru-reveal-line span {
          width: 40px;
          height: 1px;
          background: rgba(199, 165, 83, 0.5);
        }

        .ru-reveal-inner h2 {
          margin: 26px 0 24px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(65px, 8vw, 105px);
          font-weight: 400;
          line-height: 0.8;
          letter-spacing: -0.07em;
          color: #f6eedc;
        }

        .ru-reveal-inner h2 em {
          display: block;
          color: #a7adb5;
          font-style: italic;
        }

        .ru-reveal-inner > p {
          max-width: 480px;
          margin: 0 auto;
          font-size: 13px;
          line-height: 1.8;
          color: rgba(235, 228, 213, 0.55);
        }

        .ru-reveal-meta {
          display: flex;
          justify-content: center;
          gap: 60px;
          margin: 35px 0;
        }

        .ru-reveal-meta div {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .ru-reveal-meta span {
          font-size: 6px;
          letter-spacing: 0.25em;
          color: rgba(228, 204, 155, 0.38);
        }

        .ru-reveal-meta strong {
          font-size: 10px;
          letter-spacing: 0.13em;
          font-weight: 400;
          color: #e4d19e;
        }

        .ru-continue-button {
          height: 50px;
          min-width: 210px;
          padding: 0 25px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          border: 1px solid rgba(215, 178, 81, 0.7);
          border-radius: 28px;
          background: transparent;
          color: #e3cb91;
          cursor: pointer;
          font-size: 8px;
          letter-spacing: 0.25em;
          transition: 250ms ease;
        }

        .ru-continue-button:hover {
          background: rgba(209, 173, 76, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
        }

        .ru-continue-button b {
          font-size: 16px;
          font-weight: 400;
        }

        @keyframes ruWorldDrift {
          from {
            transform: scale(1.035) translate3d(0, 0, 0);
          }
          to {
            transform: scale(1.065) translate3d(-8px, -4px, 0);
          }
        }

        @keyframes ruCharacterFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes ruPulse {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes ruScan {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(160px);
          }
        }

        @keyframes ruTargetPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.13);
          }
        }

        @keyframes ruSignalFloat {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.25;
          }
          50% {
            transform: translateY(-12px);
            opacity: 0.65;
          }
        }

        @keyframes ruRevealIn {
          from {
            opacity: 0;
            transform: scale(1.03);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 1100px) {
          .ru-world-character {
            right: 4%;
            width: 270px;
          }

          .ru-target {
            left: 12%;
          }

          .ru-discovery-center {
            width: 55vw;
          }

          .ru-discovery-right-hud {
            right: 1.5vw;
          }
        }

        @media (max-width: 800px) {
          .ru-discovery-header {
            height: 72px;
            padding: 0 20px;
          }

          .ru-discovery-logo img {
            width: 58px;
          }

          .ru-discovery-status {
            font-size: 6px;
            letter-spacing: 0.2em;
          }

          .ru-discovery-chapter {
            font-size: 6px;
          }

          .ru-discovery-left-hud {
            display: none;
          }

          .ru-discovery-right-hud {
            top: 86px;
            right: 18px;
            transform: none;
            flex-direction: row;
            gap: 16px;
          }

          .ru-hud-card {
            min-width: auto;
            padding-left: 8px;
          }

          .ru-hud-card span {
            font-size: 5px;
          }

          .ru-hud-card strong {
            font-size: 12px;
          }

          .ru-world-character {
            width: 230px;
            right: 50%;
            bottom: 7%;
            transform: translateX(50%);
            opacity: 0.82;
          }

          .ru-character-tag {
            right: -15px;
          }

          .ru-discovery-center {
            width: 90vw;
            margin-top: -90px;
          }

          .ru-discovery-center h1 {
            font-size: clamp(55px, 16vw, 82px);
          }

          .ru-discovery-center h1 em {
            margin-left: 25px;
          }

          .ru-discovery-center p {
            font-size: 11px;
            margin-top: 30px;
          }

          .ru-target {
            width: 125px;
            height: 125px;
            left: 15%;
            top: 50%;
            opacity: 0.65;
          }

          .ru-discovery-footer {
            height: 45px;
            padding: 0 16px;
            font-size: 5px;
          }

          .ru-footer-center {
            display: none;
          }

          .ru-discovery-footer {
            grid-template-columns: 1fr 1fr;
          }

          .ru-reveal-meta {
            gap: 25px;
          }
        }

        @media (max-width: 520px) {
          .ru-discovery-status {
            display: none;
          }

          .ru-discovery-header {
            grid-template-columns: 1fr auto;
          }

          .ru-world-character {
            width: 190px;
          }

          .ru-target {
            left: 10%;
            transform: translate(-50%, -50%) scale(0.75);
          }

          .ru-discovery-center {
            margin-top: -130px;
          }

          .ru-discovery-center h1 {
            font-size: 58px;
          }

          .ru-discovery-center p {
            width: 82%;
          }

          .ru-scan-button {
            min-width: 195px;
            height: 48px;
          }

          .ru-hud-card:nth-child(2) {
            display: none;
          }

          .ru-reveal-inner h2 {
            font-size: 65px;
          }

          .ru-reveal-inner > p {
            width: 90%;
            font-size: 11px;
          }

          .ru-reveal-meta {
            gap: 18px;
            margin: 28px 0;
          }
        }
      `}</style>
    </main>
  );
}
