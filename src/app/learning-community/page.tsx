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

export default async function LearningCommunityPage() {
  const cookieStore = cookies();
  const stored = cookieStore.get(ROLE_COOKIE)?.value;
  const initialRole: LearningRole =
    stored === 'staff' || stored === 'faculty' ? stored : 'faculty';

  // Pull the most recent approved contributed prompts for the row at the
  // top of the Prompts section. Returns an empty array if nothing is
  // approved yet, in which case the row renders the "Be the first to
  // contribute" placeholder.
  const contributedPrompts = await recentApprovedContributedPrompts(5);

  return (
    <section className="section pt-24">
      {/* Hero. One confident sentence. No clutter. */}
      <ScrollReveal>
        <div className="max-w-4xl">
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

      <LearningCommunityClient
        initialRole={initialRole}
        contributedPrompts={contributedPrompts}
      />
    </section>
  );
}
