import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TripCraft Design System
        ocean:   '#0D2B45',
        deep:    '#071825',
        tide:    '#143352',
        terra: {
          DEFAULT: '#C4603A',
          lt:      '#D97A56',
        },
        gold: {
          DEFAULT: '#C9A84C',
          lt:      '#E2C06A',
        },
        foam:    '#EEF4F8',
        mist:    '#D6E4EE',
        ink:     '#0A1F30',
        slate:   '#5B7A8E',
        surface: '#F4F8FB',
        success: '#2E7D4F',
        caution: '#9D4E1F',
        danger:  '#C04040',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:  ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-dm-mono)', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config
