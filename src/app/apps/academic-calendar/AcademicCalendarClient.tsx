'use client';

import RagChatbot from '@/components/RagChatbot';

const STARTER_QUESTIONS = [
  'When does spring 2026 registration close?',
  'What is the last day to drop a class without penalty in fall 2025?',
  'When are graduate finals next semester?',
];

export default function AcademicCalendarClient() {
  return (
    <div className="flex flex-col gap-8">
      <header className="max-w-3xl">
        <div className="eyebrow-lg mb-3">Mays Method Lab · Apps</div>
        <h1 className="mb-3 leading-[1.1]" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
          Academic Calendar
        </h1>
        <p className="text-[17px] text-ink-secondary leading-relaxed">
          Ask about a date on the TAMU academic calendar. Registration windows,
          drop deadlines, finals weeks, breaks, commencement.
        </p>
        <p className="text-[14px] text-ink-secondary mt-4">
          Source:{' '}
          <a
            href="https://registrar.tamu.edu/academic-calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="prose-link"
          >
            TAMU Registrar Academic Calendar
          </a>
          . The chatbot answers only from the published calendar. Verify any
          deadline against the registrar before acting on it.
        </p>
      </header>

      <RagChatbot
        endpoint="/api/apps/academic-calendar/chat"
        sourceLabel="TAMU Registrar Academic Calendar"
        sourceHref="https://registrar.tamu.edu/academic-calendar"
        placeholderQuestions={STARTER_QUESTIONS}
        botName="Academic Calendar"
      />
    </div>
  );
}
