/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6', // Blue color
        'primary-dark': '#2563EB',
        secondary: '#10B981', // Green color
        'secondary-dark': '#059669'
      }
    },
  },
  plugins: [],
}