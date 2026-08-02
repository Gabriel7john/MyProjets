/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#141210",
          900: "#1B1815",
          800: "#242019",
          700: "#332C22",
        },
        bone: {
          100: "#F7F1E4",
          200: "#EDE2CB",
        },
        brass: {
          400: "#C9A25B",
          500: "#B08D46",
          600: "#8F7038",
        },
        barber: {
          red: "#A3372E",
          redDark: "#7C271F",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "barber-stripe":
          "repeating-linear-gradient(135deg, var(--stripe-a) 0px, var(--stripe-a) 14px, var(--stripe-b) 14px, var(--stripe-b) 28px, var(--stripe-c) 28px, var(--stripe-c) 42px)",
      },
    },
  },
  plugins: [],
};
