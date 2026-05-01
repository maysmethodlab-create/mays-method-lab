import type { Config } from 'tailwindcss';

/**
 * Mays Method Lab palette — official Texas A&M brand colors
 * (https://marcomm.tamu.edu/creative-platform/visual-style/brand-colors/).
 *
 * The site runs on a white-dominant theme to match mays.tamu.edu, with
 * Aggie Maroon as the lone accent.
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FFFFFF',
          panel: '#FFFFFF',
          subtle: '#F5F2ED', // alternating-section off-white
          beige: '#D6D3C4',
        },
        maroon: {
          DEFAULT: '#500000', // Aggie Maroon (matches mays.tamu.edu primary)
          deep: '#3C0000', // matches mays.tamu.edu link color
          muted: '#732F2F', // matches mays.tamu.edu secondary
          glow: 'rgba(80, 0, 0, 0.15)',
        },
        ink: {
          primary: '#000000', // pure black — matches mays.tamu.edu textPrimary
          secondary: '#202020',
          muted: '#5A5A5A',
          subtle: '#A9A9A9',
          white: '#FFFFFF',
          black: '#000000',
        },
        status: {
          success: '#3D6B2E',
          warning: '#C8A415',
          error: '#BF3D3D',
        },
        line: '#E0DCD3', // soft beige-gray border
      },
      fontFamily: {
        // Mays uses Oswald for headings and Work Sans for body / paragraph.
        headline: ['Oswald', 'Arial', 'sans-serif'],
        body: ['"Work Sans"', 'Arial', 'sans-serif'],
        display: ['Oswald', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.22em',
        tightest: '-0.02em',
      },
      borderRadius: {
        // Mays uses sharp corners (0px) on inputs and buttons. We keep a tiny
        // 2px on cards just for elevation, but no soft pill styling.
        card: '2px',
        btn: '0px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0, 0, 0, 0.05), 0 1px 4px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'maroon-glow': '0 0 0 3px rgba(80, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
