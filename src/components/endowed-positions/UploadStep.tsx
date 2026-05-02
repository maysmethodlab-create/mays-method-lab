'use client';

import { useRef, useState } from 'react';
import type { UploadedFile } from '@/lib/endowed-positions/types';

const MAX_BYTES = 10 * 1024 * 1024;

type Props = {
  files: UploadedFile[];
  onFilesChange: (next: UploadedFile[]) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function UploadStep({ files, onFilesChange, onBack, onContinue }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFiles(list: FileList | File[]) {
    const arr = Array.from(list);
    const oversized = arr.find((f) => f.size > MAX_BYTES);
    if (oversized) {
      setError(`${oversized.name} is larger than 10MB.`);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      arr.forEach((f) => fd.append('files', f, f.name));
      const res = await fetch('/api/endowed-positions/extract', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to extract files.');
        setBusy(false);
        return;
      }
      const accepted: UploadedFile[] = data.files
        .filter((f: { error?: string }) => !f.error)
        .map((f: UploadedFile) => ({
          id: f.id,
          filename: f.filename,
          text: f.text,
          size: f.size,
          kind: detectKind(f.filename),
        }));
      const failed = data.files.filter((f: { error?: string }) => f.error);
      if (failed.length) {
        setError(
          failed
            .map((f: { filename: string; error?: string }) => `${f.filename}: ${f.error}`)
            .join(' · '),
        );
      }
      onFilesChange([...files, ...accepted]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function detectKind(name: string): UploadedFile['kind'] {
    const n = name.toLowerCase();
    if (/cv|vita|curriculum|resume/.test(n)) return 'cv';
    if (/dh|dept|head|recommendation|letter|nomination|memo/.test(n)) return 'dept-head-letter';
    return 'other';
  }

  function removeFile(id: string) {
    onFilesChange(files.filter((f) => f.id !== id));
  }

  function changeKind(id: string, kind: UploadedFile['kind']) {
    onFilesChange(files.map((f) => (f.id === id ? { ...f, kind } : f)));
  }

  const canContinue = files.length > 0;

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <div className="eyebrow text-[11px]">Documents</div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          Upload the department head&apos;s recommendation letter (.docx or .pdf) and the
          candidate&apos;s CV (.pdf). The AI uses both to draft the Achievement and Qualifications
          paragraph and the &quot;citing&quot; reasons in the Summary.
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
          }}
          className={`border border-dashed px-6 py-10 text-center transition-colors ${
            drag ? 'border-maroon bg-maroon/5' : 'border-line bg-bg-subtle'
          }`}
        >
          <div className="text-sm text-ink-secondary mb-4">Drag and drop files here, or</div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".docx,.pdf,.txt,.md"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="btn-primary"
          >
            {busy ? 'Extracting…' : 'Choose Files'}
          </button>
        </div>

        {error ? (
          <div className="text-sm text-status-error border border-status-error/40 bg-status-error/5 px-4 py-3">
            {error}
          </div>
        ) : null}

        {files.length > 0 ? (
          <ul className="divide-y divide-line border border-line overflow-hidden">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-4 px-4 py-3 bg-white">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink-primary truncate font-medium">{f.filename}</div>
                  <div className="text-[11px] text-ink-muted">
                    {(f.size / 1024).toFixed(1)} KB · {f.text.length.toLocaleString()} chars extracted
                  </div>
                </div>
                <select
                  className="input max-w-[200px] py-2 text-sm"
                  value={f.kind}
                  onChange={(e) => changeKind(f.id, e.target.value as UploadedFile['kind'])}
                >
                  <option value="dept-head-letter">Dept-Head Letter</option>
                  <option value="cv">CV</option>
                  <option value="other">Other</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="text-xs text-ink-muted hover:text-status-error transition-colors"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="flex justify-between gap-4">
        <button type="button" onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="btn-primary"
        >
          Continue to MRC Votes
          <span className="btn-arrow" aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
}
