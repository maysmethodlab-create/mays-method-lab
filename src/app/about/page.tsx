import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'About — Mays Method Lab',
  description:
    'About the Mays Method Lab at Mays Business School, Texas A&M University.',
};

export default function AboutPage() {
  return (
    <>
      <section className="section pt-40">
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
            business for the AI era. We work in the tradition of an R&amp;D lab inside a great
            university, producing pedagogical innovations that can be branded, disseminated, and
            exported as the Mays Method.
          </p>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section">
        <div className="grid md:grid-cols-2 gap-12">
          <ScrollReveal>
            <div>
              <div className="eyebrow mb-4">Our Mission</div>
              <p className="text-base text-ink-secondary leading-relaxed">
                Build tools, frameworks, and curricula that change how business education is
                taught — not at the margin, but at the foundation. The work begins inside Mays
                Business School at Texas A&amp;M University and is meant to scale.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div>
              <div className="eyebrow mb-4">Our Vision</div>
              <p className="text-base text-ink-secondary leading-relaxed">
                Within five years, recognized as the leading center of pedagogical invention in
                American business education.
              </p>
            </div>
          </ScrollReveal>
        </div>
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
              role="Co-Director"
              bio="Industry leader in education technology and venture-building inside higher education. Leads the Lab's work on translating research into shippable products."
            />
          </ScrollReveal>
          <ScrollReveal>
            <Bio
              name="'Jon Jasperson"
              role="Co-Director"
              bio="Clinical professor and head of the Department of Information and Operations Management. Leads the Lab's work on faculty capability and adoption."
            />
          </ScrollReveal>
          <ScrollReveal>
            <Bio
              name="Shrihari Sridhar"
              role="Co-Director"
              bio="Senior associate dean for faculty and research at Mays Business School. Leads the Lab's work on faculty workflow tools and the academic-leadership stack."
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
            College Station, Texas. The Lab's work is non-commercial and intended to benefit the
            field of business education broadly.
          </p>
        </ScrollReveal>
      </section>
    </>
  );
}

function Bio({ name, role, bio }: { name: string; role: string; bio: string }) {
  return (
    <div className="card h-full">
      <div className="eyebrow text-[11px] mb-3">{role}</div>
      <h3 className="text-2xl font-bold text-ink-primary mb-3 leading-tight">{name}</h3>
      <p className="text-sm text-ink-secondary leading-relaxed">{bio}</p>
    </div>
  );
}
