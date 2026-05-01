import ScrollReveal from '@/components/ScrollReveal';
import AboutNav from '@/components/AboutNav';

export const metadata = {
  title: 'About — Mays Method Lab',
  description:
    'About the Mays Method Lab at Mays Business School, Texas A&M University.',
};

export default function AboutPage() {
  return (
    <>
      <section className="section pt-40">
        <AboutNav />

        <ScrollReveal>
          <div className="eyebrow-lg mb-6">About</div>
        </ScrollReveal>
        <ScrollReveal>
          <h1 className="headline text-5xl md:text-6xl mb-8 max-w-3xl">
            A research and development lab inside Mays Business School.
          </h1>
        </ScrollReveal>
        <ScrollReveal>
          <p className="text-lg text-ink-secondary leading-relaxed max-w-3xl">
            The Mays Method Lab exists to discover, test, and codify a new way of teaching
            business for the AI era.
          </p>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section">
        <ScrollReveal>
          <div className="eyebrow-lg mb-10">Co-Directors</div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <ScrollReveal>
            <Bio
              name="Levi Belnap"
              title="Executive Director of Entrepreneurship and Innovation"
            />
          </ScrollReveal>
          <ScrollReveal>
            <Bio
              name="'Jon Jasperson"
              title="Associate Dean for Academic Innovation; Clinical Professor of Information and Operations Management"
            />
          </ScrollReveal>
          <ScrollReveal>
            <Bio
              name="Shrihari Sridhar"
              title={`Senior Associate Dean of Mays Business School;
Professor and Joe Foster '56 Chair in Business Leadership`}
            />
          </ScrollReveal>
        </div>
      </section>

      <div className="divider" />

      <section className="section">
        <ScrollReveal>
          <div className="eyebrow mb-4">Affiliation</div>
        </ScrollReveal>
        <ScrollReveal>
          <p className="text-base text-ink-secondary leading-relaxed max-w-3xl">
            The Mays Method Lab is part of Mays Business School at Texas A&amp;M University in
            College Station, Texas.
          </p>
        </ScrollReveal>
      </section>
    </>
  );
}

function Bio({ name, title }: { name: string; title: string }) {
  return (
    <div className="card h-full">
      <div className="eyebrow text-[11px] mb-3">Co-Director</div>
      <h3 className="text-2xl font-bold text-ink-primary mb-3 leading-tight">{name}</h3>
      <p className="text-sm text-ink-secondary leading-relaxed whitespace-pre-line">{title}</p>
    </div>
  );
}
