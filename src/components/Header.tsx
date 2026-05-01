import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-black/40 border-b border-line">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-[68px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-md bg-maroon flex items-center justify-center text-ink-primary font-headline text-base font-bold">
            M
          </div>
          <div className="leading-tight">
            <div className="text-[11px] tracking-[0.25em] uppercase text-ink-secondary group-hover:text-ink-primary transition-colors">
              Mays Method
            </div>
            <div className="text-sm font-semibold text-ink-primary">Lab</div>
          </div>
        </Link>

        <nav className="flex items-center gap-2 md:gap-1">
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
      className="px-3 md:px-4 py-2 text-sm tracking-wide text-ink-secondary hover:text-ink-primary transition-colors rounded-md hover:bg-white/5"
    >
      {children}
    </Link>
  );
}
