/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        amber: { primary: '#f4a017', light: '#f7b84b', dark: '#d4880a' },
        green: { juice: '#22c55e', dark: '#16a34a', forest: '#14532d' },
        dark: { 900: '#0f1f0f', 800: '#162416', 700: '#1e3020', 600: '#2a3d2a', 500: '#3a4f3a' },
        cream: { DEFAULT: '#fff5e6', 100: '#fffbf5', 200: '#fff0d0' },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        logo: ['Pacifico', 'cursive'],
        heading: ['Poppins', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
