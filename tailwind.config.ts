import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "sans-serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "monospace"],
      },
      colors: {
        paper: {
          base: "var(--paper-base)",
          sheet: "var(--paper-sheet)",
          interactive: "var(--paper-interactive)",
        },
        ink: {
          primary: "var(--ink-primary)",
          secondary: "var(--ink-secondary)",
          muted: "var(--ink-muted)",
        },
        rule: {
          hairline: "var(--rule-hairline)",
        },
        accent: {
          primary: "var(--accent-primary)",
        },
        status: {
          deficit: "var(--status-deficit)",
          caution: "var(--status-caution)",
        },
      },
      transitionTimingFunction: {
        "ledger-out": "cubic-bezier(0.22, 1, 0.36, 1)",
        "ledger-pin": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        "180": "180ms",
        "220": "220ms",
      },
    },
  },
  plugins: [],
};

export default config;
