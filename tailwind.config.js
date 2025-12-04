/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'seka-gold': '#D4AF37',
        'seka-darker': '#0D0D0D',
        'seka-dark': '#1A1A1A',
        'seka-card': '#1A1A1A',
        'seka-border': '#2A2A2A',
        'seka-text': '#FFFFFF',
        'seka-text-secondary': '#B0B0B0',
        'seka-text-muted': '#707070',
        'seka-green': '#10B981',
        'seka-red': '#EF4444',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
