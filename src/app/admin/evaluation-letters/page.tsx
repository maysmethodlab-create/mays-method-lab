import EvaluationLetterWorkflow from '@/components/evaluation-letters/EvaluationLetterWorkflow';
import Link from 'next/link';

export const metadata = {
  title: 'Evaluation Letter Writer | Mays Method Lab',
};

export default function EvaluationLettersPage() {
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
          <div className="eyebrow-lg mb-3">Evaluation Letter Writer</div>
          <h1 className="mb-4">Generate an annual evaluation letter.</h1>
          <p className="text-[16px] text-ink-secondary max-w-3xl leading-relaxed">
            Four steps: setup, upload, generate (research → draft → verify), download. The letter
            tracks the recipient&apos;s role category and the Mays four-level rating scale, and is
            checked against your source documents before download.
          </p>
        </div>
      </div>

      <EvaluationLetterWorkflow />
    </section>
  );
}
