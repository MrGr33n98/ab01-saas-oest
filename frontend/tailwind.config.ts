import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F4F7F5",
        surface: "#FFFFFF",
        "surface-soft": "#F8FAF9",
        text: "#0B1413",
        "text-muted": "#66716E",
        border: "#DCE3E0",
        "border-strong": "#AAB5B1",
        accent: "#B6FF55",
        "accent-ink": "#10170D",
        danger: "#DC2626",
        warning: "#D97706",
        success: "#059669",
        oest: {
          blue: "#2A57B8",
          "blue-dark": "#1E4294",
          "blue-light": "#3A6DE0",
          green: "#1A9E60",
          "green-hover": "#158752",
          yellow: "#F8C623",
          ice: "#CAD7F6",
          "ice-light": "#EEF3FD",
          ink: "#111820",
          navy: "#0D192E",
          "navy-surface": "#14223C",
          "navy-border": "#213454",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "8px",
        input: "6px",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem",
      },
      fontSize: {
        display: ["3rem", { lineHeight: "0.98", letterSpacing: "-0.03em" }],
        "display-lg": ["4.25rem", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        "display-hero": ["5.25rem", { lineHeight: "0.92", letterSpacing: "-0.045em" }],
      },
      letterSpacing: {
        "tight-headline": "-0.04em",
        "tighter-headline": "-0.045em",
        eyebrow: "0.12em",
      },
      lineHeight: {
        tightest: "0.92",
        tighter: "0.96",
        compact: "1.02",
      },
    },
  },
  plugins: [],
};

export default config;
