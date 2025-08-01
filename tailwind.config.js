/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#121212',
          secondary: '#1e1e1e',
          accent: '#2a2a2a',
        },
        typing: {
          correct: '#4ade80',
          incorrect: '#f87171',
          current: '#ffffff',
          pending: '#6b7280',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};