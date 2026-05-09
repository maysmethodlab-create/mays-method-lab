import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import ScrollReveal from '@/components/ScrollReveal';

export default function HomePage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <HeroSection />

      <main id="main-content">
      {/*
        Section 1: The why — the three pillars as framing, not navigation.
        Three side-by-side tiles describing what AI changes about the way
        Mays does its work. No links. Pure context.
      */}
      <section className="section" aria-labelledby="why-heading">
        <ScrollReveal>
          <div className="eyebrow-lg mb-3">Three Things You Are Always Doing</div>
          <h2 id="why-heading" className="mb-6 max-w-4xl">
            Whichever One You Are on Today, AI Helps You Do It Better.
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl mb-8">
            Whatever you are doing for Mays today, you are working on one of
            three things. Helping students find us. Helping them do their best
            work while they are here. Helping them leave ready. We know that.
            The Lab&rsquo;s job is to put AI to work on whichever one is on your
            desk today, so the student you are doing it for gets the better
            hour.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <ScrollReveal>
            <PillarTile
              label="Learn About Us"
              body="Telling a prospective student what Mays really is: the research, the faculty, the Aggie experience, the Aggie network. Matching them to the program that fits. Putting them in front of the alum who makes them want to be one of us. AI helps you reach more of the right students in the hours you have."
            />
          </ScrollReveal>
          <ScrollReveal>
            <PillarTile
              label="Experience Mays"
              body="Building the syllabus that keeps up with the field. Designing the case, the simulation, the experiential project that makes an idea stick. Reading the paper that shows the student is thinking harder than they were in September. AI takes the laborious tasks off your desk so the hour you spend making them sharper thinkers is the one that grows."
            />
          </ScrollReveal>
          <ScrollReveal>
            <PillarTile
              label="Leave Better"
              body="Connecting a senior to the employer that fits them. Prepping them for the interview that decides the offer. Making the introduction to the Aggie who has done what they want to do next. AI helps you spend more of their last semester on the student in front of you and less on the paperwork that used to fill it."
            />
          </ScrollReveal>
        </div>
      </section>

      <div className="divider" />

      {/*
        Section 2: What this Lab is. Two short paragraphs. Catalyst, not
        contractor. The Lab gives you the lever; you do the work; if you
        build a breakthrough, we point you at the paths.
      */}
      <section className="section" aria-labelledby="what-heading">
        <ScrollReveal>
          <div className="eyebrow-lg mb-3">What This Lab Is</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 id="what-heading" className="max-w-4xl mb-6">
            A Catalyst for the People Already Doing the Work.
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <div className="max-w-3xl space-y-4 text-[18px] text-ink-secondary leading-relaxed">
            <p>
              The Mays Method Lab does not run consulting projects. It does not take on
              builds. It hands you the AI lever, the technique, and the people who have
              figured pieces of it out. You do the rest.
            </p>
            <p>
              If what you build turns out to be a breakthrough, the kind your students
              use, your colleagues ask for, and your audience comes back to, we will
              show you the paths to scale it. Texas A&amp;M has the offices and the
              routes. We point you at them when the moment is right.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <div className="divider" />

      {/*
        Section 3: How we will know it is working. Five commitments, no
        numbers yet. The credibility play: tell them up front how you will
        be judged. Last italic line is the trust play.
      */}
      <section className="section" aria-labelledby="kpi-heading">
        <ScrollReveal>
          <div className="eyebrow-lg mb-3">Our Promise</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 id="kpi-heading" className="max-w-4xl mb-2">
            How We Will Know It Is Working.
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl mb-8">
            Five things the Lab will measure itself against. We do not have all the
            numbers yet. We are telling you what they are, so you can hold us to them.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <ScrollReveal>
            <CommitmentCard
              title="Bring AI to the People Doing the Work"
              body="Every Mays faculty and staff member should be able to use AI in the work they actually care about. The Lab is succeeding when AI is no longer an extra step."
            />
          </ScrollReveal>
          <ScrollReveal>
            <CommitmentCard
              title="Give Faculty and Staff Their Time Back"
              body="Every hour AI handles is an hour returned to the work that matters. The Lab is succeeding when Mays faculty and staff are spending more of their day on students, not less."
            />
          </ScrollReveal>
          <ScrollReveal>
            <CommitmentCard
              title="Build Patterns Other Mays People Use"
              body="When something works in one office, the Lab makes it easy for the next office to pick it up. The Lab is succeeding when an app built for one department is in use across three."
            />
          </ScrollReveal>
          <ScrollReveal>
            <CommitmentCard
              title="Put Mays at the Front of the Field"
              body="The Lab is succeeding when peer business schools visit College Station to see how Mays uses AI, and when they go home and copy us."
            />
          </ScrollReveal>
          <ScrollReveal>
            <CommitmentCard
              title="Help Breakthroughs Scale"
              body="When something built inside Mays turns out to be a breakthrough, the Lab points you at the paths to take it further. We do not sit on it."
            />
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <p className="text-[16px] text-ink-muted italic max-w-3xl">
            We will publish the numbers as they come in. We will tell you when we have
            not made progress.
          </p>
        </ScrollReveal>
      </section>

      <div className="divider" />

      {/*
        Section 4: How the Lab helps you. Four destination cards.
      */}
      <section className="section" aria-labelledby="ways-in-heading">
        <ScrollReveal>
          <div className="eyebrow-lg mb-3">How the Lab Helps You</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 id="ways-in-heading" className="mb-8 max-w-4xl">Four Ways In.</h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          <ScrollReveal>
            <DoorCard
              title="Resources"
              tagline="Start here."
              body="The TAMU AI tools, the curated prompts, the free AI courses, and the twenty-minute path that gets you using AI today."
              href="/resources"
              cta="Open the resources"
            />
          </ScrollReveal>
          <ScrollReveal>
            <DoorCard
              title="Community"
              tagline="Workshops, Fellows, Conversations."
              body="Student-led workshops, the Mays Method Fellows program, and a ten-minute door for when you are stuck. We point you at the AI angle. You do the work."
              href="/community"
              cta="See what is happening"
            />
          </ScrollReveal>
          <ScrollReveal>
            <DoorCard
              title="Workflow Apps"
              tagline="See What Is Possible."
              body="The apps we built for ourselves at Mays. How they work, how they were made, and how you would build your own."
              href="/workflow-apps"
              cta="Browse the case studies"
            />
          </ScrollReveal>
          <ScrollReveal>
            <DoorCard
              title="Breakthroughs"
              tagline="Scale What Works."
              body="Built something that works? Here are the paths to take it further. TAMU OTM, the Center for Entrepreneurship and Innovation, conference circuits, internal Lab spotlight."
              href="/breakthroughs"
              cta="See the paths"
            />
          </ScrollReveal>
        </div>
      </section>

      <div className="divider" />

      {/*
        Section 5: Closing line.
      */}
      <section className="section" aria-labelledby="closing-heading">
        <ScrollReveal>
          <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 text-center max-w-4xl mx-auto">
            <h2 id="closing-heading" className="m-0 mb-4">
              Pick One Resource. Try One Prompt.
            </h2>
            <p className="text-[20px] text-ink-secondary leading-relaxed mb-6">
              Twenty minutes from now you will know more than you do today.
            </p>
            <Link href="/resources" className="btn-primary">
              Start With You
              <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </ScrollReveal>
      </section>
      </main>
    </>
  );
}

