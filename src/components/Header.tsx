import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-line">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 h-[76px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-maroon flex items-center justify-center text-white font-headline text-lg font-semibold leading-none uppercase tracking-tight">
            M
          </div>
          <div className="leading-tight">
            <div className="text-[10px] tracking-[0.22em] uppercase text-ink-muted font-bold group-hover:text-maroon transition-colors">
              Mays Method
            </div>
            <div className="text-base font-bold text-ink-primary uppercase tracking-tight">
              Lab
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
  return (
    <Link
      href={href}
      className="px-4 py-2 text-[13px] font-bold uppercase tracking-[0.08em] text-ink-secondary hover:text-maroon transition-colors"
    >
      {children}
    </Link>
  );
}
