'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-line">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 h-[88px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-maroon flex items-center justify-center text-white font-headline text-2xl font-normal leading-none">
            M
          </div>
          <div className="leading-tight">
            <div className="text-[11px] tracking-[0.05em] uppercase text-ink-secondary font-semibold group-hover:text-maroon transition-colors">
              Texas A&amp;M University
            </div>
            <div className="text-xl md:text-[22px] text-ink-primary font-normal font-headline leading-[1.15]">
              Mays Method Lab
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/admin">Admin Tools</NavLink>
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
      className={`relative px-4 py-3 text-[15px] font-semibold tracking-normal transition-colors ${
        active ? 'text-maroon' : 'text-ink-primary hover:text-maroon'
      }`}
    >
      {children}
      <span
        aria-hidden="true"
        className={`absolute left-4 right-4 -bottom-[1px] h-[3px] transition-all ${
          active ? 'bg-maroon' : 'bg-transparent'
        }`}
      />
    </Link>
  );
}
