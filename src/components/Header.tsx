import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-b border-line">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-md bg-maroon flex items-center justify-center text-white font-headline text-lg font-semibold leading-none">
            M
          </div>
          <div className="leading-tight">
            <div className="text-[10px] tracking-[0.22em] uppercase text-ink-muted font-semibold group-hover:text-maroon transition-colors">
              Mays Method
            </div>
            <div className="text-base font-bold text-ink-primary">Lab</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/admin">Admin Tools</NavLink>
          <NavLink href="/about">About</NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 md:px-4 py-2 text-sm font-semibold text-ink-secondary hover:text-maroon transition-colors rounded-md"
    >
      {children}
    </Link>
  );
}
