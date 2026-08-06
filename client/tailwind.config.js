/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        parchment: 'var(--color-parchment)',
        mycelium: 'var(--color-mycelium)',
        loam: 'var(--color-loam)',
        moss: {
          DEFAULT: 'var(--color-moss)',
          deep: 'var(--color-moss-deep)',
        },
        kraft: {
          DEFAULT: 'var(--color-kraft)',
          deep: 'var(--color-kraft-deep)',
        },
        rust: {
          DEFAULT: 'var(--color-rust)',
          deep: 'var(--color-rust-deep)',
        },
      },
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
