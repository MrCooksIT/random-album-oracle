/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'auth-screen',
    'crt-scanlines',
    'crt-flicker',
    'auth-input',
    'auth-button'
  ]
}