function PillarTile({ label, body }: { label: string; body: string }) {
  return (
    <div className="card h-full">
      <div className="eyebrow mb-3">{label}</div>
      <p className="text-[18px] text-ink-secondary leading-relaxed m-0">{body}</p>
    </div>
  );
}

function CommitmentCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card h-full flex flex-col">
      <h3 className="font-headline text-[22px] font-semibold text-maroon mb-3 leading-tight">
        {title}
      </h3>
      <p className="text-[16px] text-ink-secondary leading-relaxed m-0">{body}</p>
    </div>
  );
}

function DoorCard({
  title,
  tagline,
  body,
  href,
  cta,
}: {
  title: string;
  tagline: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="card h-full flex flex-col justify-between hover:border-maroon transition-colors group"
    >
      <div>
        <h3 className="font-headline text-[26px] font-semibold text-maroon mb-2 leading-tight">
          {title}
        </h3>
        <div className="eyebrow mb-4">{tagline}</div>
        <p className="text-[16px] text-ink-secondary leading-relaxed m-0 mb-6">{body}</p>
      </div>
      <span className="text-[16px] font-semibold text-maroon group-hover:underline" style={{ textDecorationThickness: '2px' }}>
        {cta} <span aria-hidden="true">&rarr;</span>
      </span>
    </Link>
  );
}
