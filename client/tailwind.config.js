/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#222832",
        secondary: "#393E46",
        primary: "#00ADB5",
        "primary-dark": "#008B92",
        accent: "#00FFF5",
      },
    },
  },
  plugins: [],
}

