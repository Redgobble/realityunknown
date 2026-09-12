"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function EnterRealityPage() {
  const router = useRouter();
  const [active, setActive] = useState(false);

  return (
    <main className="ru-enter-page">

      {/* =====================================================
          WORLD ATMOSPHERE
          ===================================================== */}

      <div className="ru-enter-world" aria-hidden="true">
        <div className="ru-enter-world-image" />
        <div className="ru-enter-world-color" />
        <div className="ru-enter-vignette" />

        <div className="ru-enter-mist mist-one" />
        <div className="ru-enter-mist mist-two" />

        <span className="ru-enter-star star-one" />
        <span className="ru-enter-star star-two" />
        <span className="ru-enter-star star-three" />
        <span className="ru-enter-star star-four" />
        <span className="ru-enter-star star-five" />
      </div>

      {/* =====================================================
          TOP HUD
          ===================================================== */}

      <header className="ru-enter-header">

        <Link href="/" className="ru-enter-logo">
          <Image
            src="/assets/applogo/reality_unknown_logo.png"
            alt="Reality Unknown"
            width={110}
            height={75}
            priority
          />
        </Link>

        <div className="ru-enter-status">
          <span className="ru-enter-status-dot" />
          REALITY LINK ESTABLISHED
        </div>

        <Link href="/archive" className="ru-enter-archive">
          ARCHIVE <span>↗</span>
        </Link>

      </header>

      {/* =====================================================
          SIDE HUD
          ===================================================== */}

      <div className="ru-enter-side left-side">
        <span>UNKNOWN</span>
        <i />
        <span>001</span>
      </div>

      <div className="ru-enter-side right-side">
        <span>REALITY</span>
        <i />
        <span>ONLINE</span>
      </div>

      {/* =====================================================
          MAIN EXPERIENCE
          ===================================================== */}

      <section className="ru-enter-main">

        {/* TOP EYEBROW */}

        <motion.div
          className="ru-enter-eyebrow"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8 }}
        >
          <span />
          THE WORLD IS WAITING
          <span />
        </motion.div>

        {/* CHARACTER */}

        <motion.div
          className="ru-enter-character"
          initial={{
            opacity: 0,
            scale: .92,
            y: 35,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
          }}
        >

          <div className="ru-enter-character-glow" />

          <div className="ru-enter-character-ring ring-one" />
          <div className="ru-enter-character-ring ring-two" />

          <Image
            src="/assets/character/c14.png"
            alt=""
            width={650}
            height={800}
            priority
          />

          <div className="ru-enter-character-tag">
            <span>UNKNOWN ENTITY</span>
            <strong>01</strong>
          </div>

        </motion.div>

        {/* CENTRAL COPY */}

        <motion.div
          className="ru-enter-copy"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: .9,
            delay: .25,
          }}
        >

          <h1>
            Look
            <em>closer.</em>
          </h1>

          <p>
            The world around you contains stories you have never seen.
            Your journey begins with a single discovery.
          </p>

          <button
            type="button"
            className={`ru-enter-discover ${
              active ? "is-active" : ""
            }`}
            onClick={() => {
              if (active) return;

              setActive(true);

              window.setTimeout(() => {
                router.push("/discovery");
              }, 1100);
            }}
          >

            <span className="ru-enter-button-orbit" />

            <span className="ru-enter-button-inner">

              <span className="ru-enter-button-icon">
                {active ? "✦" : "◉"}
              </span>

              <span>
                {active
                  ? "REALITY DETECTED"
                  : "DISCOVER SOMETHING"}
              </span>

              <b>→</b>

            </span>

          </button>

          {active && (
            <motion.div
              className="ru-enter-detected"
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <span />
              <p>
                A world of possibilities has opened.
              </p>
            </motion.div>
          )}

        </motion.div>

        {/* SCANNER */}

        <motion.div
          className={`ru-enter-scanner ${
            active ? "scanner-active" : ""
          }`}
          initial={{
            opacity: 0,
            scale: .8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1,
            delay: .5,
          }}
        >

          <div className="scanner-corner corner-tl" />
          <div className="scanner-corner corner-tr" />
          <div className="scanner-corner corner-bl" />
          <div className="scanner-corner corner-br" />

          <div className="scanner-crosshair">
            <span />
            <span />
          </div>

          <div className="scanner-scan-line" />

          <div className="scanner-label">
            <span>SCAN FIELD</span>
            <strong>
              {active ? "SIGNAL FOUND" : "SEARCHING"}
            </strong>
          </div>

        </motion.div>

        {/* BOTTOM INFO */}

        <div className="ru-enter-bottom">

          <div>
            <small>LOCATION</small>
            <strong>UNKNOWN</strong>
          </div>

          <div>
            <small>DISCOVERIES</small>
            <strong>00</strong>
          </div>

          <div>
            <small>STATUS</small>
            <strong className="online">
              ● READY
            </strong>
          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="ru-enter-footer">

        <Link href="/how-it-works">
          ← HOW IT WORKS
        </Link>

        <span>
          REALITY UNKNOWN · 2026
        </span>

        <Link href="/about">
          ABOUT ↗
        </Link>

      </footer>

    </main>
  );
}
