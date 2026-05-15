/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:   ['Figtree', 'system-ui', 'sans-serif'],
        barlow: ['"Barlow Condensed"', 'sans-serif'],
      },
      colors: {
        gaa: {
          // Legacy / senior tokens
          green:  'var(--gaa-primary)',
          gold:   'var(--gaa-accent)',
          dark:   '#1a1a1a',
          muted:  '#6b7280',
          live:   '#dc2626',
          stream: '#7c3aed',
          polled: '#d97706',
          nodata: '#6b7280',
          // Minor / purple
          minor:        '#7C3AED',
          'minor-soft': '#F3EFFE',
          // Dark UI tokens
          bg:              '#0f0f0f',
          surface:         '#1a1a1a',
          'surface-raised':'#242424',
          border:          '#2e2e2e',
          text:            '#f0f0f0',
          'text-muted':    '#888888',
          // Semantic
          amber:  '#e8a020',
          danger: '#c0392b',
          // Sport codes
          football: {
            DEFAULT: '#1A6B35',
            soft:    '#E3F2E9',
          },
          hurling: {
            DEFAULT: '#D4770A',
            soft:    '#FEF0DC',
          },
        },
      },
      fontSize: {
        base: ['1.125rem', { lineHeight: '1.75rem' }],
        lg:   ['1.25rem',  { lineHeight: '2rem'   }],
        xl:   ['1.5rem',   { lineHeight: '2.25rem'}],
      },
      spacing: { tap: '48px' },
      keyframes: {
        'score-flash': {
          '0%, 100%': { color: '#f0f0f0' },
          '30%':      { color: '#e8a020' },
          '60%':      { color: '#ffffff' },
        },
        'goal-flash': {
          '0%':   { backgroundColor: 'transparent' },
          '20%':  { backgroundColor: 'rgba(232,160,32,0.25)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        'score-flash': 'score-flash 0.6s ease-in-out',
        'goal-flash':  'goal-flash 0.8s ease-out',
      },
    },
  },
  plugins: [],
}
