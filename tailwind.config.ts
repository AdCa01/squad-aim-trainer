import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0e14",
        "bg-light": "#1a1f2e",
        accent: "#3b82f6",
        "accent-hover": "#60a5fa",
      },
      fontFamily: {
        display: ["Oswald", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
