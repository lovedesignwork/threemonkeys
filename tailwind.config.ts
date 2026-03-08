import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#b1b94c',
          dark: '#8a9239',
          light: '#c5cd6f',
        },
        accent: {
          DEFAULT: '#b1b94c',
          dark: '#8a9239',
          light: '#c5cd6f',
        },
        background: {
          DEFAULT: '#ffffff',
          dark: '#f5f5f5',
          light: '#fafafa',
        },
        foreground: {
          DEFAULT: '#000000',
          muted: '#4a4a4a',
        },
      },
      fontFamily: {
        'krona': ['var(--font-krona)', 'sans-serif'],
        'google-sans': ['var(--font-google-sans)', 'sans-serif'],
        oswald: ['var(--font-oswald)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
