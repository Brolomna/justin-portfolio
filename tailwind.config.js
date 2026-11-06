/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        porcelain: '#F8FAFC',
        mist: '#EAF2FB',
        coolgray: '#E9EDF2',
        ink: {
          DEFAULT: '#24364B',
          soft: '#35506B',
          mute: '#5A7186',
          faint: '#8CA0B3',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(36,54,75,0.05), 0 10px 28px -14px rgba(36,54,75,0.14)',
        'card-lg': '0 2px 6px rgba(36,54,75,0.06), 0 28px 56px -20px rgba(36,54,75,0.18)',
      },
    },
  },
  plugins: [],
};
