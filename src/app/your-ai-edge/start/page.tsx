import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Start with the right AI tool | Your AI Edge',
  description:
    'A four-step quick-start. Use the supported chat tools first, try a ready-made prompt, test one repeatable workflow, and only build bigger after the manual version works.',
};

export default function StartPage() {
  return (
    <section className="section pt-24">
      <ScrollReveal>
        <div className="max-w-3xl">
          <div className="eyebrow-lg mb-4">Step 0 · Start here</div>
          <h1 className="mb-6 leading-[1.1]">
            Start with the right AI tool.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed mb-2">
            A high-level map of the tools Mays points people toward, plus a
            few low-risk workflows you can try before building anything bigger.
          </p>
        </div>
      </ScrollReveal>

      {/* Quick start ladder */}
      <div className="mt-16 max-w-4xl">
        <div className="eyebrow text-[12px] mb-3">Quick start</div>
        <h2 className="mb-8 leading-tight">Four steps, in order.</h2>
        <ol className="space-y-5">
          <Step
            n={1}
            title="Start with the supported chat tools."
            body="Use TAMU AI Chat, Microsoft Copilot, or Google Gemini for everyday drafting, summarizing, brainstorming, and Q&A."
          />
          <Step
            n={2}
            title="Use the prompt library for common work."
            body="Try a ready-made prompt for emails, course materials, reports, meeting notes, policies, research, or student support."
          />
          <Step
            n={3}
            title="Test one repeatable workflow."
            body="Turn a form into a spreadsheet, meeting notes into action items, saved links into a digest, or approved documents into a chatbot."
          />
          <Step
            n={4}
            title="Build only after the manual version works."
            body="Move to Power Automate, Zapier, n8n, Codex, or Cursor when the steps, data, reviewers, and success checks are clear."
          />
        </ol>
      </div>

      {/* Better inputs */}
      <div className="mt-24 max-w-4xl">
        <div className="eyebrow text-[12px] mb-3">Better inputs</div>
        <h2 className="mb-8 leading-tight">Specific beats polished.</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Tip
            title="Short fields"
            body="Use exact labels: course, audience, deadline, length."
          />
          <Tip
            title="Large text boxes"
            body="Paste the actual email, notes, draft, or policy when safe to do so."
          />
          <Tip
            title="Dropdowns"
            body="Choose for the real reader, not the default setting."
          />
          <Tip
            title="Weak result"
            body="Add missing context, then ask for one revision at a time."
          />
        </div>
        <p className="text-[16px] text-ink-secondary leading-relaxed mt-8 max-w-2xl">
          Best pattern: role, audience, source material, constraints, and
          desired format. Example: "Write a 150-word email to MBA students
          about a deadline extension. Keep it direct and warm."
        </p>
      </div>

      {/* Review */}
      <div className="mt-24 max-w-4xl">
        <div className="eyebrow text-[12px] mb-3">Review</div>
        <h2 className="mb-6 leading-tight">Do a 30-second check.</h2>
        <ul className="text-[16px] text-ink-secondary leading-relaxed list-disc pl-5 space-y-2">
          <li>Names, dates, numbers, and links are correct.</li>
          <li>The tone fits the audience and situation.</li>
          <li>The draft keeps your meaning and does not invent facts.</li>
          <li>Filler, stiff phrasing, and unnecessary formatting are removed.</li>
        </ul>
        <h3 className="font-headline text-[20px] font-semibold text-maroon mt-8 mb-3">
          Useful follow-ups
        </h3>
        <ul className="text-[16px] text-ink-secondary leading-relaxed list-disc pl-5 space-y-2">
          <li>"Make this shorter and more direct."</li>
          <li>"Keep the meaning, but make it sound natural."</li>
          <li>"Revise the second paragraph so the deadline stands out."</li>
        </ul>
      </div>

      {/* Data safety */}
      <div className="mt-24 max-w-4xl dotted-frame bg-bg-subtle py-10 px-8 md:px-12">
        <div className="eyebrow text-[12px] mb-3">Data safety</div>
        <h2 className="mb-4 leading-tight">When in doubt, leave it out.</h2>
        <p className="text-[16px] text-ink-secondary leading-relaxed mb-6">
          Treat anything pasted into a public AI tool as shared with an
          outside service unless you know the tool is approved for that data.
        </p>
        <h3 className="font-headline text-[18px] font-semibold text-maroon mb-3">
          Never enter
        </h3>
        <ul className="text-[15px] text-ink-secondary leading-relaxed list-disc pl-5 space-y-1 mb-6">
          <li>Student names, A&amp;M IDs, grades, or identifiable records</li>
          <li>Health, financial, or Social Security information</li>
          <li>Passwords, tokens, account numbers, or private credentials</li>
          <li>Unpublished proprietary research or personnel review details</li>
        </ul>
        <h3 className="font-headline text-[18px] font-semibold text-maroon mb-3">
          Safer moves
        </h3>
        <ul className="text-[15px] text-ink-secondary leading-relaxed list-disc pl-5 space-y-1">
          <li>Replace names with labels like "Student A."</li>
          <li>Summarize sensitive situations without identifying details.</li>
          <li>Use TAMU-approved tools for protected university work.</li>
        </ul>
      </div>

      {/* Next links */}
      <div className="mt-20 grid md:grid-cols-2 gap-6 max-w-4xl">
        <NextLink
          href="/your-ai-edge/pick-a-tool"
          eyebrow="Step 1"
          label="Which AI tool fits your task?"
        />
        <NextLink
          href="/prompts"
          eyebrow="Step 2"
          label="Browse the prompt library"
        />
      </div>
    </section>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="dotted-frame bg-white py-6 px-6 md:px-8">
      <div className="grid md:grid-cols-[auto,1fr] gap-4 md:gap-8 items-start">
        <div className="font-headline text-maroon text-[40px] leading-none">
          {n}
        </div>
        <div>
          <h3 className="font-headline text-[22px] font-semibold text-maroon mb-2 leading-tight">
            {title}
          </h3>
          <p className="text-[16px] text-ink-secondary leading-relaxed">
            {body}
          </p>
        </div>
      </div>
    </li>
  );
}

function Tip({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-2 border-maroon-muted/40 p-5 bg-white">
      <h3 className="font-headline text-[18px] font-semibold text-maroon mb-2 leading-tight">
        {title}
      </h3>
      <p className="text-[15px] text-ink-secondary leading-relaxed">{body}</p>
    </div>
  );
}

function NextLink({
  href,
  eyebrow,
  label,
}: {
  href: string;
  eyebrow: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white border-2 border-maroon p-6 hover:bg-maroon/5 transition-colors"
    >
      <div className="eyebrow text-[11px] mb-2">{eyebrow}</div>
      <div className="font-headline text-[20px] font-semibold text-maroon leading-tight">
        {label} &rarr;
      </div>
    </Link>
  );
}
