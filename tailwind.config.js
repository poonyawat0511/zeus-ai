const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    // your app files
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",

    // HeroUI theme (match all exported component styles)
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",

    // (optional) if you colocate MDX content
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-ibm-plex-sans-thai)", "sans-serif"],
      },
    },
  },
  plugins: [heroui()],
};
