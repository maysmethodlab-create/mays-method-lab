import ScrollReveal from '@/components/ScrollReveal';
import AboutNav from '@/components/AboutNav';

export const metadata = {
  title: 'AI Student Fellows — Mays Method Lab',
  description:
    'AI Student Fellows of the Mays Method Lab at Mays Business School, Texas A&M University.',
};

export default function StudentFellowsPage() {
  return (
    <section className="section pt-40">
      <AboutNav />

      <ScrollReveal>
        <div className="eyebrow-lg mb-6">AI Student Fellows</div>
      </ScrollReveal>
      <ScrollReveal>
        <h1 className="headline text-5xl md:text-6xl mb-6 max-w-3xl">
          Student fellows of the Lab.
        </h1>
      </ScrollReveal>

      <ScrollReveal>
        <div className="card max-w-2xl">
          <div className="eyebrow text-[11px] mb-3">Status</div>
          <p className="text-base text-ink-secondary leading-relaxed">
            Roster forthcoming. This page will list our AI Student Fellows soon.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
