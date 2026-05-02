import { cookies } from 'next/headers';
import ScrollReveal from '@/components/ScrollReveal';
import LearningCommunityClient from './LearningCommunityClient';
import type { LearningRole } from '@/lib/learning-community';

export const metadata = {
  title: 'AI Learning Community | Mays Method Lab',
  description:
    'Practical AI tools, prompts, and tutorials for Mays Business School faculty and staff. Job-mapped to your daily work.',
};

const ROLE_COOKIE = 'mml.role.preference';

export default function LearningCommunityPage() {
  const cookieStore = cookies();
  const stored = cookieStore.get(ROLE_COOKIE)?.value;
  const initialRole: LearningRole =
    stored === 'staff' || stored === 'faculty' ? stored : 'faculty';

  return (
    <section className="section pt-10">
      <ScrollReveal>
        <div className="dotted-frame bg-bg-subtle py-8 px-8 md:px-12 mb-8">
          <div className="eyebrow-lg mb-2">AI Learning Community</div>
          <h1 className="mb-3 max-w-3xl">
            Practical AI for the Mays community. Mapped to the work you actually do.
          </h1>
          <p className="text-[16px] text-ink-secondary leading-relaxed max-w-3xl">
            Pick your role. Pick a bucket. Open one tool, copy one prompt, or build one tutorial.
          </p>
        </div>
      </ScrollReveal>

      <LearningCommunityClient initialRole={initialRole} />
    </section>
  );
}
