/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        iris: {
          DEFAULT: 'var(--iris)',
          soft: 'var(--iris-soft)',
        },
        sunflower: {
          DEFAULT: 'var(--sunflower)',
          soft: 'var(--sunflower-soft)',
        },
        ground: 'var(--ground)',
        paper: {
          DEFAULT: 'var(--paper)',
          dark: 'var(--paper-dark)',
        },
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      maxWidth: {
        canvas: '820px',
      },
      borderRadius: {
        bloom: '12px',
        canvas: '24px',
      },
      boxShadow: {
        paper:
          '0 1px 2px rgba(60, 50, 30, 0.04), 0 24px 60px -28px rgba(60, 50, 30, 0.22)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
}
