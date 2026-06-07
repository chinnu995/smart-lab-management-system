/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#2563EB', 50:'#EFF6FF', 600:'#2563EB', 700:'#1D4ED8' },
        secondary: { DEFAULT: '#14B8A6' },
      },
      backgroundColor: { app: '#F8FAFC' },
      boxShadow: { glass: '0 8px 32px rgba(31,38,135,0.15)' },
    }
  },
  plugins: []
};
