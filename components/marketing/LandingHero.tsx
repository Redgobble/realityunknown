"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const journey = [
  { number: "01", label: "SEE", icon: "◉" },
  { number: "02", label: "UNDERSTAND", icon: "✦" },
  { number: "03", label: "EXPLORE", icon: "◇" },
  { number: "04", label: "DISCOVER", icon: "▤" },
  { number: "05", label: "EXPERIENCE", icon: "☆" },
  { number: "06", label: "REMEMBER", icon: "♜" },
];

export function LandingHero() {
  return (
    <main className="ru-home">
      {/* ATMOSPHERIC LAYERS */}
      <div className="ru-home-bg" />
      <div className="ru-home-color" />
      <div className="ru-home-vignette" />
      <div className="ru-home-grain" />

      {/* ANIMATED LIGHT */}
      <motion.div
        className="ru-home-light"
        animate={{
          x: [-20, 30, -20],
          y: [-10, 20, -10],
          opacity: [0.45, 0.7, 0.45],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* FLOATING PARTICLES */}
      <div className="ru-home-particles">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* TOP NAV */}
      <header className="ru-home-header">
        <Link href="/" className="ru-home-brand">
          <Image
            src="/assets/applogo/reality_unknown_logo.png"
            alt="Reality Unknown"
            width={180}
            height={70}
            priority
          />
        </Link>

        <nav className="ru-home-nav">
          <Link href="/about">ABOUT</Link>
          <Link href="/how-it-works">HOW IT WORKS</Link>

          <Link
            href="/archive"
            className="ru-home-nav-link"
          >
            THE ARCHIVE
          </Link>

          <button
            type="button"
            className="ru-home-menu"
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      {/* RIGHT JOURNEY NAVIGATION */}
      <aside className="ru-home-journey">
        <div className="ru-home-journey-line" />

        {journey.map((item, index) => (
          <motion.div
            key={item.number}
            className="ru-home-journey-item"
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.8 + index * 0.1,
              duration: 0.5,
            }}
          >
            <div className="ru-home-journey-dot">
              {item.icon}
            </div>

            <span className="ru-home-journey-label">
              {item.label}
            </span>
          </motion.div>
        ))}
      </aside>

      {/* MAIN HERO */}
      <section className="ru-home-hero">
        <motion.div
          className="ru-home-center"
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {/* LARGE CENTER LOGO */}
          <motion.div
            className="ru-home-center-logo"
            initial={{
              opacity: 0,
              scale: 0.88,
              filter: "blur(8px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
            }}
            transition={{
              delay: 0.15,
              duration: 1.1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="ru-home-logo-glow" />

            <Image
              src="/assets/applogo/reality_unknown_logo.png"
              alt="Reality Unknown"
              width={420}
              height={150}
              priority
              className="ru-home-main-logo"
            />
          </motion.div>

          {/* EYEBROW */}
          <motion.div
            className="ru-home-eyebrow"
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.5,
              duration: 0.7,
            }}
          >
            <span />
            THE UNKNOWN WORLD
            <span />
          </motion.div>

          {/* TITLE */}
          <motion.h1
            className="ru-home-title"
            initial={{
              opacity: 0,
              y: 28,
              filter: "blur(6px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            transition={{
              delay: 0.62,
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            Every place
            <br />
            <em>has a story.</em>
          </motion.h1>

          {/* GOLD DIVIDER */}
          <motion.div
            className="ru-home-divider"
            initial={{
              width: 0,
              opacity: 0,
            }}
            animate={{
              width: 150,
              opacity: 1,
            }}
            transition={{
              delay: 0.95,
              duration: 0.7,
            }}
          />

          {/* DESCRIPTION */}
          <motion.div
            className="ru-home-copy"
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 1.05,
              duration: 0.8,
            }}
          >
            <p className="ru-home-description">
              Point your camera at the world around you.
              Discover what happened there.
            </p>

            <p className="ru-home-description-secondary">
              Every monument, building and forgotten corner
              holds a story waiting to be uncovered.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 1.18,
              duration: 0.7,
            }}
          >
            <Link
              href="/enter-reality"
              className="ru-home-cta"
            >
              <span>ENTER REALITY</span>
              <span className="ru-home-cta-arrow">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* BOTTOM LEFT */}
      <div className="ru-home-bottom-left">
        <span>REAL PLACES</span>
        <span>REAL STORIES</span>
      </div>

      {/* BOTTOM RIGHT */}
      <div className="ru-home-bottom-right">
        <span>A MORE</span>
        <span>CURIOUS YOU</span>
      </div>

      {/* SCROLL */}
      <motion.div
        className="ru-home-scroll"
        animate={{
          y: [0, 7, 0],
          opacity: [0.4, 0.9, 0.4],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="ru-home-scroll-mouse">
          <span />
        </div>

        <span>SCROLL TO BEGIN</span>
        <b>↓</b>
      </motion.div>
    </main>
  );
}
