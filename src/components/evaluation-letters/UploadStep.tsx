'use client';

import { useRef, useState } from 'react';
import type { SetupData, UploadedFile } from '@/lib/evaluation-letters/types';
import { ROLE_CATEGORIES, getRoleCategory } from '@/lib/evaluation-letters/role-categories';
import FacultyPicker from './FacultyPicker';

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
      // Recipient is set via the FacultyPicker — no need to auto-identify here.
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
  const recipientReady =
    setup.recipientName.trim().length > 0 && setup.recipientTitle.trim().length > 0 && Boolean(role);
  const canContinue = files.length > 0 && recipientReady;

  return (
    <div className="space-y-6">
      {/* 1. PICK THE RECIPIENT FROM THE FACULTY ROSTER */}
      <section className="card space-y-4">
        <div className="eyebrow text-[11px]">Recipient</div>
        <FacultyPicker
          value={setup.recipientName}
          writerId={setup.writerId}
          onPick={(entry) => {
            onSetupChange({
              ...setup,
              recipientName: entry.name,
              recipientTitle: entry.title || '',
              recipientDepartment: entry.department,
              recipientEmail: entry.email || '',
              roleCategoryId: entry.roleCategoryHint || setup.roleCategoryId,
            });
          }}
        />
        {setup.recipientName ? (
          <div className="border border-line p-4 bg-white space-y-3">
            <div className="text-xs uppercase tracking-[0.18em] text-status-success font-semibold">
              ✓ Selected
            </div>
            <div>
              <div className="text-base font-bold text-ink-primary">{setup.recipientName}</div>
              <div className="text-sm text-ink-secondary">{setup.recipientTitle}</div>
              <div className="text-sm text-ink-muted">{setup.recipientDepartment}</div>
              {setup.recipientEmail ? (
                <div className="text-xs text-ink-muted mt-1">{setup.recipientEmail}</div>
              ) : null}
            </div>
            <details className="text-xs text-ink-muted">
              <summary className="cursor-pointer hover:text-ink-secondary">
                Edit name / title / department / role category
              </summary>
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <InlineField
                  label="Recipient name"
                  value={setup.recipientName}
                  onChange={(v) => onSetupChange({ ...setup, recipientName: v })}
                />
                <InlineField
                  label="Recipient title"
                  value={setup.recipientTitle}
                  onChange={(v) => onSetupChange({ ...setup, recipientTitle: v })}
                />
                <InlineField
                  label="Department"
                  value={setup.recipientDepartment}
                  onChange={(v) => onSetupChange({ ...setup, recipientDepartment: v })}
                />
                <InlineField
                  label="Email"
                  value={setup.recipientEmail || ''}
                  onChange={(v) => onSetupChange({ ...setup, recipientEmail: v })}
                />
                <label className="block sm:col-span-2">
                  <div className="label">Role category</div>
                  <select
                    className="input"
                    value={setup.roleCategoryId}
                    onChange={(e) =>
                      onSetupChange({ ...setup, roleCategoryId: e.target.value })
                    }
                  >
                    <option value="">— Select —</option>
                    {ROLE_CATEGORIES.map((r) => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </details>
            {role?.warning ? (
              <div className="text-xs text-status-warning border border-status-warning/40 bg-status-warning/5 p-2">
                {role.warning}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="card space-y-4">
        <div className="eyebrow text-[11px]">Documents</div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          Upload the recipient&apos;s self-evaluation (Faculty 180 / annual report) and CV.
          The AI reads these to write the letter body. Accepted formats: .docx, .pdf, .txt, .md
          (10MB max each).
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

      <ObservationsSection notes={notes} onNotesChange={onNotesChange} />

      {!canContinue && files.length > 0 ? (
        <div className="text-xs text-status-warning border border-status-warning/40 bg-status-warning/5 px-3 py-2">
          Before continuing, confirm the recipient&apos;s name, title, and role category above.
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
          Continue to Generate
          <span className="btn-arrow" aria-hidden="true">&rarr;</span>
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

type Observations = {
  standout: string;
  growth: string;
  sensitive: string;
};

function parseNotes(raw: string): Observations {
  const trimmed = raw.trim();
  if (!trimmed) return { standout: '', growth: '', sensitive: '' };

  // Look for the three headings. If the format doesn't match, dump the whole
  // string into "STANDOUT" as a fallback (preserves prior free-text content).
  const headingPattern = /^(STANDOUT|GROWTH AREA|SENSITIVE):\s*$/im;
  if (!headingPattern.test(raw)) {
    return { standout: trimmed, growth: '', sensitive: '' };
  }

  const standoutMatch = raw.match(/STANDOUT:\s*\n?([\s\S]*?)(?=\n\s*(?:GROWTH AREA|SENSITIVE):|$)/i);
  const growthMatch = raw.match(/GROWTH AREA:\s*\n?([\s\S]*?)(?=\n\s*(?:STANDOUT|SENSITIVE):|$)/i);
  const sensitiveMatch = raw.match(/SENSITIVE:\s*\n?([\s\S]*?)(?=\n\s*(?:STANDOUT|GROWTH AREA):|$)/i);

  return {
    standout: (standoutMatch?.[1] || '').trim(),
    growth: (growthMatch?.[1] || '').trim(),
    sensitive: (sensitiveMatch?.[1] || '').trim(),
  };
}

function serializeNotes(obs: Observations): string {
  const { standout, growth, sensitive } = obs;
  // Always emit all three sections so the downstream prompt has predictable
  // structure. Empty sections are fine.
  return [
    `STANDOUT:\n${standout}`,
    `GROWTH AREA:\n${growth}`,
    `SENSITIVE:\n${sensitive}`,
  ].join('\n\n');
}

function ObservationsSection({
  notes,
  onNotesChange,
}: {
  notes: string;
  onNotesChange: (next: string) => void;
}) {
  const [obs, setObs] = useState<Observations>(() => parseNotes(notes));

  function update(field: keyof Observations, value: string) {
    const next = { ...obs, [field]: value };
    setObs(next);
    // Only emit a non-empty serialized blob if at least one field has content.
    const anyContent = next.standout.trim() || next.growth.trim() || next.sensitive.trim();
    onNotesChange(anyContent ? serializeNotes(next) : '');
  }

  return (
    <section className="card space-y-4">
      <div className="eyebrow text-[11px]">Your Observations and Notes</div>
      <p className="text-sm text-ink-secondary leading-relaxed">
        These shape the &quot;My Observations&quot; and &quot;Your Plan&quot; sections of the
        letter. Be honest and specific.
      </p>

      <label className="block space-y-1.5">
        <div className="label">
          What stands out about this faculty member&apos;s year? The single best thing.
        </div>
        <textarea
          className="input min-h-[80px] font-body leading-relaxed"
          placeholder="e.g., Outstanding teaching evaluations across all sections, especially the new course on..."
          value={obs.standout}
          onChange={(e) => update('standout', e.target.value)}
        />
      </label>

      <label className="block space-y-1.5">
        <div className="label">
          What&apos;s one thing you&apos;d like them to do differently — or one growth area you
          want them to focus on?
        </div>
        <textarea
          className="input min-h-[80px] font-body leading-relaxed"
          placeholder="e.g., More national-level service work, or shift conference attendance toward higher-tier venues..."
          value={obs.growth}
          onChange={(e) => update('growth', e.target.value)}
        />
      </label>

      <label className="block space-y-1.5">
        <div className="label">
          Anything sensitive to thread carefully — a difficult conversation, an issue to
          acknowledge, or context not in the documents?
        </div>
        <textarea
          className="input min-h-[80px] font-body leading-relaxed"
          placeholder="e.g., Family circumstance affected productivity in spring 2024, or interpersonal friction in committee work..."
          value={obs.sensitive}
          onChange={(e) => update('sensitive', e.target.value)}
        />
      </label>
    </section>
  );
}

