'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/about', label: 'About' },
  { href: '/about/student-fellows', label: 'AI Student Fellows' },
  { href: '/about/learning-community', label: 'AI Learning Community' },
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
            className={`px-5 py-3 text-[15px] font-semibold tracking-normal border-b-[3px] -mb-px transition-colors ${
              active
                ? 'border-maroon text-maroon'
                : 'border-transparent text-ink-secondary hover:text-maroon'
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
