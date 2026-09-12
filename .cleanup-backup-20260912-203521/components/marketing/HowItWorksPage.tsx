"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "SEE",
    headline: "Point your camera.",
    description:
      "Start with something real — a monument, building, object or forgotten corner of the world.",
    detail: "Reality begins with what you can see.",
  },
  {
    number: "02",
    title: "UNDERSTAND",
    headline: "Let AI look closer.",
    description:
      "Reality Unknown recognizes what you're looking at and connects it with the knowledge surrounding it.",
    detail: "The ordinary becomes a clue.",
  },
  {
    number: "03",
    title: "EXPLORE",
    headline: "Follow what you find.",
    description:
      "Discover people, events, mysteries and moments connected to the place in front of you.",
    detail: "Every answer opens another question.",
  },
  {
    number: "04",
    title: "DISCOVER",
    headline: "Reveal the hidden story.",
    description:
      "Verified knowledge becomes an interactive story built around the world you're actually standing in.",
    detail: "History stops being distant.",
  },
  {
    number: "05",
    title: "EXPERIENCE",
    headline: "Make the journey yours.",
    description:
      "Choose what to investigate, which clues to follow and how deeply you want to go.",
    detail: "Curiosity becomes gameplay.",
  },
  {
    number: "06",
    title: "REMEMBER",
    headline: "Leave with a story.",
    description:
      "Your discoveries become part of your journey — places you've seen, stories you've uncovered and moments you've experienced.",
    detail: "The world becomes your archive.",
  },
];

export function HowItWorksPage() {
  return (
    <main className="ru-how-page">
      {/* ATMOSPHERE */}
      <div className="ru-how-atmosphere" aria-hidden="true">
        <div className="ru-how-bg-image" />
        <div className="ru-how-bg-overlay" />
        <div className="ru-how-blue-glow" />
        <div className="ru-how-gold-glow" />

        <span className="ru-how-particle p1" />
        <span className="ru-how-particle p2" />
        <span className="ru-how-particle p3" />
        <span className="ru-how-particle p4" />
        <span className="ru-how-particle p5" />

        <div className="ru-how-orbit orbit-a" />
        <div className="ru-how-orbit orbit-b" />
      </div>

      {/* NAV */}
      <header className="ru-how-nav">
        <Link href="/" className="ru-how-brand">
          <Image
            src="/assets/applogo/reality_unknown_logo.png"
            alt="Reality Unknown"
            width={110}
            height={74}
            priority
          />
        </Link>

        <div className="ru-how-nav-title">
          <span>02</span>
          HOW IT WORKS
        </div>

        <nav>
          <Link href="/about">ABOUT</Link>
          <Link href="/archive">THE ARCHIVE</Link>
          <Link href="/enter-reality">ENTER REALITY</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="ru-how-hero">
        <div className="ru-how-hero-copy">
          <motion.div
            className="ru-how-eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <i />
            THE JOURNEY
            <i />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Don't just
            <em>learn it.</em>
            <strong>Discover it.</strong>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Reality Unknown turns the world around you into an interactive
            journey — using AI to uncover the stories hidden inside real
            places.
          </motion.p>

          <motion.div
            className="ru-how-hero-meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <span>SEE</span>
            <b />
            <span>UNDERSTAND</span>
            <b />
            <span>DISCOVER</span>
          </motion.div>
        </div>

        <motion.div
          className="ru-how-hero-art"
          initial={{ opacity: 0, scale: 0.94, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div className="ru-how-art-ring" />

          <Image
            src="/assets/character/c14.png"
            alt=""
            width={620}
            height={760}
            priority
          />

          <span className="ru-how-art-label">
            <small>THE OBSERVER</small>
            <strong>LOOK CLOSER</strong>
          </span>
        </motion.div>

        <div className="ru-how-scroll">
          <span />
          SCROLL TO BEGIN
          <b>↓</b>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="ru-how-journey">
        <div className="ru-how-journey-heading">
          <div>
            <span>THE PROCESS</span>
            <h2>
              From seeing
              <em>to knowing.</em>
            </h2>
          </div>

          <p>
            Six moments transform an ordinary place into something worth
            remembering.
          </p>
        </div>

        <div className="ru-how-timeline">
          <div className="ru-how-timeline-line">
            <span />
          </div>

          {steps.map((step, index) => (
            <motion.article
              key={step.number}
              className="ru-how-step"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.75,
                delay: index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="ru-how-step-index">
                <span>{step.number}</span>
              </div>

              <div className="ru-how-step-main">
                <div className="ru-how-step-title">
                  <small>{step.title}</small>
                  <h3>{step.headline}</h3>
                </div>

                <div className="ru-how-step-copy">
                  <p>{step.description}</p>
                  <em>{step.detail}</em>
                </div>
              </div>

              <div className="ru-how-step-arrow">↗</div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* FINAL */}
      <section className="ru-how-final">
        <div className="ru-how-final-ring" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <span>THE BEGINNING</span>

          <h2>
            The world is
            <em>waiting.</em>
          </h2>

          <p>All you have to do is look closer.</p>

          <Link href="/enter-reality" className="ru-how-cta">
            <span>ENTER REALITY</span>
            <b>→</b>
          </Link>
        </motion.div>
      </section>

      <footer className="ru-how-footer">
        <span>REALITY UNKNOWN</span>
        <span>REAL PLACES · REAL STORIES</span>
        <Link href="/archive">THE ARCHIVE ↗</Link>
      </footer>
    </main>
  );
}
