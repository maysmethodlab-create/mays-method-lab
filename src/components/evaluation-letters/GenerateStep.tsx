'use client';

import { useState } from 'react';
import type {
  LetterDraft,
  ResearchBrief,
  SetupData,
  UploadedFile,
  VerificationResult,
} from '@/lib/evaluation-letters/types';

type Phase = 'idle' | 'researching' | 'review-brief' | 'drafting' | 'review-draft' | 'verifying' | 'done';

type Props = {
  setup: SetupData;
  files: UploadedFile[];
  notes: string;
  brief: ResearchBrief | null;
  draft: LetterDraft | null;
  verification: VerificationResult | null;
  onBriefChange: (b: ResearchBrief | null) => void;
  onDraftChange: (d: LetterDraft | null) => void;
  onVerificationChange: (v: VerificationResult | null) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function GenerateStep({
  setup,
  files,
  notes,
  brief,
  draft,
  verification,
  onBriefChange,
  onDraftChange,
  onVerificationChange,
  onBack,
  onContinue,
}: Props) {
  const [phase, setPhase] = useState<Phase>(
    verification ? 'done' : draft ? 'review-draft' : brief ? 'review-brief' : 'idle',
  );
  const [error, setError] = useState<string | null>(null);
  const [streamedDraft, setStreamedDraft] = useState<string>(draft?.text || '');

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
            teachingRating: setup.teachingRating,
            researchRating: setup.researchRating,
            serviceRating: setup.serviceRating,
            overallRating: setup.overallRating,
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
        body: JSON.stringify({
          letterText: draft.text,
          sourceDocuments,
        }),
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
      // If a corrected text came back, swap it into the draft.
      if (data.correctedText) {
        onDraftChange({ text: data.correctedText, generatedAt: new Date().toISOString() });
        setStreamedDraft(data.correctedText);
      }
      setPhase('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
      setPhase('review-draft');
    }
  }

  return (
    <div className="space-y-8">
      {/* Phase progress */}
      <PhaseTracker phase={phase} />

      {error ? (
        <div className="text-sm text-status-error border border-status-error/40 bg-status-error/10 rounded-md px-4 py-3">
          {error}
        </div>
      ) : null}

      {/* Phase 1 controls */}
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

      {/* Phase 1 review */}
      {brief && (phase === 'review-brief' || phase === 'drafting' || phase === 'review-draft' || phase === 'verifying' || phase === 'done') ? (
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

      {/* Phase 2 review */}
      {draft && (phase === 'review-draft' || phase === 'verifying' || phase === 'done') ? (
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

      {phase === 'verifying' ? <Working label="Verifying claims and checking for AI-language patterns" /> : null}

      {/* Phase 3 review */}
      {verification && phase === 'done' ? (
        <VerificationPanel result={verification} />
      ) : null}

      {/* Footer */}
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
    { key: 'research', label: '1 · Research', states: ['researching', 'review-brief', 'drafting', 'review-draft', 'verifying', 'done'] },
    { key: 'draft', label: '2 · Draft', states: ['drafting', 'review-draft', 'verifying', 'done'] },
    { key: 'verify', label: '3 · Verify', states: ['verifying', 'done'] },
  ] as const;

  return (
    <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.2em]">
      {items.map((it) => {
        const active = (it.states as readonly string[]).includes(phase);
        const done =
          (it.key === 'research' && ['review-brief', 'drafting', 'review-draft', 'verifying', 'done'].includes(phase)) ||
          (it.key === 'draft' && ['review-draft', 'verifying', 'done'].includes(phase)) ||
          (it.key === 'verify' && phase === 'done');
        return (
          <div
            key={it.key}
            className={`px-3 py-2 rounded-md border ${
              done
                ? 'border-status-success/40 text-status-success bg-status-success/10'
                : active
                  ? 'border-maroon text-ink-primary bg-maroon/10'
                  : 'border-line text-ink-muted'
            }`}
          >
            {done ? '✓ ' : ''}{it.label}
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
        <div className="eyebrow text-[11px]">Phase 2 — Draft Letter</div>
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
          ✓ Corrected text was applied to the draft above.
        </div>
      ) : null}
    </section>
  );
}
