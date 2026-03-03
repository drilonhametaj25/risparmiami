import { Instrument_Serif, JetBrains_Mono, Inter } from "next/font/google";

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-heading",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

// Using Inter as body font (Google Fonts) until Satoshi woff2 files are added
// Satoshi is the target font - download from https://www.fontshare.com/fonts/satoshi
export const bodyFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});
