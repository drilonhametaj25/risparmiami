/**
 * Registers Open Sans font with @react-pdf/renderer.
 * Must be called before any PDF rendering.
 */

import { Font } from "@react-pdf/renderer";

const OPEN_SANS_BASE =
  "https://cdn.jsdelivr.net/npm/@fontsource/open-sans@5.0.28/files";

export function registerFonts() {
  // Check if already registered
  const families: string[] = Font.getRegisteredFontFamilies?.() ?? [];
  if (families.includes("Open Sans")) return;

  try {
    Font.register({
      family: "Open Sans",
      fonts: [
        { src: `${OPEN_SANS_BASE}/open-sans-latin-400-normal.woff`, fontWeight: 400 },
        { src: `${OPEN_SANS_BASE}/open-sans-latin-600-normal.woff`, fontWeight: 600 },
        { src: `${OPEN_SANS_BASE}/open-sans-latin-700-normal.woff`, fontWeight: 700 },
        { src: `${OPEN_SANS_BASE}/open-sans-latin-400-italic.woff`, fontWeight: 400, fontStyle: "italic" },
        { src: `${OPEN_SANS_BASE}/open-sans-latin-600-italic.woff`, fontWeight: 600, fontStyle: "italic" },
      ],
    });
  } catch (error) {
    console.warn("[PDF] Font registration failed, falling back to default Helvetica:", error);
  }

  Font.registerHyphenationCallback((word: string) => [word]);
}
