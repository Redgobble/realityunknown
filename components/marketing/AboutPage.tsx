"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const chapters = [
  {
    number: "01",
    title: "SEE",
    description:
      "Begin with something ordinary. A building. A monument. A forgotten corner of the world.",
  },
  {
    number: "02",
    title: "QUESTION",
    description:
      "Ask what happened here. Who stood here. What changed, disappeared, or remained.",
  },
  {
    number: "03",
    title: "DISCOVER",
    description:
      "Reality Unknown connects the clues and turns them into a story you can experience.",
  },
];

export function AboutPage() {
  return (
    <main className="ru-about">

      {/* Ambient universe */}
      <div className="ru-about-bg" aria-hidden="true">
        <div className="ru-about-bg-image" />
        <div className="ru-about-bg-glow" />
        <div className="ru-about-grid" />
        <span className="ru-about-particle p1" />
        <span className="ru-about-particle p2" />
        <span className="ru-about-particle p3" />
        <span className="ru-about-particle p4" />
      </div>

      {/* Top navigation */}
      <header className="ru-about-nav">
        <Link href="/" className="ru-about-brand">
          <img
            src="/assets/applogo/reality_unknown_logo.png"
            alt="Reality Unknown"
          />
        </Link>

        <div className="ru-about-location">
          <span className="ru-about-location-dot" />
          <span>ABOUT / THE WORLD</span>
        </div>

        <a
          href="/how-it-works"
          className="ru-about-nav-next"
        >
          <span>HOW IT WORKS</span>
          <strong>→</strong>
        </a>

      </header>


      {/* Right chapter rail */}
      <aside className="ru-about-rail">

        <div className="ru-about-rail-line" />

        <div className="ru-about-rail-item active">
          <span>01</span>
          <i />
          <label>THE IDEA</label>
        </div>

        <div className="ru-about-rail-item">
          <span>02</span>
          <i />
          <label>THE BELIEF</label>
        </div>

        <div className="ru-about-rail-item">
          <span>03</span>
          <i />
          <label>THE JOURNEY</label>
        </div>

        <div className="ru-about-rail-item">
          <span>04</span>
          <i />
          <label>BEGIN</label>
        </div>

      </aside>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="ru-about-hero">

        <div className="ru-about-hero-orbit" />

        <motion.div
          className="ru-about-hero-content"
          initial={{ opacity: 0, y: 45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >

          <div className="ru-about-kicker">
            <span />
            01 / THE IDEA
            <span />
          </div>

          <div className="ru-about-logo-large">
            <img
              src="/assets/applogo/reality_unknown_logo.png"
              alt=""
            />
          </div>

          <h1>
            The world is
            <br />
            <em>closer than you</em>
            <br />
            think.
          </h1>

          <p className="ru-about-hero-copy">
            We walk past monuments, buildings and forgotten places
            every day. We see them. But we rarely ask what they
            remember.
          </p>

          <div className="ru-about-hero-rule">
            <span />
            <b>REAL PLACES · REAL STORIES</b>
            <span />
          </div>

        </motion.div>

        <div className="ru-about-scroll">
          <span className="ru-about-scroll-icon">↓</span>
          <span>SCROLL TO DISCOVER</span>
        </div>

      </section>


      {/* =====================================================
          THE DIFFERENCE
      ===================================================== */}

      <section className="ru-about-difference">

        <div className="ru-about-section-index">
          02 / THE DIFFERENCE
        </div>

        <div className="ru-about-difference-layout">

          <motion.div
            className="ru-about-difference-title"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9 }}
          >

            <span className="ru-about-eyebrow">
              NOT JUST INFORMATION
            </span>

            <h2>
              Wikipedia tells you
              <br />
              <em>what happened.</em>
            </h2>

            <div className="ru-about-divider" />

            <h3>
              Reality Unknown
              <br />
              <strong>lets you discover it.</strong>
            </h3>

          </motion.div>


          <motion.div
            className="ru-about-difference-visual"
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
            }}
          >

            <div className="ru-about-image-frame">

              <img
                  src="/assets/character/c14.png"
                  alt="Reality Unknown explorer"
                  className="ru-about-character-image"
                />

              <div className="ru-about-image-overlay" />

              <div className="ru-about-image-caption">
                <span>THE UNKNOWN</span>
                <strong>IS CLOSER THAN IT SEEMS</strong>
              </div>

              <div className="ru-about-image-corner">
                ↗
              </div>

            </div>

          </motion.div>

        </div>

      </section>


      {/* =====================================================
          BELIEF
      ===================================================== */}

      <section className="ru-about-belief">

        <div className="ru-about-belief-ring" />

        <motion.div
          className="ru-about-belief-content"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
        >

          <span className="ru-about-eyebrow">
            03 / WHAT WE BELIEVE
          </span>

          <h2>
            Every place
            <br />
            <em>has something</em>
            <br />
            to say.
          </h2>

          <p>
            Technology should not pull us away from the world.
            It should make us notice it differently.
          </p>

        </motion.div>

      </section>


      {/* =====================================================
          JOURNEY
      ===================================================== */}

      <section className="ru-about-journey">

        <div className="ru-about-journey-heading">

          <div>
            <span className="ru-about-eyebrow">
              04 / THE JOURNEY
            </span>

            <h2>
              Don&apos;t just
              <br />
              <em>learn it.</em>
              <br />
              Discover it.
            </h2>
          </div>

          <p>
            Your curiosity becomes the compass.
            <br />
            Every discovery moves the story forward.
          </p>

        </div>


        <div className="ru-about-chapters">

          {chapters.map((chapter, index) => (

            <motion.div
              key={chapter.number}
              className="ru-about-chapter"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
              }}
            >

              <div className="ru-about-chapter-number">
                {chapter.number}
              </div>

              <div className="ru-about-chapter-title">
                {chapter.title}
              </div>

              <p>
                {chapter.description}
              </p>

              <div className="ru-about-chapter-arrow">
                ↗
              </div>

            </motion.div>

          ))}

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="ru-about-final">

        <div className="ru-about-final-bg" />

        <motion.div
          className="ru-about-final-content"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >

          <span className="ru-about-eyebrow">
            05 / BEGIN
          </span>

          <h2>
            Look closer.
            <br />
            <em>There is more.</em>
          </h2>

          <p>
            The next story might be somewhere
            you have walked past a hundred times.
          </p>

          <a
            href="/how-it-works"
            className="ru-about-final-button"
          >
            <span>DISCOVER THE EXPERIENCE</span>
            <strong>→</strong>
          </a>

        </motion.div>

      </section>


      {/* Footer */}
      <footer className="ru-about-footer">

        <span>REALITY UNKNOWN</span>

        <span>
          REAL PLACES · REAL STORIES
        </span>
        <Link href="/">
          RETURN TO REALITY ↑
        </Link>

      </footer>

    </main>
  );
}
