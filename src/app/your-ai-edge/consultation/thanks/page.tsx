import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Consultation request received | Your AI Edge',
};

export default function ConsultationThanksPage() {
  return (
    <section className="section pt-24">
      <ScrollReveal>
        <div className="max-w-2xl dotted-frame bg-bg-subtle py-12 px-8 md:px-12">
          <div className="eyebrow-lg mb-4">Request received</div>
          <h1 className="mb-5 leading-[1.1]">We will be in touch.</h1>
          <p className="text-[17px] text-ink-secondary leading-relaxed mb-8">
            The Lab reads every request and replies within a week. If your
            request is time-sensitive, drop a note to{' '}
            <a
              href="mailto:ssridhar@mays.tamu.edu"
              className="text-maroon underline hover:text-maroon-deep"
            >
              ssridhar@mays.tamu.edu
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-4">
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
