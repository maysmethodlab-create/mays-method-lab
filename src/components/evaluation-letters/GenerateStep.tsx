'use client';

import { useState } from 'react';
import {
  RATING_LEVELS,
  getRoleCategory,
  type Rating,
} from '@/lib/evaluation-letters/role-categories';
import type {
  LetterDraft,
  ResearchBrief,
  SetupData,
  UploadedFile,
  VerificationResult,
} from '@/lib/evaluation-letters/types';

type Phase =
  | 'idle'
  | 'researching'
  | 'review-brief'
  | 'drafting'
  | 'review-draft'
  | 'verifying'
  | 'rate'
  | 'done';

type Props = {
  setup: SetupData;
  files: UploadedFile[];
  notes: string;
  brief: ResearchBrief | null;
  draft: LetterDraft | null;
  verification: VerificationResult | null;
  onSetupChange: (s: SetupData) => void;
  onBriefChange: (b: ResearchBrief | null) => void;
  onDraftChange: (d: LetterDraft | null) => void;
  onVerificationChange: (v: VerificationResult | null) => void;
  onBack: () => void;
  onContinue: () => void;
};

const RATING_DEFINITIONS: Record<Rating, string> = {
  Excellent:
    'Performance that meets and exceeds norms and expectations, reflected by substantive indicators of excellence.',
  Effective:
    'Performance that meets norms and expectations, reflected by substantive indicators of effective performance.',
  'Needs Improvement':
    'Performance that falls below norms and expectations of effective performance.',
  Unsatisfactory:
    'Performance that falls below norms and expectations of excellent, effective, and needs improvement performance.',
};

