import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Welcome aboard | Your AI Edge',
};

export default function JoinLabThanksPage() {
  return (
    <section className="section pt-24">
      <ScrollReveal>
        <div className="max-w-2xl dotted-frame bg-bg-subtle py-12 px-8 md:px-12">
          <div className="eyebrow-lg mb-4">Welcome aboard</div>
          <h1 className="mb-5 leading-[1.1]">Glad you are in.</h1>
          <p className="text-[17px] text-ink-secondary leading-relaxed mb-8">
            The Lab will reach out within a week with a way to help on the
            next round of prompts, apps, or tutorials. If your time is tight,
            we will start with a one-hour pairing.
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
