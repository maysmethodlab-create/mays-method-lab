'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/about', label: 'About' },
  { href: '/about/student-fellows', label: 'AI Student Fellows' },
];

export default function AboutNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-1 mb-10 border-b border-line">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-3 text-xs uppercase tracking-[0.2em] font-semibold border-b-2 -mb-px transition-colors ${
              active
                ? 'border-maroon text-maroon'
                : 'border-transparent text-ink-muted hover:text-ink-primary'
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
