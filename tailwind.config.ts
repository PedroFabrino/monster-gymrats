import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0B0E",
        carbon: "#13161C",
        graphite: "#1C2029",
        hairline: "#262B36",
        volt: { DEFAULT: "#95D600", 300: "#B8EB4D", 600: "#76AB00", 900: "#2A3D00" },
        ink: { DEFAULT: "#F1F3F7", muted: "#A3ABBB", faint: "#6B7385" },
        series: {
          ultra: "#00D4FF",
          ultraWhite: "#E2E8F0",
          original: "#95D600",
          juice: "#FF9F1C",
          pipeline: "#FF4D8D",
          rehab: "#FFB703",
          reserve: "#C084FC",
          java: "#D97706",
        },
        status: {
          verified: "#22C55E",
          offbrand: "#F97316",
          retro: "#38BDF8",
          unverified: "#EAB308",
          dispute: "#EF4444",
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      keyframes: {
        "sheet-up": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "pop-in": {
          "0%": { transform: "scale(0.92)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scan: { "0%": { top: "8%" }, "50%": { top: "88%" }, "100%": { top: "8%" } },
        "toast-in": {
          from: { transform: "translateY(-12px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "sheet-up": "sheet-up 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fade-in 200ms ease-out",
        "pop-in": "pop-in 240ms cubic-bezier(0.22, 1, 0.36, 1)",
        scan: "scan 1.6s ease-in-out infinite",
        "toast-in": "toast-in 220ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
