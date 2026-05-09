import ScrollReveal from '../../components/ScrollReveal';
import AboutNav from '../../components/AboutNav';
import Link from 'next/link';

export const metadata = {
  title: 'About | Mays Method Lab',
  description:
    'A small Lab with one specific job: help every Mays faculty and staff member use AI to do their work better. Mays Business School, Texas A&M University.',
};

export default function AboutPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main id="main-content">

      <section className="section pt-16" aria-labelledby="about-hero-heading">
        <AboutNav />

        <ScrollReveal>
          <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12">
            <div className="eyebrow-lg mb-3">About the Mays Method Lab</div>
            <h1 id="about-hero-heading" className="mb-6 max-w-3xl">
              A Small Lab With One Specific Job.
            </h1>
            <p className="text-[20px] text-ink-secondary leading-relaxed max-w-3xl">
              Help every Mays faculty and staff member use AI to do their work better.
              That is it.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section" aria-labelledby="why-exist-heading">
        <ScrollReveal>
          <div className="eyebrow-lg mb-3">Why We Exist</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 id="why-exist-heading" className="max-w-4xl mb-6">
            AI Just Changed the Math on What One Aggie Can Do in a Day.
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <div className="max-w-3xl space-y-4 text-[18px] text-ink-secondary leading-relaxed">
            <p>
              Faculty and staff who learn to use AI will spend their hours where they
              want to be: with students, with collaborators, with the work that needs
              them. Faculty and staff who do not will keep paying the old time tax on
              tasks AI can do in minutes.
            </p>
            <p>
              The Lab exists to help every Mays person make that transition, on their
              own terms, at their own pace.
            </p>
            <p>
              We are not the entire mission of the business school. We are not the
              teaching. We are not the mentoring. We are not the careers office. We
              are the catalyst, the accelerant, the turbocharge for the people doing
              those things, when they want a faster way to do them.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section" aria-labelledby="what-we-dont-do-heading">
        <ScrollReveal>
          <div className="eyebrow-lg mb-3">What We Do Not Do</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 id="what-we-dont-do-heading" className="max-w-4xl mb-6">
            Saying It Up Front Saves Everyone Time.
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <ul className="max-w-3xl space-y-4 text-[18px] text-ink-secondary leading-relaxed list-none p-0">
            <li>
              <strong>We do not take on consulting projects.</strong> Bring us a
              problem and we will point you at the AI angle. The work stays yours.
            </li>
            <li>
              <strong>
                We do not replace the Center for Entrepreneurship and Innovation.
              </strong>{' '}
              We point at it when an idea grows up.
            </li>
            <li>
              <strong>We do not write our own courses.</strong> We curate the best free
              AI courses already out there (DeepLearning.AI, Microsoft, Google's AI
              Essentials, others) and put them in one place so you do not have to hunt.
            </li>
            <li>
              <strong>We do not build apps for the world.</strong> The workflow apps on
              this site were built for specific Mays workflows. They are case studies
              for the patterns, not products for everyone.
            </li>
          </ul>
        </ScrollReveal>
        <ScrollReveal>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl mt-6">
            What is left between those is what we do: a small set of resources, a
            ten-minute door when you are stuck, a Mays Method Fellows program that
            pairs students with faculty, and a workshops calendar.
          </p>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section" aria-labelledby="leadership-heading">
        <ScrollReveal>
          <div className="heading-rule mb-10">
            <h2 id="leadership-heading" className="text-center mx-auto">Co-Directors</h2>
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
              name="Jon Jasperson"
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

        <ScrollReveal>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl mt-10">
            The Lab is supported by the <strong>Mays Method Fellows</strong>, a rotating
            cohort of student fellows who pair with faculty and staff on real workflow
            problems. Their bios are on the{' '}
            <Link href="/about/student-fellows" className="text-maroon underline">
              student fellows page
            </Link>
            .
          </p>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section" aria-labelledby="breakthroughs-heading">
        <ScrollReveal>
          <div className="eyebrow-lg mb-3">How a Breakthrough Gets Recognized</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 id="breakthroughs-heading" className="max-w-4xl mb-6">
            The Lab Does Not Pick Winners. The Market Does.
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <div className="max-w-3xl space-y-4 text-[18px] text-ink-secondary leading-relaxed">
            <p>
              If your audience uses what you built, your colleagues ask how you did it,
              your students keep coming back, that is the signal. Tell us. We will help
              you find the right path: the Texas A&amp;M Office of Technology
              Management, the Center for Entrepreneurship and Innovation, conference
              circuits, the Lab's own spotlight.
            </p>
            <p>
              The gatekeepers are everybody: your audience, your customers, the work
              itself, and the Lab.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section" aria-labelledby="get-involved-heading">
        <ScrollReveal>
          <div className="eyebrow-lg mb-3">Get Involved</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 id="get-involved-heading" className="max-w-4xl mb-6">
            Three Lanes. Pick the One That Fits Where You Are Right Now.
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          <ScrollReveal>
            <LaneCard
              title="Try a Resource"
              body="Twenty minutes is enough to start."
              href="/resources"
              cta="Open the resources"
            />
          </ScrollReveal>
          <ScrollReveal>
            <LaneCard
              title="Bring Us a Problem"
              body="We will point you at the AI angle in ten minutes. The work stays yours."
              href="mailto:ssridhar@mays.tamu.edu?subject=AI%20angle%20question%20for%20the%20Mays%20Method%20Lab"
              cta="Email Hari"
              external
            />
          </ScrollReveal>
          <ScrollReveal>
            <LaneCard
              title="Join the Lab"
              body="Become a Mays Method Fellow, attend workshops, or shape what comes next."
              href="/community"
              cta="See how"
            />
          </ScrollReveal>
        </div>
      </section>

      <div className="divider" />

      <section className="section pb-20" aria-labelledby="affiliation-heading">
        <ScrollReveal>
          <div className="dotted-frame bg-bg-subtle py-10 px-8 md:px-12 max-w-3xl">
            <div className="eyebrow mb-3" id="affiliation-heading">Affiliation</div>
            <p className="text-[18px] text-ink-secondary leading-relaxed">
              The Mays Method Lab is part of Mays Business School at Texas A&amp;M
              University in College Station, Texas.
            </p>
            <p className="text-[18px] text-ink-secondary leading-relaxed mt-4">
              If you want Mays to be the place where AI is used to help, you are in
              the right place. Start with you.
            </p>
          </div>
        </ScrollReveal>
      </section>
      </main>
    </>
  );
}

function Bio({ name, title }: { name: string; title: string }) {
  return (
    <div className="card h-full">
      <div className="eyebrow mb-3">Co-Director</div>
      <h3 className="font-headline text-[26px] font-semibold text-maroon mb-3 leading-tight">
        {name}
      </h3>
      <p className="text-[16px] text-ink-secondary leading-relaxed whitespace-pre-line">
        {title}
      </p>
    </div>
  );
}

function LaneCard({
  title,
  body,
  href,
  cta,
  external,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
  external?: boolean;
}) {
  const content = (
    <div className="card h-full flex flex-col justify-between">
      <div>
        <h3 className="font-headline text-[24px] font-semibold text-maroon mb-3 leading-tight">
          {title}
        </h3>
        <p className="text-[16px] text-ink-secondary leading-relaxed m-0 mb-6">{body}</p>
      </div>
      <span className="text-[16px] font-semibold text-maroon">
        {cta} <span aria-hidden="true">&rarr;</span>
      </span>
    </div>
  );
  if (external) {
    return (
      <a href={href} className="block hover:[&>div]:border-maroon transition-colors">
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className="block hover:[&>div]:border-maroon transition-colors">
      {content}
    </Link>
  );
}
