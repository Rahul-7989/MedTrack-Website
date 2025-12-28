
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mutedTeal: '#0D6E6A', // Deeper, more visible teal
        warmAmber: '#D97706', // More saturated amber
        softMint: '#CCFBF1',
        softIvory: '#FAF9F6',
        lightSand: '#F3F4F6',
        paleSage: '#E5E7EB',
        charcoal: '#111827', // Dark gray/black for main text
        mutedSlate: '#374151', // Darker gray for secondary text
        softAsh: '#4B5563', // Darker ash for labels
        careRose: '#DC2626' // Stronger red for alerts
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
