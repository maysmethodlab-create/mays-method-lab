'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-line">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 h-[88px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          {/* Official TAMU "ATM" mark — same SVG mays.tamu.edu uses in
              their header and the file we ship as /favicon.svg. */}
          <img
            src="/favicon.svg"
            alt="Texas A&M University"
            width={48}
            height={48}
            className="w-12 h-12"
          />
          <div className="leading-tight font-brand">
            <div className="text-[16px] tracking-[0.05em] uppercase text-ink-secondary font-semibold group-hover:text-maroon transition-colors">
              Mays Business School
            </div>
            <div className="text-xl md:text-[22px] text-ink-primary font-normal leading-[1.15] mt-0.5">
              Mays Method Lab
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-0">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/learning-community">Your AI Edge</NavLink>
          <NavLink href="/admin">Apps for Administrators</NavLink>
          <NavLink href="/about">About</NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  // Active when exact match or, for non-root paths, when the pathname starts
  // with the href segment.
  const active =
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={`relative px-3 py-3 text-[16px] font-semibold tracking-normal transition-colors ${
        active ? 'text-maroon' : 'text-ink-primary hover:text-maroon'
      }`}
    >
      {children}
      <span
        aria-hidden="true"
        className={`absolute left-3 right-3 -bottom-[1px] h-[3px] transition-all ${
          active ? 'bg-maroon' : 'bg-transparent'
        }`}
      />
    </Link>
  );
}
