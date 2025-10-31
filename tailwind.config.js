/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'tm-copper': '#d86c29',
        'tm-copper-dark': '#a94f1c',
        'tm-sand': '#f4d9b2',
        'tm-sand-deep': '#e1c49a',
        'tm-night': '#10121f',
        'tm-haze': '#1c2230',
        'tm-oxide': '#6f4d38',
        'tm-glow': '#f5c16c',
        'tm-teal': '#2c7da0',
      },
      fontFamily: {
        heading: ['"Rajdhani"', '"Oxanium"', 'system-ui', 'sans-serif'],
        body: ['"Barlow"', '"Titillium Web"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'tm-card': '0 18px 45px -20px rgba(216, 108, 41, 0.55)',
        'tm-glow': '0 0 0 3px rgba(245, 193, 108, 0.35)',
      },
      backgroundImage: {
        'mars-haze': 'radial-gradient(ellipse at top, rgba(44,125,160,0.22), transparent 65%), radial-gradient(ellipse at bottom, rgba(216,108,41,0.24), transparent 55%)',
        'mars-surface': "url('/mars.png')",
      },
      borderWidth: {
        3: '3px',
      },
    },
  },
  plugins: [],
}
