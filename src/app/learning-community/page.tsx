import { cookies } from 'next/headers';
import ScrollReveal from '@/components/ScrollReveal';
import LearningCommunityClient from './LearningCommunityClient';
import type { LearningRole } from '@/lib/learning-community';

export const metadata = {
  title: 'AI Learning Community | Mays Method Lab',
  description:
    'Practical AI for the Mays community. Apps mapped to the work you actually do.',
};

const ROLE_COOKIE = 'mml.role.preference';

export default function LearningCommunityPage() {
  const cookieStore = cookies();
  const stored = cookieStore.get(ROLE_COOKIE)?.value;
  const initialRole: LearningRole =
    stored === 'staff' || stored === 'faculty' ? stored : 'faculty';

  return (
    <section className="section pt-24">
      {/* Hero. One confident sentence. No clutter. */}
      <ScrollReveal>
        <div className="max-w-4xl">
          <div className="eyebrow-lg mb-4">AI Learning Community</div>
          <h1 className="mb-6 leading-[1.1]" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
            Practical AI for the Mays community.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-2xl">
            A small set of apps, picked for the work faculty and staff actually do.
            Open one and start.
          </p>
        </div>
      </ScrollReveal>

      <LearningCommunityClient initialRole={initialRole} />
    </section>
  );
}
