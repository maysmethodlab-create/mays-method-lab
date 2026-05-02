import { cookies } from 'next/headers';
import ScrollReveal from '@/components/ScrollReveal';
import LearningCommunityClient from './LearningCommunityClient';
import type { LearningRole } from '@/lib/learning-community';
import { recentApprovedContributedPrompts } from '@/lib/submissions';

export const metadata = {
  title: 'Your AI Edge | Mays Method Lab',
  description:
    'Less drag, more work that matters. Apps, prompts, and a five-step Learn AI ladder for the Mays community.',
};

const ROLE_COOKIE = 'mml.role.preference';

/**
 * Hand-curated examples that seed the "Recently contributed by faculty" row.
 * Personas track the JTBD doc (Sara, Marco, Ashley). Marked seeded so the
 * UI can distinguish from real submissions once those start coming in.
 */
const SEEDED_CONTRIBUTIONS = [
  {
    id: 'seed-sara-lit-review',
    contributorName: 'Sara',
    contributorRole: 'Research-heavy Associate Professor',
    promptTitle: 'Summarize research sources',
    description:
      'For a lit review I knocked out 12 papers in 4 minutes. Worth the keystrokes.',
    href: '/prompts#research',
    seeded: true,
  },
  {
    id: 'seed-ashley-announcement',
    contributorName: 'Ashley',
    contributorRole: 'Program Coordinator',
    promptTitle: 'Draft an announcement',
    description:
      'Three bullets in, polished update out. Saves me 20 minutes a week.',
    href: '/prompts#writing',
    seeded: true,
  },
  {
    id: 'seed-marco-exam',
    contributorName: 'Marco',
    contributorRole: 'Clinical Professor',
    promptTitle: 'Generate practice exam questions',
    description:
      'Thirty questions in one prompt. I cherry-pick the eight that fit the unit.',
    href: '/prompts#teaching',
    seeded: true,
  },
];

export default async function LearningCommunityPage() {
  const cookieStore = cookies();
  const stored = cookieStore.get(ROLE_COOKIE)?.value;
  const initialRole: LearningRole =
    stored === 'staff' || stored === 'faculty' ? stored : 'faculty';

  // Pull approved contributed prompts. When none exist yet, fall back to
  // the curated seeds so the row never reads empty.
  const approved = await recentApprovedContributedPrompts(5);
  const contributedPrompts =
    approved.length > 0 ? approved : SEEDED_CONTRIBUTIONS;

  return (
    <>
      {/* Hero band. Solid maroon backdrop with a subtle dotted texture, the
          white dotted-frame card overlaps it. Mays-style — color and
          geometry, no decorative imagery. */}
      <div className="hero-maroon-band">
        <div
          className="section pt-24 pb-24"
          style={{ paddingTop: '96px', paddingBottom: '120px' }}
        >
          <ScrollReveal>
            <div className="bg-white py-12 px-8 md:py-16 md:px-14 max-w-4xl relative dotted-frame">
              <div className="eyebrow-lg mb-4">Your AI Edge</div>
              <h1 className="mb-6 leading-[1.1]" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
                Less drag. More work that matters.
              </h1>
              <p className="text-[18px] text-ink-secondary leading-relaxed max-w-2xl">
                Practical AI for the work you actually do at Mays. Open an app,
                try a prompt, climb the Learn AI ladder. One page, three ways in.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <section className="section">
        <LearningCommunityClient
          initialRole={initialRole}
          contributedPrompts={contributedPrompts}
        />
      </section>
    </>
  );
}
