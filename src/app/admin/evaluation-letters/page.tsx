import EvaluationLetterWorkflow from '@/components/evaluation-letters/EvaluationLetterWorkflow';
import Link from 'next/link';

export const metadata = {
  title: 'Evaluation Letter Writer — Mays Method Lab',
};

export default function EvaluationLettersPage() {
  return (
    <section className="section pt-32 max-w-5xl">
      <Link
        href="/admin"
        className="text-xs uppercase tracking-[0.2em] text-ink-secondary hover:text-ink-primary transition-colors"
      >
        ← Back to Admin Tools
      </Link>

      <div className="mt-8 mb-10">
        <div className="eyebrow-lg mb-4">Evaluation Letter Writer</div>
        <h1 className="headline text-4xl md:text-5xl mb-4">
          Generate an annual evaluation letter.
        </h1>
        <p className="text-base text-ink-secondary max-w-3xl leading-relaxed">
          Four steps: setup, upload, generate (research → draft → verify), download. The letter
          tracks the recipient&apos;s role category and the Mays four-level rating scale, and is
          checked against your source documents before download.
        </p>
      </div>

      <EvaluationLetterWorkflow />
    </section>
  );
}
