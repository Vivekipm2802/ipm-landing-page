const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Poppins", "sans-serif"],
      anton: ["Anton", "sans-serif"],
    },
    backgroundImage: {
      "gradient-purple":
        "linear-gradient(97deg, rgba(103,29,110,1) 0%, rgba(144,44,152,1) 100%)",
    },
    extend: {
      colors: {
        /* ✅ EXISTING (unchanged) */
        primary: "#833589",
        secondary: "#f3ad00",

        /* ✅ NEW (aliases for your UI code) */
        brand: {
          900: "#060818",
          800: "#0f1225",
          gold: "#F59E0B", // same as secondary
          purple: "#833589", // same as primary
        },
      },
    },
  },
  plugins: [nextui()],
};
