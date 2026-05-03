/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gaa: {
          green:  '#006633',
          gold:   '#FFD700',
          dark:   '#1a1a1a',
          muted:  '#6b7280',
          live:   '#dc2626',
          stream: '#7c3aed',
          polled: '#d97706',
          nodata: '#6b7280',
        },
      },
      fontSize: {
        base: ['1.125rem', { lineHeight: '1.75rem' }],
        lg:   ['1.25rem',  { lineHeight: '2rem'   }],
        xl:   ['1.5rem',   { lineHeight: '2.25rem'}],
      },
      spacing: { tap: '48px' },
    },
  },
  plugins: [],
}
