import HeroSection from '@/components/HeroSection';
import ScrollReveal from '@/components/ScrollReveal';

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Mission — three-priority framing from the April 2026 faculty
          briefing. Same dotted-frame panel pattern as before. */}
      <section className="section">
        <ScrollReveal>
          <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 mb-8">
            <div className="eyebrow-lg mb-3">Our Mission</div>
            <h2 className="mb-6 max-w-4xl">
              An AI learning community. World-class offerings. Breakthrough pedagogy.
            </h2>
            <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl">
              First, we build a learning community where every faculty and staff member at
              Mays gets really good at using AI in their daily workflow. From there, those
              workflow gains turn into deep builds that become world-class AI offerings for
              our students. Through that process we create breakthrough pedagogy, and Mays
              is recognized as the center where the next way of teaching business is
              invented.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <div className="divider" />

      {/* Vision */}
      <section className="section">
        <ScrollReveal>
          <div className="eyebrow-lg mb-3">Our Vision</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 className="max-w-4xl mb-4">
            Defining the next way America teaches business.
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl">
            AI is rewriting business education. Mays is writing the answer.
          </p>
        </ScrollReveal>
      </section>

      <div className="divider" />

      {/* Leadership */}
      <section className="section">
        <ScrollReveal>
          <div className="heading-rule">
            <h2 className="text-center mx-auto">Leadership</h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <ScrollReveal>
            <LeaderCard
              name="Levi Belnap"
              role="Co-Director"
              note="Executive Director of Entrepreneurship and Innovation."
            />
          </ScrollReveal>
          <ScrollReveal>
            <LeaderCard
              name="'Jon Jasperson"
              role="Co-Director"
              note="Associate Dean for Academic Innovation; Clinical Professor of Information and Operations Management."
            />
          </ScrollReveal>
          <ScrollReveal>
            <LeaderCard
              name="Shrihari Sridhar"
              role="Co-Director"
              note="Senior Associate Dean of Mays Business School; Professor and Joe Foster '56 Chair in Business Leadership."
            />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

function LeaderCard({
  name,
  role,
  note,
}: {
  name: string;
  role: string;
  note: string;
}) {
  return (
    <div className="card h-full">
      <div className="eyebrow text-[16px] mb-3">{role}</div>
      <h3 className="font-headline text-[26px] font-semibold text-maroon mb-3 leading-tight">
        {name}
      </h3>
      <p className="text-[16px] text-ink-secondary leading-relaxed">{note}</p>
    </div>
  );
}
