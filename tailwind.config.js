/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        zorofy: {
          bg: "#050807",
          surface: "#0A100D",
          card: "#101A14",
          elevated: "#14231A",
          green: "#00E676",
          bright: "#39FF88",
          deep: "#008F52",
          text: "#F5F7F5",
          muted: "#A0AAA3",
          border: "rgba(0, 230, 118, 0.15)",
        },
      },
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
    },
  },
  plugins: [],
}
