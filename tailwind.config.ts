import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emotion: {
          happy: '#FFD700',
          sad: '#4A90E2',
          angry: '#FF6B6B',
          fearful: '#9B59B6',
          surprised: '#F39C12',
          disgusted: '#27AE60',
        }
      },
      keyframes: {
        'wheel-spin': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'wheel-spin': 'wheel-spin 20s linear infinite'
      }
    },
  },
  plugins: [],
} satisfies Config
