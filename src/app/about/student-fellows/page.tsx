import ScrollReveal from '../../../components/ScrollReveal';
import AboutNav from '../../../components/AboutNav';
import { STUDENT_FELLOWS } from '../../../lib/student-fellows';

export const metadata = {
  title: 'AI Student Fellows — Mays Method Lab',
  description:
    'AI Student Fellows of the Mays Method Lab at Mays Business School, Texas A&M University.',
};

export default function StudentFellowsPage() {
  return (
    <section className="section pt-16">
      <AboutNav />

      <ScrollReveal>
        <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 mb-12">
          <div className="eyebrow-lg mb-3">AI Student Fellows</div>
          <h1 className="mb-6 max-w-3xl">Student fellows of the Lab.</h1>
          <p className="text-[16px] text-ink-secondary leading-relaxed max-w-3xl">
            Texas A&amp;M students working alongside the Lab on AI-powered tools, research, and
            shipped product.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {STUDENT_FELLOWS.map((f) => (
          <ScrollReveal key={f.name}>
            <FellowCard fellow={f} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

function FellowCard({ fellow }: { fellow: (typeof STUDENT_FELLOWS)[number] }) {
  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-start gap-4 mb-4">
        {fellow.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fellow.imageUrl}
            alt={fellow.name}
            className="w-16 h-16 rounded-full object-cover border border-line"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-bg-subtle border border-line flex items-center justify-center font-headline text-2xl text-maroon font-normal">
            {fellow.name
              .split(' ')
              .map((p) => p[0])
              .filter(Boolean)
              .slice(0, 2)
              .join('')}
          </div>
        )}
        <div>
          <div className="eyebrow text-[12px] mb-1">AI Student Fellow</div>
          <h3 className="font-headline text-[24px] font-semibold text-maroon leading-tight">
            {fellow.name}
          </h3>
          {fellow.program ? (
            <div className="text-[14px] text-ink-secondary mt-1">{fellow.program}</div>
          ) : null}
        </div>
      </div>

      {fellow.bio ? (
        <p className="text-[15px] text-ink-secondary leading-relaxed mb-4 flex-1">{fellow.bio}</p>
      ) : null}

      {fellow.focus && fellow.focus.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {fellow.focus.map((t) => (
            <span
              key={t}
              className="text-[11px] uppercase tracking-[0.05em] font-semibold text-maroon-muted border border-maroon-muted/50 px-2 py-1"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}

      {fellow.links ? (
        <div className="flex flex-wrap gap-4 text-[14px] font-semibold mt-auto">
          {fellow.links.linkedin ? (
            <a
              href={fellow.links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-maroon hover:text-maroon-deep prose-link"
            >
              LinkedIn <span aria-hidden="true">&rarr;</span>
            </a>
          ) : null}
          {fellow.links.website ? (
            <a
              href={fellow.links.website}
              target="_blank"
              rel="noreferrer"
              className="text-maroon hover:text-maroon-deep prose-link"
            >
              Website <span aria-hidden="true">&rarr;</span>
            </a>
          ) : null}
          {fellow.links.email ? (
            <a
              href={`mailto:${fellow.links.email}`}
              className="text-maroon hover:text-maroon-deep prose-link"
            >
              Email <span aria-hidden="true">&rarr;</span>
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
