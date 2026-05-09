import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Community | Mays Method Lab',
  description:
    'Workshops, the Mays Method Fellows program, and a ten-minute door for when you are stuck. We point you at the AI angle. You do the work.',
};

export default function CommunityPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main id="main-content">

      <section className="section pt-16" aria-labelledby="community-hero-heading">
        <ScrollReveal>
          <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12">
            <div className="eyebrow-lg mb-3">Community</div>
            <h1 id="community-hero-heading" className="mb-6 max-w-4xl">
              The People Side of the Lab.
            </h1>
            <p className="text-[20px] text-ink-secondary leading-relaxed max-w-3xl">
              Workshops, the Mays Method Fellows program, and a ten-minute door for
              when you are stuck. We point you at the AI angle. You do the work.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section" aria-labelledby="bring-problem-heading">
        <ScrollReveal>
          <div className="eyebrow-lg mb-3">When You Are Stuck</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 id="bring-problem-heading" className="max-w-4xl mb-6">
            Bring Us a Problem. We Will Point You at the AI Angle.
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <div className="max-w-3xl space-y-4 text-[18px] text-ink-secondary leading-relaxed">
            <p>
              Send a one-paragraph note. The work you are stuck on, what you have tried,
              the result you are after. We respond within a few days with a specific
              prompt to try, a tool to use, or a colleague to talk to.
            </p>
            <p>
              <strong>This is not a consulting engagement.</strong> We do not take on
              your project, do not run it for you, and do not commit deliverables. We
              point you at the AI angle in ten minutes. The work stays yours.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="mt-8">
            <a
              href="mailto:ssridhar@mays.tamu.edu?subject=AI%20angle%20question%20for%20the%20Mays%20Method%20Lab&body=A%20one-paragraph%20description%20of%20what%20you%20are%20stuck%20on%2C%20what%20you%20have%20tried%2C%20and%20the%20outcome%20you%20want."
              className="btn-primary"
            >
              Email Hari
              <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section" aria-labelledby="fellows-heading">
        <ScrollReveal>
          <div className="eyebrow-lg mb-3">Mays Method Fellows</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 id="fellows-heading" className="max-w-4xl mb-6">
            Students Who Have Already Done This Work, Paired With You.
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <div className="max-w-3xl space-y-4 text-[18px] text-ink-secondary leading-relaxed">
            <p>
              The Mays Method Fellows are a rotating cohort of Mays students who have
              built real AI workflows in their own coursework or jobs. They pair with
              faculty and staff for short engagements: a workshop in your department, a
              one-on-one walk-through of a specific tool, a short pilot you run together.
            </p>
            <p>
              The Fellows are not consultants. They are colleagues, a few years younger.
              They sit beside you and show you how they would do the same task with AI.
              Then they leave you the prompts and the playbook.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="mt-8">
            <Link href="/about/student-fellows" className="btn-secondary">
              Meet the current fellows
              <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section" aria-labelledby="workshops-heading">
        <ScrollReveal>
          <div className="eyebrow-lg mb-3">Workshops</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 id="workshops-heading" className="max-w-4xl mb-6">
            Short, Specific, Hands On.
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <div className="max-w-3xl space-y-4 text-[18px] text-ink-secondary leading-relaxed">
            <p>
              Lab workshops run roughly once a month. Each one targets a specific
              workflow at Mays: writing better case prep, generating exam questions,
              drafting outreach emails, building a class-ready notebook in NotebookLM.
            </p>
            <p>
              Workshops are open to all Mays faculty and staff. Sign up by emailing the
              Lab. The calendar appears here as new sessions are scheduled.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="card max-w-3xl mt-8 bg-bg-subtle">
            <div className="eyebrow mb-3">Workshop Calendar</div>
            <p className="text-[16px] text-ink-secondary leading-relaxed m-0">
              The calendar is being assembled. The first workshop of the upcoming term
              will be posted here. To be notified when sessions open, email the Lab and
              ask to be added to the workshop list.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section pb-20" aria-labelledby="join-heading">
        <ScrollReveal>
          <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 max-w-4xl mx-auto">
            <div className="eyebrow-lg mb-3">Join the Lab</div>
            <h2 id="join-heading" className="m-0 mb-4">
              Want to Help Build What Comes Next?
            </h2>
            <p className="text-[18px] text-ink-secondary leading-relaxed mb-6 max-w-2xl">
              Faculty and staff who want a deeper hand in shaping the Lab are welcome.
              We meet, we share what is working, we cross-pollinate across departments.
              No commitment beyond showing up and being willing to share.
            </p>
            <a
              href="mailto:ssridhar@mays.tamu.edu?subject=Joining%20the%20Mays%20Method%20Lab%20community"
              className="btn-primary"
            >
              Email Hari to join
              <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </ScrollReveal>
      </section>
      </main>
    </>
  );
}
