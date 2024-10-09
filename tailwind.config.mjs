/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      keyframes: {
        bump: {
          "0%": { transform: "rotate(-30deg) scale(1)" },
          "50%": { transform: "rotate(-30deg) scale(1.05)" },
          "100%": { transform: "rotate(-30deg) scale(1)" },
        },
        error: {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 100 },
        },
      },
      animation: {
        bump: "bump 0.5s ease infinite",
        error: "error 0.5s forwards ease",
      },
    },
  },
  plugins: [],
};
