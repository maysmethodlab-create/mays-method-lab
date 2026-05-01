import HeroSection from '@/components/HeroSection';
import ScrollReveal from '@/components/ScrollReveal';

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Mission — replicates Mays's section-intro pattern: superhead +
          large Oswald heading + body paragraph. Wrapped in a dotted-frame
          panel that overlays the section, mirroring Mays's media-feature. */}
      <section className="section">
        <ScrollReveal>
          <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 mb-8">
            <div className="eyebrow-lg mb-3">Our Mission</div>
            <h2 className="mb-6 max-w-4xl">
              The Mays Method Lab works in the tradition of a research and development lab inside
              a great university.
            </h2>
            <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl mb-4">
              We produce pedagogical innovations that can be branded, disseminated, and exported
              as the Mays Method.
            </p>
            <p className="text-[16px] text-ink-secondary leading-relaxed max-w-3xl">
              Our work sits at the intersection of business education, AI, and the changing nature
              of professional knowledge. We build tools that make the work of academic leaders at
              Mays Business School faster, more consistent, and more thoughtful.
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
            Within five years, recognized as the leading center of pedagogical invention in
            American business education.
          </h2>
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
      <div className="eyebrow text-[12px] mb-3">{role}</div>
      <h3 className="font-headline text-[26px] font-semibold text-maroon mb-3 leading-tight">
        {name}
      </h3>
      <p className="text-[15px] text-ink-secondary leading-relaxed">{note}</p>
    </div>
  );
}
