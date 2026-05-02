import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Prompt received | Your AI Edge',
};

export default function ContributePromptThanksPage() {
  return (
    <section className="section pt-24">
      <ScrollReveal>
        <div className="max-w-2xl dotted-frame bg-bg-subtle py-12 px-8 md:px-12">
          <div className="eyebrow-lg mb-4">Prompt received</div>
          <h1 className="mb-5 leading-[1.1]">Thank you for the contribution.</h1>
          <p className="text-[17px] text-ink-secondary leading-relaxed mb-3">
            The Lab will review your prompt within a week. If we publish it,
            you will be credited as the contributor and we will email you the
            link.
          </p>
          <p className="text-[17px] text-ink-secondary leading-relaxed mb-8">
            Want to send another? Or pick something else from the page.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/your-ai-edge/contribute-prompt"
              className="btn-secondary"
            >
              <span>Submit another prompt</span>
            </Link>
            <Link href="/learning-community" className="btn-primary">
              <span>Back to Your AI Edge</span>
              <span className="btn-arrow" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
