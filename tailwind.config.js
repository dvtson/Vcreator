/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vrb: {
          red: '#E31E24',
          'red-dark': '#C41218',
          'red-light': '#FEE2E2',
          blue: '#005BAC',
          'blue-dark': '#003D73',
          'blue-deep': '#0A2540',
          'blue-light': '#EFF6FF',
          gold: '#F59E0B',
          'gold-dark': '#D97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
