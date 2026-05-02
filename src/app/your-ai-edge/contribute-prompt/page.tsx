import ScrollReveal from '@/components/ScrollReveal';
import ContributePromptForm from './ContributePromptForm';

export const metadata = {
  title: 'Contribute a prompt | Your AI Edge',
  description:
    'Share a prompt you use every week. The Lab reviews and credits you when it goes live.',
};

export default function ContributePromptPage() {
  return (
    <section className="section pt-24">
      <ScrollReveal>
        <div className="max-w-3xl">
          <div className="eyebrow-lg mb-4">Contribute a prompt</div>
          <h1 className="mb-6 leading-[1.1]">
            Share a prompt that earns its keep.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed">
            Got a prompt you use every week? Send it. The Lab will review it,
            tighten the wording if needed, and add it to the library with you
            credited as the contributor.
          </p>
        </div>
      </ScrollReveal>

      <div className="mt-12 max-w-3xl">
        <ContributePromptForm />
      </div>
    </section>
  );
}
