import type { Metadata } from 'next';
// Self-hosted fonts via @fontsource per the Mays Web Brand and Accessibility
// Guide. Replaces the previous render-blocking Google Fonts CDN import.
// Loading 400 + 600 weights for both display (Oswald) and body (Work Sans),
// and the 400/600 weights of Open Sans used in the header logo lockup.
import '@fontsource/oswald/400.css';
import '@fontsource/oswald/500.css';
import '@fontsource/oswald/600.css';
import '@fontsource/oswald/700.css';
import '@fontsource/work-sans/300.css';
import '@fontsource/work-sans/400.css';
import '@fontsource/work-sans/500.css';
import '@fontsource/work-sans/600.css';
import '@fontsource/work-sans/700.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import '../styles/globals.css';
import '../styles/animations.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Mays Method Lab',
  description:
    'A catalyst for Mays faculty and staff using AI to do better work, faster, in service of the students who came here for them. Mays Business School, Texas A&M University.',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/*
          Brand ribbon — TAMU > Mays Business School > Mays Method Lab
          breadcrumb format per the Brand and Accessibility Guide. Maroon
          background, white text, three-step crumb. The "↖" glyph stays as
          a decorative cue toward the parent site, aria-hidden for screen
          readers (which navigate by the link text directly).
        */}
        <nav className="brand-ribbon" aria-label="Site breadcrumb">
          <a href="https://www.tamu.edu" target="_blank" rel="noreferrer">
            <span aria-hidden="true" className="mr-1">↖</span>
            Texas A&amp;M University
          </a>
          <span aria-hidden="true" className="brand-ribbon-sep">›</span>
          <a href="https://mays.tamu.edu" target="_blank" rel="noreferrer">
            Mays Business School
          </a>
          <span aria-hidden="true" className="brand-ribbon-sep">›</span>
          <span className="brand-ribbon-current">Mays Method Lab</span>
        </nav>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
