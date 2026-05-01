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
          subtle: '#F7F5F0', // beige-tinted off-white for alternating sections
          beige: '#D6D3C4',
        },
        maroon: {
          DEFAULT: '#500000', // Aggie Maroon
          deep: '#3C0000',
          muted: '#732F2F',
          glow: 'rgba(80, 0, 0, 0.15)',
        },
        ink: {
          primary: '#202020', // dark gray — body & headings
          secondary: '#3E3E3E',
          muted: '#707070',
          subtle: '#D1D1D1',
          white: '#FFFFFF',
          black: '#000000',
        },
        status: {
          success: '#3D6B2E',
          warning: '#C8A415',
          error: '#BF3D3D',
        },
        line: '#E5E0D5', // soft beige-gray border
      },
      fontFamily: {
        headline: ['Oswald', 'Tungsten', 'sans-serif'],
        body: ['"Open Sans"', 'Helvetica Neue', 'sans-serif'],
        display: ['"Work Sans"', '"Open Sans"', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.25em',
        tightest: '-0.04em',
      },
      borderRadius: {
        card: '8px',
        btn: '6px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(80, 0, 0, 0.08)',
        'maroon-glow': '0 4px 14px rgba(80, 0, 0, 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
