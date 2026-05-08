'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const BUCKETS = [
  { value: 'research', label: 'Research' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'writing', label: 'Writing' },
  { value: 'programs', label: 'Programs' },
  { value: 'faculty-support', label: 'Faculty support' },
  { value: 'advising', label: 'Advising' },
  { value: 'learning-ai', label: 'Learning AI' },
];

const TOOL_OPTIONS = [
  'TAMU AI Chat',
  'Microsoft Copilot',
  'Google Gemini',
  'Google NotebookLM',
  'Other',
];

export default function ContributePromptForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contributorName, setContributorName] = useState('');
  const [contributorRole, setContributorRole] = useState<
    'faculty' | 'staff' | 'student'
  >('faculty');
  const [promptTitle, setPromptTitle] = useState('');
  const [bucket, setBucket] = useState('writing');
  const [promptText, setPromptText] = useState('');
  const [exampleOutput, setExampleOutput] = useState('');
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);

  function toggleTool(tool: string) {
    setToolsUsed((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!contributorName.trim() || !promptTitle.trim() || !promptText.trim()) {
      setError(
        'Your name, the prompt title, and the prompt text are required.',
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/contribute-prompt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contributorName: contributorName.trim(),
          contributorRole,
          promptTitle: promptTitle.trim(),
          bucket,
          promptText: promptText.trim(),
          exampleOutput: exampleOutput.trim() || undefined,
          toolsUsed,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed');
      }
      const data = await res.json();
      const mailto = data.mailto as string | undefined;
      if (mailto) {
        // Open the user's mail client in a new tab so the Lab also gets a
        // copy via email until outbound email is wired up server-side.
        window.open(mailto, '_blank');
      }
      router.push('/your-ai-edge/contribute-prompt/thanks');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.',
      );
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="dotted-frame bg-white py-10 px-8 md:px-12"
    >
      <div className="space-y-8">
        <Field label="Your name *">
          <input
            type="text"
            required
            className="input"
            value={contributorName}
            onChange={(e) => setContributorName(e.target.value)}
            placeholder="Jane Doe"
          />
        </Field>

        <Field label="Your role">
          <div className="flex flex-wrap gap-3">
            {(['faculty', 'staff', 'student'] as const).map((r) => (
              <RadioPill
                key={r}
                name="contributorRole"
                value={r}
                checked={contributorRole === r}
                onChange={() => setContributorRole(r)}
                label={r.charAt(0).toUpperCase() + r.slice(1)}
              />
            ))}
          </div>
        </Field>

        <Field label="Prompt title *">
          <input
            type="text"
            required
            className="input"
            value={promptTitle}
            onChange={(e) => setPromptTitle(e.target.value)}
            placeholder="Draft a practice exam from a syllabus"
          />
        </Field>

        <Field label="Bucket">
          <select
            className="input"
            value={bucket}
            onChange={(e) => setBucket(e.target.value)}
          >
            {BUCKETS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="The prompt text *">
          <textarea
            required
            className="input"
            rows={8}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Paste the full prompt here. Include the role, audience, source material, constraints, and desired format."
          />
        </Field>

        <Field label="Example output (optional)">
          <textarea
            className="input"
            rows={5}
            value={exampleOutput}
            onChange={(e) => setExampleOutput(e.target.value)}
            placeholder="Paste an illustrative output if you have one. This helps the Lab review faster."
          />
        </Field>

        <Field label="Tools you used it with">
          <div className="flex flex-wrap gap-3">
            {TOOL_OPTIONS.map((tool) => (
              <Checkbox
                key={tool}
                checked={toolsUsed.includes(tool)}
                onChange={() => toggleTool(tool)}
                label={tool}
              />
            ))}
          </div>
        </Field>

        {error ? (
          <p className="text-[16px] text-maroon font-semibold">{error}</p>
        ) : null}

        <div>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            <span>{submitting ? 'Sending...' : 'Submit prompt'}</span>
            <span className="btn-arrow" aria-hidden="true">
              &rarr;
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function RadioPill({
  name,
  value,
  checked,
  onChange,
  label,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      className={[
        'inline-flex items-center gap-2 px-4 py-2 border-2 cursor-pointer text-[16px] font-semibold',
        checked
          ? 'bg-maroon text-white border-maroon'
          : 'bg-white text-maroon border-maroon hover:bg-maroon/5',
      ].join(' ')}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {label}
    </label>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      className={[
        'inline-flex items-center gap-2 px-4 py-2 border-2 cursor-pointer text-[16px] font-semibold',
        checked
          ? 'bg-maroon text-white border-maroon'
          : 'bg-white text-maroon border-maroon hover:bg-maroon/5',
      ].join(' ')}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {label}
    </label>
  );
}