export default function GenerateStep({
  setup,
  files,
  notes,
  brief,
  draft,
  verification,
  onSetupChange,
  onBriefChange,
  onDraftChange,
  onVerificationChange,
  onBack,
  onContinue,
}: Props) {
  const [phase, setPhase] = useState<Phase>(
    verification && setup.overallRating
      ? 'done'
      : verification
        ? 'rate'
        : draft
          ? 'review-draft'
          : brief
            ? 'review-brief'
            : 'idle',
  );
  const [error, setError] = useState<string | null>(null);
  const [streamedDraft, setStreamedDraft] = useState<string>(draft?.text || '');

  const role = getRoleCategory(setup.roleCategoryId);
  const hasResearch = role?.required.includes('research') || false;
  const hasService = role?.required.includes('service') || false;

  const sourceDocuments = files
    .map((f) => `===== ${f.kind.toUpperCase()} — ${f.filename} =====\n${f.text}`)
    .join('\n\n');

  async function runResearch() {
    setError(null);
    setPhase('researching');
    try {
      const res = await fetch('/api/evaluation-letters/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceDocuments }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Research phase failed.');
        setPhase('idle');
        return;
      }
      onBriefChange({ raw: data.brief, generatedAt: new Date().toISOString() });
      setPhase('review-brief');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
      setPhase('idle');
    }
  }

  async function runDraft() {
    if (!brief) return;
    setError(null);
    setPhase('drafting');
    setStreamedDraft('');
    try {
      const res = await fetch('/api/evaluation-letters/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setup: {
            writerId: setup.writerId,
            evaluationYear: setup.evaluationYear,
            recipientName: setup.recipientName,
            recipientTitle: setup.recipientTitle,
            recipientDepartment: setup.recipientDepartment,
            roleCategoryId: setup.roleCategoryId,
          },
          researchBrief: brief.raw,
          writerNotes: notes,
        }),
      });
      if (!res.ok || !res.body) {
        const t = await res.text();
        setError(t || 'Draft phase failed.');
        setPhase('review-brief');
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreamedDraft(acc);
      }
      onDraftChange({ text: acc, generatedAt: new Date().toISOString() });
      setPhase('review-draft');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Streaming error.');
      setPhase('review-brief');
    }
  }

  async function runVerify() {
    if (!draft) return;
    setError(null);
    setPhase('verifying');
    try {
      const res = await fetch('/api/evaluation-letters/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterText: draft.text, sourceDocuments }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Verify phase failed.');
        setPhase('review-draft');
        return;
      }
      const result: VerificationResult = {
        report: data.report,
        correctedText: data.correctedText,
        generatedAt: new Date().toISOString(),
      };
      onVerificationChange(result);
      if (data.correctedText) {
        onDraftChange({ text: data.correctedText, generatedAt: new Date().toISOString() });
        setStreamedDraft(data.correctedText);
      }
      setPhase('rate');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
      setPhase('review-draft');
    }
  }

  async function runAppendSummary() {
    if (!draft) return;
    setError(null);
    try {
      const res = await fetch('/api/evaluation-letters/append-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: setup.recipientName,
          roleCategoryId: setup.roleCategoryId,
          teachingRating: setup.teachingRating,
          researchRating: setup.researchRating,
          serviceRating: setup.serviceRating,
          overallRating: setup.overallRating,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Could not generate Summary.');
        return;
      }
      const summaryAppended = `${draft.text.replace(/\s+$/, '')}\n\n${data.summary}\n`;
      onDraftChange({ text: summaryAppended, generatedAt: new Date().toISOString() });
      setStreamedDraft(summaryAppended);
      setPhase('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
    }
  }

  const ratingsValid =
    Boolean(setup.overallRating) &&
    Boolean(setup.teachingRating) &&
    (!hasResearch || Boolean(setup.researchRating)) &&
    (!hasService || Boolean(setup.serviceRating));

  return (
    <div className="space-y-8">
      <PhaseTracker phase={phase} />

      {error ? (
        <div className="text-sm text-status-error border border-status-error/40 bg-status-error/10 rounded-md px-4 py-3">
          {error}
        </div>
      ) : null}

      {phase === 'idle' ? (
        <section className="card text-center py-12">
          <p className="text-ink-secondary mb-6">
            Start with Phase 1: have Claude read your uploads and produce a research brief.
          </p>
          <button type="button" onClick={runResearch} className="btn-primary">
            Generate Research Brief
          </button>
        </section>
      ) : null}

      {phase === 'researching' ? <Working label="Reading documents and extracting facts" /> : null}

      {brief && phase !== 'idle' && phase !== 'researching' ? (
        <BriefPanel
          brief={brief}
          onChange={(text) => onBriefChange({ raw: text, generatedAt: brief.generatedAt })}
          actions={
            phase === 'review-brief' ? (
              <button type="button" onClick={runDraft} className="btn-primary">
                Generate Draft Letter →
              </button>
            ) : null
          }
        />
      ) : null}

      {phase === 'drafting' ? (
        <section className="card">
          <div className="eyebrow text-[11px] mb-3">Phase 2 — Drafting (streaming)</div>
          <div className="progress-bar mb-4" />
          <pre className="whitespace-pre-wrap text-sm text-ink-primary leading-relaxed font-body">
            {streamedDraft || '…'}
          </pre>
        </section>
      ) : null}

      {draft && (phase === 'review-draft' || phase === 'verifying' || phase === 'rate' || phase === 'done') ? (
        <DraftPanel
          draft={draft}
          onChange={(text) => onDraftChange({ text, generatedAt: draft.generatedAt })}
          actions={
            phase === 'review-draft' ? (
              <button type="button" onClick={runVerify} className="btn-primary">
                Verify Letter →
              </button>
            ) : null
          }
        />
      ) : null}

      {phase === 'verifying' ? <Working label="Verifying claims and fixing AI-language patterns" /> : null}

      {verification && (phase === 'rate' || phase === 'done') ? (
        <VerificationPanel result={verification} />
      ) : null}

      {/* RATE PANEL — appears after Verify, before Download */}
      {phase === 'rate' || phase === 'done' ? (
        <section className="card space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="eyebrow text-[11px] mb-1">Now rate the recipient</div>
              <p className="text-sm text-ink-secondary leading-relaxed max-w-2xl">
                You&apos;ve seen the body of the letter and the verification.
                Pick the per-area ratings and the overall rating. The formal
                Summary paragraph will be appended automatically.
              </p>
            </div>
            {phase === 'done' ? (
              <span className="text-[11px] uppercase tracking-[0.18em] text-status-success font-semibold">
                Summary appended ✓
              </span>
            ) : null}
          </div>

          <details className="text-sm text-ink-secondary border border-line rounded p-3">
            <summary className="cursor-pointer font-semibold text-ink-primary">
              Mays Guidelines §3 — rating definitions
            </summary>
            <ul className="mt-3 space-y-2 list-none">
              {(Object.keys(RATING_DEFINITIONS) as Rating[]).map((r) => (
                <li key={r}>
                  <span className="font-semibold text-ink-primary">{r}:</span>{' '}
                  {RATING_DEFINITIONS[r]}
                </li>
              ))}
            </ul>
          </details>

          <div className="grid sm:grid-cols-2 gap-4">
            <RatingField
              label="Teaching"
              value={setup.teachingRating}
              onChange={(v) => onSetupChange({ ...setup, teachingRating: v })}
              required
            />
            {hasResearch ? (
              <RatingField
                label="Research and Publication"
                value={setup.researchRating}
                onChange={(v) => onSetupChange({ ...setup, researchRating: v })}
                required
              />
            ) : null}
            {hasService ? (
              <RatingField
                label="Service"
                value={setup.serviceRating}
                onChange={(v) => onSetupChange({ ...setup, serviceRating: v })}
                required
              />
            ) : null}
            <RatingField
              label="Overall"
              value={setup.overallRating}
              onChange={(v) => onSetupChange({ ...setup, overallRating: v })}
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={runAppendSummary}
              disabled={!ratingsValid}
              className="btn-primary"
            >
              {phase === 'done' ? 'Re-append Summary' : 'Append Summary →'}
            </button>
          </div>
        </section>
      ) : null}

      <div className="flex justify-between gap-4">
        <button type="button" onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <div className="flex gap-3">
          {phase === 'done' ? (
            <button type="button" onClick={runResearch} className="btn-secondary">
              Restart from Research
            </button>
          ) : null}
          <button
            type="button"
            onClick={onContinue}
            disabled={phase !== 'done'}
            className="btn-primary"
          >
            Continue to Download →
          </button>
        </div>
      </div>
    </div>
  );
}

