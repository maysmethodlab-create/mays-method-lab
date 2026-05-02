import EndowedLetterWorkflow from '@/components/endowed-positions/EndowedLetterWorkflow';
import Link from 'next/link';

export const metadata = {
  title: 'Endowed Positions Letter Writer [Stage 2: ADR] — Mays Method Lab',
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
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <div className="eyebrow-lg">Endowed Positions Letter Writer [Stage 2: ADR]</div>
          </div>
          <h1 className="mb-4">Recommend an endowed appointment to the Dean.</h1>
          <p className="text-[16px] text-ink-secondary max-w-3xl leading-relaxed">
            For the Associate Dean for Research and Scholarship (Rogelio Oliva) to draft the
            recommendation memorandum from the Mays Research Council to the Dean. This is
            Stage 2 of the endowed-position process: the MRC has met and voted, and you draft
            the recommendation memorandum to the Dean. Stage 1 (department head nomination
            letter) and Stage 3 (Dean appointment letter) will become separate apps later.
            Six steps: pick the candidate, upload, confirm details, MRC votes, generate,
            download. Boilerplate is verbatim from the FY25 Boivie example.
          </p>
        </div>
      </div>

      <EndowedLetterWorkflow />
    </section>
  );
}
