import EndowedLetterWorkflow from '@/components/endowed-positions/EndowedLetterWorkflow';
import Link from 'next/link';

export const metadata = {
  title: 'Endowed Positions Letter Writer — Mays Method Lab',
};

export default function EndowedPositionsPage() {
  return (
    <section className="section pt-16 max-w-5xl">
      <Link
        href="/admin"
        className="text-[13px] uppercase tracking-[0.05em] font-semibold text-maroon-muted hover:text-maroon transition-colors"
      >
        <span aria-hidden="true">&larr;</span> Back to Admin Tools
      </Link>

      <div className="mt-8 mb-10">
        <div className="dotted-frame bg-bg-subtle py-10 px-8 md:px-12">
          <div className="eyebrow-lg mb-3">Endowed Positions Letter Writer</div>
          <h1 className="mb-4">Recommend an endowed appointment to the Dean.</h1>
          <p className="text-[16px] text-ink-secondary max-w-3xl leading-relaxed">
            Stage 2 of the Mays endowed-positions process. The Associate Dean for Research and
            Scholarship, as Chair of the Mays Research Council, writes a memorandum to the Dean
            recommending the appointment, reappointment, or fellowship of a candidate. Five
            steps: setup, upload, MRC votes, generate, download. Boilerplate is verbatim from
            the FY25 Boivie example.
          </p>
        </div>
      </div>

      <EndowedLetterWorkflow />
    </section>
  );
}
