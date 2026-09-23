/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif']
      },
      colors: {
        teal: {
          50: '#eef6f5', 100: '#d3e9e6', 200: '#a7d3cd', 300: '#79bcb2',
          400: '#4a9f92', 500: '#2c7f74', 600: '#1f6459', 700: '#175048',
          800: '#123b36', 900: '#0c2825'
        },
        amber: {
          50: '#fef8ee', 100: '#fdecd0', 200: '#fbd79f', 300: '#f8bd6b',
          400: '#f3a23f', 500: '#e8862a', 600: '#c76a1e', 700: '#9c4f18'
        },
        ink: {
          50: '#f7f7f8', 100: '#e5e5e5', 200: '#d4d4d4', 300: '#a3a3a3',
          400: '#737373', 500: '#525252', 600: '#404040', 700: '#262626',
          800: '#1a1a1a', 900: '#171717'
        }
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)'
      },
      borderRadius: {
        xl2: '1rem'
      }
    }
  },
  plugins: []
};
