import HeroSection from '@/components/HeroSection';
import ScrollReveal from '@/components/ScrollReveal';

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Mission */}
      <section className="section">
        <ScrollReveal>
          <div className="eyebrow-lg mb-6">Our Mission</div>
        </ScrollReveal>
        <ScrollReveal>
          <p className="text-2xl md:text-3xl font-light text-ink-primary leading-snug max-w-4xl">
            The Mays Method Lab works in the tradition of a research and development lab inside
            a great university. We produce pedagogical innovations that can be branded,
            disseminated, and exported as the Mays Method.
          </p>
        </ScrollReveal>
        <ScrollReveal>
          <p className="text-base md:text-lg text-ink-secondary mt-8 max-w-3xl leading-relaxed">
            Our work sits at the intersection of business education, AI, and the changing nature
            of professional knowledge. We build tools that make the work of academic leaders at
            Mays Business School faster, more consistent, and more thoughtful.
          </p>
        </ScrollReveal>
      </section>

      <div className="divider" />

      {/* Vision */}
      <section className="section">
        <ScrollReveal>
          <div className="eyebrow-lg mb-6">Our Vision</div>
        </ScrollReveal>
        <ScrollReveal>
          <p className="text-2xl md:text-3xl font-light text-ink-primary leading-snug max-w-4xl">
            Within five years, recognized as the leading center of pedagogical invention in
            American business education.
          </p>
        </ScrollReveal>
      </section>

      <div className="divider" />

      {/* Leadership */}
      <section className="section">
        <ScrollReveal>
          <div className="eyebrow-lg mb-10">Leadership</div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <ScrollReveal>
            <LeaderCard
              name="Levi Belnap"
              role="Co-Director"
              note="Industry leader in education technology and venture-building inside higher education."
            />
          </ScrollReveal>
          <ScrollReveal>
            <LeaderCard
              name="'Jon Jasperson"
              role="Co-Director"
              note="Clinical professor and head of the Department of Information and Operations Management at Mays Business School."
            />
          </ScrollReveal>
          <ScrollReveal>
            <LeaderCard
              name="Shrihari Sridhar"
              role="Co-Director"
              note="Senior associate dean for faculty and research, Mays Business School, Texas A&M University."
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
      <div className="eyebrow text-[11px] mb-3">{role}</div>
      <h3 className="text-2xl font-bold text-ink-primary mb-3 leading-tight">{name}</h3>
      <p className="text-sm text-ink-secondary leading-relaxed">{note}</p>
    </div>
  );
}
