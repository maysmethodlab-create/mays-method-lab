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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
