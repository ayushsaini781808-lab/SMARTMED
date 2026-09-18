/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
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
          50: '#f4f6f6', 100: '#e3e8e7', 400: '#5c6e6c', 700: '#293937', 900: '#152220'
        }
      },
      boxShadow: {
        card: '0 1px 2px rgba(12,40,37,0.06), 0 4px 16px rgba(12,40,37,0.06)'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
};
