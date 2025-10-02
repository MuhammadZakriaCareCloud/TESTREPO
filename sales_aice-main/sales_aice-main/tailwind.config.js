/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        'fadeInUp': 'fadeInUp 1s ease-out both',
        'fadeInUp-delayed-1': 'fadeInUp 1s ease-out 0.2s both',
        'fadeInUp-delayed-2': 'fadeInUp 1s ease-out 0.4s both',
        'fadeInUp-delayed-3': 'fadeInUp 1s ease-out 0.6s both',
        'fadeInUp-delayed-4': 'fadeInUp 1s ease-out 0.8s both',
      },
    },
  },
  plugins: [],
}
