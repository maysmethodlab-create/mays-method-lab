'use client';

import { useState } from 'react';
import type { LetterDraft, SetupData } from '@/lib/evaluation-letters/types';

type Props = {
  setup: SetupData;
  draft: LetterDraft;
  onBack: () => void;
  onStartOver: () => void;
};

export default function DownloadStep({ setup, draft, onBack, onStartOver }: Props) {
  const [emailText, setEmailText] = useState<string>('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateEmail() {
    setError(null);
    setEmailLoading(true);
    try {
      const res = await fetch('/api/evaluation-letters/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writerId: setup.writerId,
          recipientName: setup.recipientName,
          recipientEmail: setup.recipientEmail || '',
          letterText: draft.text,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Email generation failed.');
        return;
      }
      setEmailText(data.email);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setEmailLoading(false);
    }
  }

  async function downloadDocx(kind: 'letter' | 'email') {
    const text = kind === 'letter' ? draft.text : emailText;
    if (!text) return;
    setError(null);
    try {
      const res = await fetch('/api/evaluation-letters/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          text,
          writerId: setup.writerId,
          recipientName: setup.recipientName,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Download failed.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${kind === 'letter' ? 'evaluation_letter' : 'accompanying_email'}_${setup.recipientName.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download error.');
    }
  }

  return (
    <div className="space-y-8">
      {error ? (
        <div className="text-sm text-status-error border border-status-error/40 bg-status-error/10 rounded-md px-4 py-3">
          {error}
        </div>
      ) : null}

      <section className="card space-y-4">
        <div className="eyebrow text-[11px]">Final Letter</div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          Download the finished evaluation letter as a Word document. 11pt Calibri, US Letter,
          1&quot; margins, with a signature block.
        </p>
        <div className="flex gap-3 flex-wrap">
          <button type="button" onClick={() => downloadDocx('letter')} className="btn-primary">
            Download Letter (.docx)
          </button>
        </div>
        <details className="text-xs text-ink-muted">
          <summary className="cursor-pointer hover:text-ink-secondary">Preview letter text</summary>
          <pre className="whitespace-pre-wrap mt-3 text-sm text-ink-secondary leading-relaxed font-body bg-bg-elevated rounded-md p-4 max-h-[400px] overflow-auto">
            {draft.text}
          </pre>
        </details>
      </section>

      <section className="card space-y-4">
        <div className="eyebrow text-[11px]">Accompanying Email</div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          A brief, warm email to send alongside the letter. Mentions 2-3 highlights, 100-150 words.
        </p>
        {!emailText ? (
          <button
            type="button"
            onClick={generateEmail}
            disabled={emailLoading}
            className="btn-primary"
          >
            {emailLoading ? 'Generating…' : 'Generate Email'}
          </button>
        ) : (
          <>
            <textarea
              className="input min-h-[260px] font-body text-sm leading-relaxed"
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
            />
            <div className="flex gap-3 flex-wrap">
              <button type="button" onClick={() => downloadDocx('email')} className="btn-primary">
                Download Email (.docx)
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(emailText)}
                className="btn-secondary"
              >
                Copy to Clipboard
              </button>
              <button
                type="button"
                onClick={generateEmail}
                disabled={emailLoading}
                className="btn-secondary"
              >
                Regenerate
              </button>
            </div>
          </>
        )}
      </section>

      <div className="flex justify-between gap-4">
        <button type="button" onClick={onBack} className="btn-secondary">
          ← Back to Generate
        </button>
        <button type="button" onClick={onStartOver} className="btn-secondary">
          Start a New Letter
        </button>
      </div>
    </div>
  );
}
