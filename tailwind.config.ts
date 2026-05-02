import type { Config } from 'tailwindcss';

/**
 * Mays Method Lab palette — calibrated to mays.tamu.edu (computed-CSS verified).
 *
 * Mays runs Aggie Maroon `#500000` as the primary brand color, `#3C0000` as the
 * deep / hover variant, and `#732F2F` (the maroon-muted shade) as the
 * superhead / dotted-frame / muted-border accent. Body copy is `#000000` for
 * headings and `#3E3E3E` (their actual subhead gray) for paragraph text.
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FFFFFF',
          panel: '#FFFFFF',
          subtle: '#EAEAEA', // matches mays.tamu.edu footer gray-100
          beige: '#D6D3C4',
        },
        maroon: {
          DEFAULT: '#500000', // Aggie Maroon (matches mays.tamu.edu primary)
          deep: '#3C0000', // matches mays.tamu.edu link / btn border / hover
          muted: '#732F2F', // mays.tamu.edu superhead + dotted-frame outline
          glow: 'rgba(80, 0, 0, 0.15)',
        },
        ink: {
          primary: '#000000', // Mays headings & strong text
          secondary: '#3E3E3E', // mays.tamu.edu paragraph / subhead gray
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
        line: '#D1D1D1', // mays.tamu.edu divider-dots gray-300
        // Google brand colors — used only by the inline G logo on the
        // Sign in with TAMU Google button. These are Google's required
        // marks per their branding guidelines and cannot be re-themed.
        google: {
          blue: '#4285F4',
          green: '#34A853',
          yellow: '#FBBC05',
          red: '#EA4335',
        },
      },
      fontFamily: {
        // Mays uses Oswald for headings and Work Sans for body.
        headline: ['Oswald', 'Arial', 'sans-serif'],
        body: ['"Work Sans"', 'Arial', 'sans-serif'],
        display: ['Oswald', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.05em',
        tightest: '-0.02em',
      },
      borderRadius: {
        // Mays uses sharp corners (0px) on all primary surfaces — buttons,
        // inputs, cards. Only the linked-card outer wrapper has a 12px radius
        // and we don't replicate that pattern.
        card: '0px',
        btn: '0px',
      },
      boxShadow: {
        // Mays does not use drop shadows on cards — accents come from the
        // dotted-frame outline + thin maroon borders. Keep the focus ring.
        card: 'none',
        'card-hover': 'none',
        'maroon-glow': '0 0 0 3px rgba(80, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
