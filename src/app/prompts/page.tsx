import PromptsClient from './PromptsClient';

export const metadata = {
  title: 'Prompt library | Mays Method Lab',
  description:
    'Paste-ready AI prompts for teaching, writing, research, and admin work at Mays. Click a prompt to open the full text and an example output.',
};

export default function PromptsPage() {
  return (
    <section className="section pt-24">
      <div className="max-w-4xl mb-16">
        <div className="eyebrow-lg mb-4">Prompt library</div>
        <h1 className="mb-6 leading-[1.1]" style={{ fontSize: 'clamp(40px, 5.5vw, 64px)' }}>
          Paste-ready prompts for the work you do every week.
        </h1>
        <p className="text-[18px] text-ink-secondary leading-relaxed max-w-2xl">
          Pick a prompt. Read the full text. Copy. Paste it into TAMU AI Chat or
          your tool of choice. Each prompt opens in a side panel so you can scan
          fast.
        </p>
      </div>

      <PromptsClient />
    </section>
  );
}