function PhaseTracker({ phase }: { phase: Phase }) {
  const items = [
    { key: 'research', label: '1 · Research' },
    { key: 'draft', label: '2 · Draft' },
    { key: 'verify', label: '3 · Verify' },
    { key: 'rate', label: '4 · Rate' },
  ] as const;
  const order = ['research', 'draft', 'verify', 'rate'];
  const phaseToStep: Record<Phase, number> = {
    idle: -1,
    researching: 0,
    'review-brief': 0,
    drafting: 1,
    'review-draft': 1,
    verifying: 2,
    rate: 3,
    done: 4,
  };
  const cur = phaseToStep[phase];

  return (
    <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.2em]">
      {items.map((it, i) => {
        const idx = order.indexOf(it.key);
        const done = idx < cur;
        const active = idx === cur;
        return (
          <div
            key={it.key}
            className={`px-3 py-2 rounded-md border ${
              done
                ? 'border-status-success/40 text-status-success bg-status-success/10'
                : active
                  ? 'border-maroon text-maroon bg-maroon/10'
                  : 'border-line text-ink-muted'
            }`}
          >
            {done ? '✓ ' : ''}
            {it.label}
          </div>
        );
      })}
    </div>
  );
}

function Working({ label }: { label: string }) {
  return (
    <section className="card">
      <div className="eyebrow text-[11px] mb-3">Working</div>
      <p className="text-sm text-ink-secondary mb-4">{label}…</p>
      <div className="progress-bar" />
    </section>
  );
}

function BriefPanel({
  brief,
  onChange,
  actions,
}: {
  brief: ResearchBrief;
  onChange: (text: string) => void;
  actions?: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="eyebrow text-[11px]">Phase 1 — Research Brief</div>
        <div className="text-[11px] text-ink-muted">Editable</div>
      </div>
      <textarea
        className="input min-h-[320px] font-body text-sm leading-relaxed"
        value={brief.raw}
        onChange={(e) => onChange(e.target.value)}
      />
      {actions ? <div className="mt-4 flex justify-end">{actions}</div> : null}
    </section>
  );
}

function DraftPanel({
  draft,
  onChange,
  actions,
}: {
  draft: LetterDraft;
  onChange: (text: string) => void;
  actions?: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="eyebrow text-[11px]">Letter Body</div>
        <div className="text-[11px] text-ink-muted">Editable</div>
      </div>
      <textarea
        className="input min-h-[480px] font-body text-sm leading-relaxed"
        value={draft.text}
        onChange={(e) => onChange(e.target.value)}
      />
      {actions ? <div className="mt-4 flex justify-end">{actions}</div> : null}
    </section>
  );
}

function VerificationPanel({ result }: { result: VerificationResult }) {
  return (
    <section className="card">
      <div className="eyebrow text-[11px] mb-3">Phase 3 — Verification Report</div>
      <pre className="whitespace-pre-wrap text-sm text-ink-secondary leading-relaxed font-body">
        {result.report}
      </pre>
      {result.correctedText ? (
        <div className="mt-3 text-xs text-status-success">
          ✓ Corrected text was applied to the body above.
        </div>
      ) : null}
    </section>
  );
}

function RatingField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: Rating | undefined;
  onChange: (v: Rating | undefined) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="label">
        {label}
        {required ? ' *' : ''}
      </div>
      <select
        className="input"
        value={value || ''}
        onChange={(e) => onChange((e.target.value as Rating) || undefined)}
      >
        <option value="">— Select —</option>
        {RATING_LEVELS.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </label>
  );
}
