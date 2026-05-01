import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Mays Method Lab dark TAMU palette
        bg: {
          DEFAULT: '#050505',
          panel: '#141414',
          elevated: '#0a0a0a',
        },
        maroon: {
          DEFAULT: '#500000', // Aggie Maroon
          hover: '#8C2633',
          glow: 'rgba(80, 0, 0, 0.4)',
        },
        ink: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          muted: '#71717A',
          white: '#FFFFFF',
        },
        status: {
          success: '#3D6B2E',
          warning: '#C8A415',
          error: '#BF3D3D',
        },
        line: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        headline: ['Tungsten', 'Oswald', 'sans-serif'],
        body: ['Inter', 'Helvetica Neue', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.25em',
        tightest: '-0.04em',
      },
      borderRadius: {
        card: '12px',
        btn: '10px',
      },
      boxShadow: {
        'maroon-glow': '0 0 24px rgba(80, 0, 0, 0.4)',
        'maroon-card': '0 0 30px rgba(80, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
