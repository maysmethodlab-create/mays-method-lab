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
    <section className="section pt-16">
      <ScrollReveal>
        <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 mb-10">
          <div className="eyebrow-lg mb-3">AI Learning Community</div>
          <h1 className="mb-4 max-w-3xl">
            Practical AI for the Mays community. Mapped to the work you actually do.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl">
            Pick your role. Pick a bucket. Open one tool, copy one prompt, or build one tutorial. Every
            link below is a real, TAMU-approved resource you can use today.
          </p>
        </div>
      </ScrollReveal>

      <LearningCommunityClient initialRole={initialRole} />
    </section>
  );
}
