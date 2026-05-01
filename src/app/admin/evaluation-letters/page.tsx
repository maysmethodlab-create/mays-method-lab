import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Evaluation Letter Writer — Mays Method Lab',
};

export default function EvaluationLettersPlaceholder() {
  return (
    <section className="section pt-40 max-w-3xl">
      <ScrollReveal>
        <Link
          href="/admin"
          className="text-xs uppercase tracking-[0.2em] text-ink-secondary hover:text-ink-primary transition-colors"
        >
          &larr; Back to Admin Tools
        </Link>
      </ScrollReveal>

      <ScrollReveal>
        <div className="eyebrow-lg mt-8 mb-4">Evaluation Letter Writer</div>
      </ScrollReveal>

      <ScrollReveal>
        <h1 className="headline text-5xl md:text-6xl mb-6">
          Coming online in the next build.
        </h1>
      </ScrollReveal>

      <ScrollReveal>
        <p className="text-lg text-ink-secondary leading-relaxed mb-8">
          The four-step workflow — Setup, Upload, Generate, Download — and the three-phase AI
          pipeline are built by Prompt 2 (the Evaluation Letter Writer specification). This route
          is reserved as the host page.
        </p>
      </ScrollReveal>

      <ScrollReveal>
        <div className="card">
          <div className="eyebrow text-[11px] mb-3">Status</div>
          <div className="text-sm text-ink-secondary space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-status-success" />
              Route is live at <code className="text-ink-primary">/admin/evaluation-letters</code>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-status-warning" />
              UI, file upload, AI pipeline, and .docx export — pending Prompt 2
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
