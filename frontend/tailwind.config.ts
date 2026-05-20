import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#040a06',
        surface: '#080f0a',
        card: '#0c1510',
        border: '#112018',
        border2: '#1a3025',
        dim: '#1e3028',
        green: '#00e676',
        green2: '#69f0ae',
        amber: '#ffab40',
        red: '#ff5252',
        blue: '#40c4ff',
        purple: '#ea80fc',
        muted: '#4a6855',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
