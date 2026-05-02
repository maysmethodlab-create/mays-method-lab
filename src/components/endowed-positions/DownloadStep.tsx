'use client';

import { useState } from 'react';
import type {
  GeneratedParts,
  LetterDraft,
  MRCVote,
  SetupData,
} from '@/lib/endowed-positions/types';

type Props = {
  setup: SetupData;
  votes: MRCVote[];
  voteComments: string;
  draft: LetterDraft;
  parts: GeneratedParts;
  onBack: () => void;
  onStartOver: () => void;
};

export default function DownloadStep({
  setup,
  votes,
  voteComments,
  draft,
  parts,
  onBack,
  onStartOver,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function downloadDocx() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/endowed-positions/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setup, votes, voteComments, parts }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Download failed.');
        setBusy(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safe = setup.candidateName.replace(/[^A-Za-z0-9]+/g, '_');
      a.download = `endowed_recommendation_${safe}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="text-sm text-status-error border border-status-error/40 bg-status-error/10 px-4 py-3">
          {error}
        </div>
      ) : null}

      <section className="card space-y-4">
        <div className="eyebrow text-[11px]">Final Memo</div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          Download the recommendation memorandum as a Word document. 11pt Calibri, US Letter,
          1&quot; margins, with the Mays/TAMU letterhead, both required tables (outcome + MRC
          composition), and the five-line signature block.
        </p>
        <div className="flex gap-3 flex-wrap">
          <button type="button" onClick={downloadDocx} disabled={busy} className="btn-primary">
            {busy ? 'Generating…' : 'Download Memo (.docx)'}
          </button>
        </div>
        <details className="text-xs text-ink-muted">
          <summary className="cursor-pointer hover:text-ink-secondary">Preview memo text</summary>
          <pre className="whitespace-pre-wrap mt-3 text-sm text-ink-secondary leading-relaxed font-body bg-bg-subtle p-4 max-h-[400px] overflow-auto">
            {draft.text}
          </pre>
        </details>
      </section>

      <div className="flex justify-between gap-4">
        <button type="button" onClick={onBack} className="btn-secondary">
          ← Back to Generate
        </button>
        <button type="button" onClick={onStartOver} className="btn-secondary">
          Start a New Memo
        </button>
      </div>
    </div>
  );
}
