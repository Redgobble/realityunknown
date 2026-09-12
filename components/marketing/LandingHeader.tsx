"use client";

import Link from "next/link";

export default function LandingHeader() {
  return (
    <header className="ru-landing-header">
      <div className="ru-landing-header-inner">
        <Link href="/" className="ru-landing-brand">
          REALITY UNKNOWN
        </Link>

        <nav className="ru-landing-nav">
          <Link href="/about">About</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/discover">Enter reality</Link>
        </nav>
      </div>
    </header>
  );
}
