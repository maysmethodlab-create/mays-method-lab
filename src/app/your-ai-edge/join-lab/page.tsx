import ScrollReveal from '@/components/ScrollReveal';
import JoinLabForm from './JoinLabForm';

export const metadata = {
  title: 'Join the Lab | Your AI Edge',
  description:
    'Faculty and staff who want to help shape the next round of prompts, apps, and tutorials. Beta testers, contributors, and co-builders welcome.',
};

export default function JoinLabPage() {
  return (
    <section className="section pt-24">
      <ScrollReveal>
        <div className="max-w-3xl">
          <div className="eyebrow-lg mb-4">Join the Lab</div>
          <h1 className="mb-6 leading-[1.1]">Help shape what comes next.</h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed">
            The Lab works in small batches. Faculty, staff, and student
            fellows pair with us to ship one prompt, one app, or one tutorial
            at a time. Tell us how you want to help and we will match you to
            the next round.
          </p>
        </div>
      </ScrollReveal>

      <div className="mt-12 max-w-3xl">
        <JoinLabForm />
      </div>
    </section>
  );
}
