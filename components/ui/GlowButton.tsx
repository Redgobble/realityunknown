import Link from "next/link";
import type { ReactNode } from "react";

type GlowButtonProps = {
  children: ReactNode;
  variant?: "primary" | "ghost";
  href?: string;
  className?: string;
};

export function GlowButton({
  children,
  variant = "primary",
  href = "/discover",
  className = "",
}: GlowButtonProps) {
  return (
    <Link
      href={href}
      className={`ru-button ru-button-${variant} ${className}`}
    >
      <span
        className="ru-button-shine"
        aria-hidden="true"
      />

      <span className="ru-button-label">
        {children}
      </span>

      <span
        className="ru-button-arrow"
        aria-hidden="true"
      >
        →
      </span>
    </Link>
  );
}
