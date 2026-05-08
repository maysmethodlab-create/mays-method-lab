'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const INTAKE_TYPES = [
  {
    value: 'help-with-something-specific',
    label: 'Help with something specific',
  },
  { value: 'build-me-a-custom-app', label: 'Build me a custom app' },
  { value: 'idea-or-question', label: 'I have an idea or question' },
] as const;

type IntakeType = (typeof INTAKE_TYPES)[number]['value'];

export default function ConsultationForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contributorName, setContributorName] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');
  const [intakeType, setIntakeType] = useState<IntakeType>(
    'help-with-something-specific',
  );
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [bestMeetingTimes, setBestMeetingTimes] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (
      !contributorName.trim() ||
      !contributorEmail.trim() ||
      !details.trim()
    ) {
      setError('Name, email, and details are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contributorName: contributorName.trim(),
          contributorEmail: contributorEmail.trim(),
          intakeType,
          subject: subject.trim(),
          details: details.trim(),
          bestMeetingTimes: bestMeetingTimes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed');
      }
      const data = await res.json();
      const mailto = data.mailto as string | undefined;
      if (mailto) window.open(mailto, '_blank');
      router.push('/your-ai-edge/consultation/thanks');
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

        <Field label="What kind of help? *">
          <div className="flex flex-col gap-3">
            {INTAKE_TYPES.map((t) => (
              <RadioOption
                key={t.value}
                name="intakeType"
                value={t.value}
                checked={intakeType === t.value}
                onChange={() => setIntakeType(t.value)}
                label={t.label}
              />
            ))}
          </div>
        </Field>

        <Field label="One-line subject">
          <input
            type="text"
            className="input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Practice exam workflow for PHIL 1700"
          />
        </Field>

        <Field label="Details *">
          <textarea
            required
            className="input"
            rows={8}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe what you are trying to do. Paste any context, sample inputs, or example outputs that would help us understand."
          />
        </Field>

        <Field label="Best meeting times (optional)">
          <textarea
            className="input"
            rows={3}
            value={bestMeetingTimes}
            onChange={(e) => setBestMeetingTimes(e.target.value)}
            placeholder="Tuesdays after 2pm, Thursdays before noon, etc."
          />
        </Field>

        {error ? (
          <p className="text-[16px] text-maroon font-semibold">{error}</p>
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

function RadioOption({
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
        'inline-flex items-center gap-3 px-4 py-3 border-2 cursor-pointer text-[16px] font-semibold',
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
      <span>{label}</span>
    </label>
  );
}
