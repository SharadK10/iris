/** CSS variables hold RGB channels, so opacity modifiers (`bg-line/70`) work. */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        iris: {
          DEFAULT: token('iris'),
          soft: token('iris-soft'),
          text: token('iris-text'),
        },
        'on-iris': token('on-iris'),
        sunflower: {
          DEFAULT: token('sunflower'),
          soft: token('sunflower-soft'),
        },
        ground: token('ground'),
        paper: {
          DEFAULT: token('paper'),
          dark: token('paper-dark'),
        },
        ink: token('ink'),
        // Text-safe (AA) muted and gold; the softer muted is for decoration only.
        muted: {
          DEFAULT: token('muted-text'),
          soft: token('muted'),
        },
        gold: token('gold-text'),
        leaf: token('leaf'),
        line: token('line'),
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
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
