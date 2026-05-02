import ScrollReveal from '../../components/ScrollReveal';
import AboutNav from '../../components/AboutNav';

export const metadata = {
  title: 'About — Mays Method Lab',
  description:
    'About the Mays Method Lab at Mays Business School, Texas A&M University.',
};

export default function AboutPage() {
  return (
    <>
      <section className="section pt-16">
        <AboutNav />

        <ScrollReveal>
          <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12">
            <div className="eyebrow-lg mb-3">About the Lab</div>
            <h1 className="mb-6 max-w-3xl">
              An AI learning community. World-class offerings. Breakthrough pedagogy.
            </h1>
            <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl">
              The Mays Method Lab pursues three reinforcing priorities at Mays Business
              School: making AI a daily advantage for every faculty and staff member,
              building world-class AI offerings for our students, and translating those
              breakthroughs into a new pedagogical standard — the Mays Method. AI is the
              defining transformation in higher education. Mays is running toward it,
              together.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section">
        <ScrollReveal>
          <div className="heading-rule mb-10">
            <h2 className="text-center mx-auto">Co-Directors</h2>
          </div>
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
          <div className="dotted-frame bg-bg-subtle py-10 px-8 md:px-12 max-w-3xl">
            <div className="eyebrow mb-3">Affiliation</div>
            <p className="text-[16px] text-ink-secondary leading-relaxed">
              The Mays Method Lab is part of Mays Business School at Texas A&amp;M University in
              College Station, Texas.
            </p>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}

function Bio({ name, title }: { name: string; title: string }) {
  return (
    <div className="card h-full">
      <div className="eyebrow text-[12px] mb-3">Co-Director</div>
      <h3 className="font-headline text-[26px] font-semibold text-maroon mb-3 leading-tight">
        {name}
      </h3>
      <p className="text-[15px] text-ink-secondary leading-relaxed whitespace-pre-line">{title}</p>
    </div>
  );
}
