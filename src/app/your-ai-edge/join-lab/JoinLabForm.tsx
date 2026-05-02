'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const HELP_OPTIONS = [
  'Beta-test new apps',
  'Contribute prompts',
  'Co-build apps',
  'Help review submissions',
  'Other',
];

export default function JoinLabForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contributorName, setContributorName] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');
  const [contributorRole, setContributorRole] = useState<
    'faculty' | 'staff' | 'student' | 'other'
  >('faculty');
  const [helpWith, setHelpWith] = useState<string[]>([]);
  const [whyInterested, setWhyInterested] = useState('');

  function toggleHelp(option: string) {
    setHelpWith((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!contributorName.trim() || !contributorEmail.trim()) {
      setError('Name and email are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/join-lab', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contributorName: contributorName.trim(),
          contributorEmail: contributorEmail.trim(),
          contributorRole,
          helpWith,
          whyInterested: whyInterested.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed');
      }
      const data = await res.json();
      const mailto = data.mailto as string | undefined;
      if (mailto) window.open(mailto, '_blank');
      router.push('/your-ai-edge/join-lab/thanks');
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
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Your name *">
            <input
              type="text"
              required
              className="input"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
            />
          </Field>
          <Field label="Your email *">
            <input
              type="email"
              required
              className="input"
              value={contributorEmail}
              onChange={(e) => setContributorEmail(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Your role">
          <div className="flex flex-wrap gap-3">
            {(['faculty', 'staff', 'student', 'other'] as const).map((r) => (
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

        <Field label="How do you want to help?">
          <div className="flex flex-wrap gap-3">
            {HELP_OPTIONS.map((option) => (
              <Checkbox
                key={option}
                checked={helpWith.includes(option)}
                onChange={() => toggleHelp(option)}
                label={option}
              />
            ))}
          </div>
        </Field>

        <Field label="Why are you interested? (optional)">
          <textarea
            className="input"
            rows={5}
            value={whyInterested}
            onChange={(e) => setWhyInterested(e.target.value)}
            placeholder="A workflow you wish was easier, an idea you have been turning over, anything that would help us match you well."
          />
        </Field>

        {error ? (
          <p className="text-[14px] text-maroon font-semibold">{error}</p>
        ) : null}

        <div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            <span>{submitting ? 'Sending...' : 'Send to the Lab'}</span>
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
        'inline-flex items-center gap-2 px-4 py-2 border-2 cursor-pointer text-[14px] font-semibold',
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
        'inline-flex items-center gap-2 px-4 py-2 border-2 cursor-pointer text-[14px] font-semibold',
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
