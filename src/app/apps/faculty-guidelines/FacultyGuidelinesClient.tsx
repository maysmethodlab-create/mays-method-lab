'use client';

import RagChatbot from '@/components/RagChatbot';

const STARTER_QUESTIONS = [
  'What are the criteria for promotion to full professor?',
  'How is teaching effectiveness measured for clinical faculty?',
  "What's the timeline for the third-year review?",
];

const SOURCE_LABEL = 'Mays Faculty Guidelines, October 17, 2025 (Approved version)';
// Authenticated route that serves the canonical PDF. Same TAMU member gate
// as the rest of /apps; unauthenticated visitors cannot reach it.
const SOURCE_HREF = '/api/apps/faculty-guidelines/source';

type Props = { enabled: boolean };

export default function FacultyGuidelinesClient({ enabled }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <header className="max-w-3xl">
        <div className="eyebrow-lg mb-3">Mays Method Lab · Apps</div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h1
            className="leading-[1.1] text-maroon m-0"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
          >
            Mays Faculty Guidelines Chatbot
          </h1>
          <span className="inline-block px-3 py-1 bg-maroon text-white text-[16px] uppercase tracking-[0.18em] font-semibold whitespace-nowrap">
            Beta
          </span>
        </div>
        <p className="text-[17px] text-ink-secondary leading-relaxed">
          Ask any question about the October 2025 guidelines. The chatbot quotes the exact passage that answers it.
        </p>
        <p className="text-[16px] text-ink-secondary leading-relaxed mt-3">
          This is a beta. If an answer feels off, tell us at{' '}
          <a href="mailto:ssridhar@mays.tamu.edu?subject=Faculty%20Guidelines%20Chatbot%20feedback" className="prose-link font-semibold">
            ssridhar@mays.tamu.edu
          </a>
          . Your feedback shapes the next version.
        </p>
      </header>

      <section className="bg-white border-2 border-maroon p-5 md:p-6 relative max-w-3xl">
        <div className="absolute inset-0 pointer-events-none dotted-frame" aria-hidden="true" />
        <div className="text-[16px] text-ink-primary">
          Grounded in:{' '}
          <a
            href={SOURCE_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="prose-link font-semibold"
          >
            {SOURCE_LABEL}
          </a>
        </div>
      </section>

      <p className="text-[16px] text-ink-secondary max-w-3xl">
        Advisory only. For decisions about your specific case, contact your
        department head or email Hari Sridhar (
        <a href="mailto:ssridhar@mays.tamu.edu" className="prose-link">
          ssridhar@mays.tamu.edu
        </a>
        ).
      </p>

      {enabled ? (
        <RagChatbot
          endpoint="/api/apps/faculty-guidelines/chat"
          sourceLabel={SOURCE_LABEL}
          sourceHref={SOURCE_HREF}
          placeholderQuestions={STARTER_QUESTIONS}
          botName="Faculty Guidelines"
        />
      ) : (
        <div className="bg-white border-2 border-maroon p-6 md:p-8 relative max-w-3xl">
          <div className="absolute inset-0 pointer-events-none dotted-frame" aria-hidden="true" />
          <div className="eyebrow-lg mb-3 font-headline text-maroon">Paused for maintenance</div>
          <p className="text-[16px] text-ink-primary leading-relaxed">
            This service is paused for maintenance. For decisions about your
            specific case, contact your department head or email Hari Sridhar (
            <a href="mailto:ssridhar@mays.tamu.edu" className="prose-link">
              ssridhar@mays.tamu.edu
            </a>
            ).
          </p>
        </div>
      )}
    </div>
  );
}
