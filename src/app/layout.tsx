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
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Top maroon ribbon — matches mays.tamu.edu pattern */}
        <div className="brand-ribbon">
          <a href="https://www.tamu.edu" target="_blank" rel="noreferrer">
            Texas A&amp;M University
          </a>
          <span className="mx-2 opacity-50">·</span>
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
