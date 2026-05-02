'use client';

import { useState } from 'react';
import type {
  GeneratedParts,
  LetterDraft,
  MRCVote,
  SetupData,
  UploadedFile,
} from '@/lib/endowed-positions/types';

type Phase = 'idle' | 'drafting' | 'review' | 'verifying' | 'done';

type Props = {
  setup: SetupData;
  files: UploadedFile[];
  votes: MRCVote[];
  draft: LetterDraft | null;
  parts: GeneratedParts | null;
  onDraftChange: (d: LetterDraft | null) => void;
  onPartsChange: (p: GeneratedParts | null) => void;
  onBack: () => void;
  onContinue: () => void;
};

const MODEL_JSON_OPEN = '<<<MODEL_JSON>>>';
const MODEL_JSON_CLOSE = '<<<END_MODEL_JSON>>>';

export default function GenerateStep({
  setup,
  files,
  votes,
  draft,
  parts,
  onDraftChange,
  onPartsChange,
  onBack,
  onContinue,
}: Props) {
  const [phase, setPhase] = useState<Phase>(draft ? 'review' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [streamed, setStreamed] = useState<string>(draft?.text || '');

  const sourceDocuments = files
    .map((f) => `===== ${f.kind.toUpperCase()} — ${f.filename} =====\n${f.text}`)
    .join('\n\n');

  async function runDraft() {
    setError(null);
    setPhase('drafting');
    setStreamed('');
    try {
      const res = await fetch('/api/endowed-positions/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setup, votes, sourceDocuments }),
      });
      if (!res.ok || !res.body) {
        const t = await res.text();
        setError(t || 'Draft phase failed.');
        setPhase('idle');
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        // Extract the model JSON sentinel if present, then strip it.
        let visible = acc;
        const open = visible.indexOf(MODEL_JSON_OPEN);
        const close = visible.indexOf(MODEL_JSON_CLOSE);
        if (open >= 0 && close > open) {
          const json = visible.slice(open + MODEL_JSON_OPEN.length, close);
          try {
            const parsed = JSON.parse(json) as GeneratedParts;
            onPartsChange(parsed);
          } catch {
            // ignore
          }
          visible = visible.slice(0, open) + visible.slice(close + MODEL_JSON_CLOSE.length);
        }
        setStreamed(visible);
      }
      // Finalize
      let finalText = acc;
      const o = finalText.indexOf(MODEL_JSON_OPEN);
      const c = finalText.indexOf(MODEL_JSON_CLOSE);
      let modelJson: string | undefined;
      if (o >= 0 && c > o) {
        modelJson = finalText.slice(o + MODEL_JSON_OPEN.length, c);
        finalText = finalText.slice(0, o) + finalText.slice(c + MODEL_JSON_CLOSE.length);
      }
      onDraftChange({ text: finalText, modelJson, generatedAt: new Date().toISOString() });
      setStreamed(finalText);
      setPhase('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
      setPhase('idle');
    }
  }

  async function runVerify() {
    if (!draft) return;
    setError(null);
    setPhase('verifying');
    try {
      const res = await fetch('/api/endowed-positions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterText: draft.text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Verify phase failed.');
        setPhase('review');
        return;
      }
      if (data.correctedText && data.correctedText !== draft.text) {
        onDraftChange({ ...draft, text: data.correctedText });
        setStreamed(data.correctedText);
      }
      setPhase('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
      setPhase('review');
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="text-sm text-status-error border border-status-error/40 bg-status-error/10 px-4 py-3">
          {error}
        </div>
      ) : null}

      {phase === 'idle' ? (
        <section className="card text-center py-12">
          <p className="text-ink-secondary mb-6">
            The AI will read the dept-head letter and the candidate&apos;s CV, then write the
            four variable-content fields (subject line, opening sentence, summary reasons,
            achievement paragraph). The institutional boilerplate is stitched in automatically.
          </p>
          <button type="button" onClick={runDraft} className="btn-primary">
            Generate Memo
          </button>
        </section>
      ) : null}

      {phase === 'drafting' ? (
        <section className="card">
          <div className="eyebrow text-[11px] mb-3">Drafting…</div>
          <div className="progress-bar mb-4" />
          <pre className="whitespace-pre-wrap text-sm text-ink-primary leading-relaxed font-body bg-bg-subtle p-4 max-h-[420px] overflow-auto">
            {streamed || '…'}
          </pre>
        </section>
      ) : null}

      {parts && phase !== 'idle' && phase !== 'drafting' ? (
        <section className="card">
          <div className="eyebrow text-[11px] mb-3">AI-generated fields</div>
          <div className="grid gap-3 text-sm">
            <Field label="Subject line" value={parts.subjectLine} onChange={(v) => onPartsChange({ ...parts, subjectLine: v })} />
            <Field label="Opening sentence" value={parts.openingSentence} onChange={(v) => onPartsChange({ ...parts, openingSentence: v })} multiline />
            <Field label="Summary reasons clause" value={parts.summaryReasonsClause} onChange={(v) => onPartsChange({ ...parts, summaryReasonsClause: v })} multiline />
            <Field label="Achievement paragraph" value={parts.achievementParagraph} onChange={(v) => onPartsChange({ ...parts, achievementParagraph: v })} multiline />
          </div>
        </section>
      ) : null}

      {draft && (phase === 'review' || phase === 'verifying' || phase === 'done') ? (
        <section className="card">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="eyebrow text-[11px]">Memo body (assembled)</div>
            <div className="text-[11px] text-ink-muted">Editable</div>
          </div>
          <textarea
            className="input min-h-[420px] font-body text-sm leading-relaxed"
            value={draft.text}
            onChange={(e) => onDraftChange({ ...draft, text: e.target.value })}
          />
          <div className="mt-4 flex gap-3 flex-wrap justify-end">
            <button
              type="button"
              onClick={runDraft}
              disabled={phase === 'verifying'}
              className="btn-secondary"
            >
              Regenerate
            </button>
            {phase === 'review' ? (
              <button type="button" onClick={runVerify} className="btn-primary">
                Run Sanitizer
                <span className="btn-arrow" aria-hidden="true">&rarr;</span>
              </button>
            ) : null}
            {phase === 'done' ? (
              <span className="text-[11px] uppercase tracking-[0.18em] text-status-success font-semibold self-center">
                Sanitizer pass complete ✓
              </span>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="flex justify-between gap-4">
        <button type="button" onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={phase !== 'done' && phase !== 'review'}
          className="btn-primary"
        >
          Continue to Download
          <span className="btn-arrow" aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <div className="label">{label}</div>
      {multiline ? (
        <textarea
          className="input min-h-[100px] text-sm font-body"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
