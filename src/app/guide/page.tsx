import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Mays AI guide | Mays Method Lab',
  description:
    'A concise guide to the AI tools available at Mays and simple workflows to try first.',
};

export default function GuidePage() {
  return (
    <section className="section pt-16">
      <ScrollReveal>
        <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 mb-10">
          <div className="eyebrow-lg mb-3">Mays AI guide</div>
          <h1 className="mb-4 max-w-3xl">
            A concise guide to the AI tools available at Mays.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl">
            The student-built guide is the canonical version while we migrate the codebase. Read
            it on
            <a
              href="https://maysai.vercel.app/guide"
              target="_blank"
              rel="noreferrer"
              className="text-maroon ml-1 underline"
            >
              maysai.vercel.app/guide
            </a>
            , or use the shortcuts below.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid md:grid-cols-2 gap-5 max-w-4xl">
        <ShortcutTile
          title="Pick the right tool"
          blurb="The Mays-approved AI tools, by job."
          href="/tools"
        />
        <ShortcutTile
          title="Browse all prompts"
          blurb="Paste-ready prompts for the work you do every week."
          href="/prompts"
        />
        <ShortcutTile
          title="Browse agent tutorials"
          blurb="20 to 90 minute builds. End up with a tool you keep using."
          href="/agents"
        />
        <ShortcutTile
          title="Pick your role on Your AI Edge"
          blurb="Faculty or staff. Prompts, apps, tutorials, and resources curated for the work you actually do."
          href="/learning-community"
        />
      </div>

      <div className="mt-12 pt-6 border-t border-line text-center">
        <Link
          href="/learning-community"
          className="text-[14px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon"
        >
          &larr; Back to Your AI Edge
        </Link>
      </div>
    </section>
  );
}

function ShortcutTile({
  title,
  blurb,
  href,
}: {
  title: string;
  blurb: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="relative block bg-white border-2 border-maroon p-6 md:p-7 transition-colors hover:bg-maroon/5"
    >
      <span className="absolute top-4 right-4 text-maroon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <line x1="6" y1="18" x2="18" y2="6" />
          <polyline points="9,6 18,6 18,15" />
        </svg>
      </span>
      <h3 className="font-headline text-[20px] font-semibold text-maroon mb-2 leading-tight pr-8">
        {title}
      </h3>
      <p className="text-[14px] text-ink-secondary leading-relaxed">{blurb}</p>
    </Link>
  );
}
