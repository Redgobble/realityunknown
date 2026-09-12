import Image from "next/image";

export function LandingHeader() {
  return (
    <header className="ru-landing-header">
      <a
        href="/"
        className="ru-brand"
        aria-label="Reality Unknown home"
      >
        <Image
          src="/assets/applogo/reality_unknown_logo.png"
          alt="Reality Unknown"
          width={170}
          height={52}
          priority
          className="ru-brand-logo"
        />
      </a>

      <nav className="ru-landing-nav" aria-label="Primary navigation">
        <a href="/about">About</a>
        <a href="/how-it-works">How it works</a>
        <a href="/discover">Enter reality</a>
      </nav>

      <button
        type="button"
        className="ru-menu-button"
        aria-label="Open menu"
      >
        <span />
        <span />
      </button>
    </header>
  );
}
