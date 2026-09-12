"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const archiveItems = [
  {
    number: "01",
    category: "PLACE",
    title: "THE UNKNOWN WORLD",
    description:
      "Every landscape carries traces of what came before. Discover the places waiting beneath the surface.",
    image: "/assets/character/c13.png",
  },
  {
    number: "02",
    category: "CHARACTER",
    title: "THE TRAVELERS",
    description:
      "Meet the figures connected to the stories hidden across the world.",
    image: "/assets/character/c14.png",
  },
  {
    number: "03",
    category: "STORY",
    title: "FORGOTTEN STORIES",
    description:
      "Events, legends and fragments of history become clues to something larger.",
    image: "/assets/character/c12.png",
  },
];

export function ArchivePage() {
  return (
    <main className="ru-archive-page">

      {/* BACKGROUND ATMOSPHERE */}
      <div className="ru-archive-atmosphere" aria-hidden="true">
        <div className="ru-archive-bg" />
        <div className="ru-archive-vignette" />

        <span className="ru-archive-star ru-archive-star-1" />
        <span className="ru-archive-star ru-archive-star-2" />
        <span className="ru-archive-star ru-archive-star-3" />
        <span className="ru-archive-star ru-archive-star-4" />
      </div>

      {/* NAVIGATION */}
      <header className="ru-archive-nav">

        <Link href="/" className="ru-archive-brand">
          <Image
            src="/assets/applogo/reality_unknown_logo.png"
            alt="Reality Unknown"
            width={150}
            height={100}
            priority
          />
        </Link>

        <div className="ru-archive-nav-title">
          THE ARCHIVE
        </div>

        <nav>
          <Link href="/about">ABOUT</Link>
          <Link href="/how-it-works">HOW IT WORKS</Link>
          <Link href="/enter-reality">
            ENTER REALITY <span>→</span>
          </Link>
        </nav>

      </header>

      {/* HERO */}
      <section className="ru-archive-hero">

        <motion.div
          className="ru-archive-hero-content"
          initial={{ opacity: 0, y: 45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >

          <div className="ru-archive-eyebrow">
            <span />
            03 / THE ARCHIVE
            <span />
          </div>

          <h1>
            Stories the
            <em>world</em>
            remembers.
          </h1>

          <p>
            Places, people and moments preserved inside Reality Unknown.
            Every discovery becomes another fragment of the world&apos;s memory.
          </p>

          <div className="ru-archive-hero-meta">
            <span>REAL PLACES</span>
            <i />
            <span>REAL STORIES</span>
            <i />
            <span>UNKNOWN MEMORIES</span>
          </div>

        </motion.div>

        <div className="ru-archive-scroll">
          <span className="ru-archive-scroll-line" />
          EXPLORE THE ARCHIVE
        </div>

      </section>

      {/* FEATURED ARCHIVE */}
      <section className="ru-archive-feature">

        <div className="ru-archive-feature-label">
          <span>THE FIRST DISCOVERY</span>
          <small>ARCHIVE / 001</small>
        </div>

        <motion.div
          className="ru-archive-feature-frame"
          initial={{ opacity: 0, scale: .97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: .2 }}
          transition={{ duration: 1 }}
        >

          <Image
            src="/assets/backgrounds/hub-bg.png"
            alt="The unknown world"
            fill
            sizes="(max-width: 900px) 100vw, 80vw"
            className="ru-archive-feature-image"
          />

          <div className="ru-archive-feature-overlay" />

          <div className="ru-archive-feature-corner">
            ↗
          </div>

          <div className="ru-archive-feature-copy">

            <span>THE UNKNOWN WORLD</span>

            <h2>
              A place can
              <em>remember.</em>
            </h2>

            <p>
              The first rule of discovery is simple:
              look closer than everyone else.
            </p>

            <div className="ru-archive-feature-footer">
              <span>ARCHIVE 001</span>
              <span>DISCOVERED</span>
              <span>↗</span>
            </div>

          </div>

        </motion.div>

      </section>

      {/* ARCHIVE CATEGORIES */}
      <section className="ru-archive-categories">

        <div className="ru-archive-category-heading">

          <span className="ru-archive-section-label">
            THE COLLECTION
          </span>

          <h2>
            Nothing
            <em>is ordinary.</em>
          </h2>

          <p>
            Browse the fragments collected throughout the journey.
          </p>

        </div>

        <div className="ru-archive-list">

          {archiveItems.map((item, index) => (

            <motion.article
              className="ru-archive-item"
              key={item.number}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{
                once: true,
                amount: .2,
              }}
              transition={{
                duration: .7,
                delay: index * .08,
              }}
            >

              <div className="ru-archive-item-number">
                {item.number}
              </div>

              <div
                  className={`ru-archive-item-image ${
                    item.category === "CHARACTER"
                      ? "ru-archive-character-image"
                      : ""
                  }`}
                >

                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="280px"
                />

                <div />

              </div>

              <div className="ru-archive-item-main">

                <span>{item.category}</span>

                <h3>{item.title}</h3>

              </div>

              <div className="ru-archive-item-copy">

                <p>{item.description}</p>

              </div>

              <div className="ru-archive-item-arrow">
                ↗
              </div>

            </motion.article>

          ))}

        </div>

      </section>

      {/* FINAL CTA */}
      <section className="ru-archive-final">

        <div className="ru-archive-final-orbit" />

        <span className="ru-archive-section-label">
          YOUR DISCOVERY AWAITS
        </span>

        <h2>
          The archive
          <em>isn&apos;t finished.</em>
        </h2>

        <p>
          There are stories that haven&apos;t been discovered yet.
        </p>

        <Link
          href="/enter-reality"
          className="ru-archive-cta"
        >
          <span>ENTER REALITY</span>
          <b>→</b>
        </Link>

      </section>

      {/* FOOTER */}
      <footer className="ru-archive-footer">

        <span>REALITY UNKNOWN</span>

        <span>
          REAL PLACES · REAL STORIES
        </span>

        <Link href="/">
          RETURN TO REALITY ↗
        </Link>

      </footer>

    </main>
  );
}
