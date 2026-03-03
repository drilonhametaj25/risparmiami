import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#FAFAF8",
        "bg-secondary": "#F2F0EC",
        "bg-dark": "#1A1A1A",
        "text-primary": "#1A1A1A",
        "text-secondary": "#6B6B6B",
        "text-muted": "#9B9B9B",
        "accent-primary": "#0066FF",
        "accent-success": "#00A86B",
        "accent-warning": "#F5A623",
        "accent-danger": "#E53E3E",
        "border-light": "rgba(0,0,0,0.06)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Consolas", "monospace"],
      },
      fontSize: {
        display: [
          "3rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        h1: ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        h2: ["1.75rem", { lineHeight: "1.3" }],
        h3: ["1.25rem", { lineHeight: "1.4" }],
        body: ["1rem", { lineHeight: "1.6" }],
        small: ["0.875rem", { lineHeight: "1.5" }],
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.04)",
        md: "0 4px 12px rgba(0,0,0,0.06)",
        lg: "0 12px 40px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      maxWidth: {
        content: "1200px",
      },
      spacing: {
        "section-y": "5rem",
        "section-x-mobile": "1.5rem",
        "section-x-desktop": "5rem",
      },
      transitionDuration: {
        "300": "300ms",
        "500": "500ms",
      },
      keyframes: {
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "count-up": "count-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
};
export default config;
