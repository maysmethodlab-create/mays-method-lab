import type { Metadata } from 'next';
import '../styles/globals.css';
import '../styles/animations.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Mays Method Lab',
  description:
    'AI-powered tools for academic leaders. Mays Business School, Texas A&M University.',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Top maroon utility ribbon — matches mays.tamu.edu pattern.
            Left: parent-link to Texas A&M. Right: Mays Method Lab links. */}
        <div className="brand-ribbon">
          <a href="https://www.tamu.edu" target="_blank" rel="noreferrer">
            <span aria-hidden="true" className="mr-1">↖</span>
            Texas A&amp;M University
          </a>
          <span aria-hidden="true" className="opacity-40">|</span>
          <a href="https://mays.tamu.edu" target="_blank" rel="noreferrer">
            Mays Business School
          </a>
        </div>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
