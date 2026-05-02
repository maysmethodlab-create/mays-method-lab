import ScrollReveal from '@/components/ScrollReveal';
import ConsultationForm from './ConsultationForm';

export const metadata = {
  title: 'Schedule a consultation | Your AI Edge',
  description:
    'Tell the Lab what you are working on. We respond within a week with a meeting time or a written reply.',
};

export default function ConsultationPage() {
  return (
    <section className="section pt-24">
      <ScrollReveal>
        <div className="max-w-3xl">
          <div className="eyebrow-lg mb-4">Schedule a consultation</div>
          <h1 className="mb-6 leading-[1.1]">
            Tell us what you are working on.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed">
            Three things we can help with. Pick one, give us the details, and
            we will respond within a week with a meeting time or a written
            reply.
          </p>
        </div>
      </ScrollReveal>

      <div className="mt-12 max-w-3xl">
        <ConsultationForm />
      </div>
    </section>
  );
}
