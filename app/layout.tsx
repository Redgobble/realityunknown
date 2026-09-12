import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Manrope,
} from "next/font/google";
import "./globals.css";

const cormorant =
  Cormorant_Garamond({
    variable: "--font-cormorant",
    subsets: ["latin"],
    display: "swap",
    weight: [
      "400",
      "500",
      "600",
      "700",
    ],
  });

const manrope =
  Manrope({
    variable: "--font-manrope",
    subsets: ["latin"],
    display: "swap",
    weight: [
      "400",
      "500",
      "600",
      "700",
      "800",
    ],
  });

export const metadata: Metadata = {
  title: "Reality Unknown",
  description:
    "Every place has a story.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${manrope.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
