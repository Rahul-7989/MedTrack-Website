
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mutedTeal: '#2F8F8B',
        warmAmber: '#F2A65A',
        softMint: '#A8DADC',
        softIvory: '#FAF9F6',
        lightSand: '#F1F3F2',
        paleSage: '#EDF3F1',
        charcoal: '#2B2E34',
        mutedSlate: '#6B7280',
        softAsh: '#8A8F98',
        careRose: '#F87171'
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2.5rem',
        '5xl': '3.5rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px) rotate(-45deg)' },
          '50%': { transform: 'translateY(-15px) rotate(-42deg)' },
          '100%': { transform: 'translateY(0px) rotate(-45deg)' },
        }
      }
    },
  },
  plugins: [],
}
