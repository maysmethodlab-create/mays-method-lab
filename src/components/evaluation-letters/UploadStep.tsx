'use client';

import { useRef, useState } from 'react';
import type { SetupData, UploadedFile } from '@/lib/evaluation-letters/types';
import {
  ROLE_CATEGORIES,
  RATING_LEVELS,
  getRoleCategory,
  type Rating,
} from '@/lib/evaluation-letters/role-categories';

const MAX_BYTES = 10 * 1024 * 1024;

type Props = {
  files: UploadedFile[];
  notes: string;
  setup: SetupData;
  onFilesChange: (next: UploadedFile[]) => void;
  onNotesChange: (next: string) => void;
  onSetupChange: (next: SetupData) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function UploadStep({
  files,
  notes,
  setup,
  onFilesChange,
  onNotesChange,
  onSetupChange,
  onBack,
  onContinue,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [identifySource, setIdentifySource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFiles(list: FileList | File[]) {
    const arr = Array.from(list);
    const oversized = arr.find((f) => f.size > MAX_BYTES);
    if (oversized) {
      setError(`${oversized.name} is larger than 10MB. Please upload a smaller file.`);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      arr.forEach((f) => fd.append('files', f, f.name));
      const res = await fetch('/api/evaluation-letters/extract', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to extract uploaded files.');
        setBusy(false);
        return;
      }
      const accepted: UploadedFile[] = data.files.map((f: UploadedFile & { error?: string }) => ({
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
      const allFiles = [...files, ...accepted];
      onFilesChange(allFiles);
      if (accepted.length > 0) {
        await runIdentify(allFiles);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function runIdentify(allFiles: UploadedFile[]) {
    setIdentifying(true);
    try {
      const sourceDocuments = allFiles
        .map((f) => `===== ${f.kind.toUpperCase()} — ${f.filename} =====\n${f.text}`)
        .join('\n\n');
      const res = await fetch('/api/evaluation-letters/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceDocuments }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setIdentifySource(data.source || null);

      // Apply detected values, only overwriting blanks (do not clobber edits).
      const next = { ...setup };
      let changed = false;
      if (data.name && !next.recipientName) {
        next.recipientName = data.name;
        changed = true;
      }
      if (data.title && !next.recipientTitle) {
        next.recipientTitle = data.title;
        changed = true;
      }
      if (data.department && !next.recipientDepartment) {
        next.recipientDepartment = data.department;
        changed = true;
      }
      if (data.roleCategoryId && !next.roleCategoryId) {
        next.roleCategoryId = data.roleCategoryId;
        changed = true;
      }
      if (changed) onSetupChange(next);
    } catch {
      /* identify is best-effort */
    } finally {
      setIdentifying(false);
    }
  }

  function detectKind(name: string): UploadedFile['kind'] {
    const n = name.toLowerCase();
    if (/cv|vita|curriculum|resume/.test(n)) return 'cv';
    if (/self|annual|evaluation|review|f180|faculty\s*180/.test(n)) return 'self-evaluation';
    return 'other';
  }

  function removeFile(id: string) {
    onFilesChange(files.filter((f) => f.id !== id));
  }

  function changeKind(id: string, kind: UploadedFile['kind']) {
    onFilesChange(files.map((f) => (f.id === id ? { ...f, kind } : f)));
  }

  const role = getRoleCategory(setup.roleCategoryId);
  const showResearch = role?.required.includes('research') || role?.optional.includes('research');
  const showService = role?.required.includes('service') || role?.optional.includes('service');
  const showTeaching = role?.required.includes('teaching') || role?.optional.includes('teaching');

  const recipientReady =
    setup.recipientName.trim().length > 0 && setup.recipientTitle.trim().length > 0 && Boolean(role);
  const ratingsReady = Boolean(setup.overallRating);
  const canContinue = files.length > 0 && recipientReady && ratingsReady;

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <div className="eyebrow text-[11px]">Documents</div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          Upload the recipient&apos;s self-evaluation (Faculty 180 / annual report) and CV.
          We&apos;ll auto-detect their name, title, department, and role category from the
          documents. Accepted formats: .docx, .pdf, .txt, .md (10MB max each).
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
          className={`border border-dashed rounded-card px-6 py-10 text-center transition-colors ${
            drag ? 'border-maroon bg-maroon/5' : 'border-line bg-bg-subtle'
          }`}
        >
          <div className="text-sm text-ink-secondary mb-4">
            Drag and drop files here, or
          </div>
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
          <div className="text-sm text-status-error border border-status-error/40 bg-status-error/5 rounded-md px-4 py-3">
            {error}
          </div>
        ) : null}

        {files.length > 0 ? (
          <ul className="divide-y divide-line border border-line rounded-card overflow-hidden">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-4 px-4 py-3 bg-white">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink-primary truncate font-medium">{f.filename}</div>
                  <div className="text-[11px] text-ink-muted">
                    {(f.size / 1024).toFixed(1)} KB · {f.text.length.toLocaleString()} characters extracted
                  </div>
                </div>
                <select
                  className="input max-w-[180px] py-2 text-sm"
                  value={f.kind}
                  onChange={(e) => changeKind(f.id, e.target.value as UploadedFile['kind'])}
                >
                  <option value="self-evaluation">Self-evaluation</option>
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

      {/* Auto-identified recipient */}
      {files.length > 0 ? (
        <section className="card space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="eyebrow text-[11px]">Recipient (auto-detected)</div>
            <div className="flex items-center gap-3">
              {identifying ? (
                <span className="text-[11px] text-ink-muted">Identifying…</span>
              ) : identifySource ? (
                <span className="text-[11px] text-ink-muted">Source: {identifySource}</span>
              ) : null}
              <button
                type="button"
                onClick={() => runIdentify(files)}
                disabled={identifying || files.length === 0}
                className="text-xs uppercase tracking-[0.15em] font-semibold text-maroon hover:text-maroon-deep transition-colors"
              >
                {identifySource ? 'Re-detect' : 'Detect now'}
              </button>
            </div>
          </div>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Edit anything wrong before continuing. The letter uses exactly what you confirm here.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <InlineField
              label="Recipient name"
              value={setup.recipientName}
              onChange={(v) => onSetupChange({ ...setup, recipientName: v })}
              placeholder="e.g., Jane Smith, Ph.D."
            />
            <InlineField
              label="Recipient title"
              value={setup.recipientTitle}
              onChange={(v) => onSetupChange({ ...setup, recipientTitle: v })}
              placeholder="e.g., Associate Professor of Marketing"
            />
            <InlineField
              label="Department"
              value={setup.recipientDepartment}
              onChange={(v) => onSetupChange({ ...setup, recipientDepartment: v })}
            />
            <label className="block">
              <div className="label">Role category</div>
              <select
                className="input"
                value={setup.roleCategoryId}
                onChange={(e) => onSetupChange({ ...setup, roleCategoryId: e.target.value })}
              >
                <option value="">— Select —</option>
                {ROLE_CATEGORIES.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </label>
          </div>
          {role?.warning ? (
            <div className="text-xs text-status-warning border border-status-warning/40 bg-status-warning/5 rounded-md px-3 py-2">
              {role.warning}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Ratings — only after we know the role category */}
      {role ? (
        <section className="card space-y-4">
          <div className="eyebrow text-[11px]">
            Performance Ratings (Mays Guidelines §6.4)
          </div>
          <p className="text-sm text-ink-secondary">
            Excellent · Effective · Needs Improvement · Unsatisfactory.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {showTeaching ? (
              <RatingField
                label="Teaching"
                value={setup.teachingRating}
                onChange={(v) => onSetupChange({ ...setup, teachingRating: v })}
              />
            ) : null}
            {showResearch ? (
              <RatingField
                label="Research and Publication"
                value={setup.researchRating}
                onChange={(v) => onSetupChange({ ...setup, researchRating: v })}
                optional={role.optional.includes('research')}
              />
            ) : null}
            {showService ? (
              <RatingField
                label="Service"
                value={setup.serviceRating}
                onChange={(v) => onSetupChange({ ...setup, serviceRating: v })}
              />
            ) : null}
            <RatingField
              label="Overall"
              value={setup.overallRating}
              onChange={(v) => onSetupChange({ ...setup, overallRating: v })}
              required
            />
          </div>
        </section>
      ) : null}

      <section className="card space-y-3">
        <div className="eyebrow text-[11px]">Your Observations and Notes</div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          Rough notes, bullet points, anything you want reflected in the letter. The AI weaves
          these into the &quot;My Observations&quot; and &quot;Your Plan&quot; sections — without
          them the letter reads like a document summary.
        </p>
        <textarea
          className="input min-h-[180px] font-body leading-relaxed"
          placeholder={`e.g.\n• Amazing in the classroom this year, students loved her\n• Struggled with committee work, but research was top-notch\n• Goals: improve PhD placements, launch certificate program, write 2 papers`}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </section>

      {!canContinue && files.length > 0 ? (
        <div className="text-xs text-status-warning border border-status-warning/40 bg-status-warning/5 rounded-md px-3 py-2">
          Before continuing, confirm the recipient&apos;s name, title, role category, and the
          overall rating.
        </div>
      ) : null}

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
          Continue to Generate →
        </button>
      </div>
    </div>
  );
}

function InlineField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="label">{label}</div>
      <input
        className="input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function RatingField({
  label,
  value,
  onChange,
  required,
  optional,
}: {
  label: string;
  value: Rating | undefined;
  onChange: (v: Rating | undefined) => void;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <div className="label">
        {label}
        {required ? ' *' : ''}
        {optional ? (
          <span className="text-ink-muted normal-case tracking-normal text-[11px] ml-2 font-normal">
            (optional)
          </span>
        ) : null}
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
