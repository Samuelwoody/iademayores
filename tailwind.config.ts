import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f3ead5",
        ink: "#3a2a1a",
        sepia: "#a8794a",
        cream: "#faf3e0",
        rust: "#9c4a2c",
      },
      fontFamily: {
        serif: ['"Crimson Pro"', '"Georgia"', "serif"],
        hand: ['"Caveat"', "cursive"],
      },
      boxShadow: {
        soft: "0 2px 0 rgba(58, 42, 26, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
