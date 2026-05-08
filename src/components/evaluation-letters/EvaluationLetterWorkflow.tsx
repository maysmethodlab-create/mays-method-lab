'use client';

import { useEffect, useRef, useState } from 'react';
import StepHeader from './StepHeader';
import SetupForm from './SetupForm';
import UploadStep from './UploadStep';
import GenerateStep from './GenerateStep';
import DownloadStep from './DownloadStep';
import type {
  LetterDraft,
  ResearchBrief,
  SetupData,
  UploadedFile,
  VerificationResult,
} from '@/lib/evaluation-letters/types';

// Eval letter writes today are for last year's performance. Default to
// (currentYear - 1). E.g. a letter written in May 2026 evaluates 2025
// performance and is dated 2026.
const defaultEvaluationYear = new Date().getFullYear() - 1;

const initialSetup: SetupData = {
  writerId: '',
  evaluationYear: defaultEvaluationYear,
  recipientName: '',
  recipientTitle: '',
  recipientDepartment: '',
  roleCategoryId: '',
};

// localStorage key for the auto-saved workflow state. Bumped versions force
// stale saves to be ignored on shape changes.
const STORAGE_KEY = 'mml.evalLetters.draftState.v1';
// Cap roughly at 4MB of serialized JSON before we start truncating large
// extracted-text payloads on a per-file basis.
const SAVE_SIZE_CAP_BYTES = 4 * 1024 * 1024;
// Per-file truncation cap for `text` when the full payload is too large.
const PER_FILE_TEXT_CAP_BYTES = 200 * 1024;

type SavedState = {
  step: 1 | 2 | 3 | 4;
  setup: SetupData;
  files: UploadedFile[];
  notes: string;
  brief: ResearchBrief | null;
  draft: LetterDraft | null;
  verification: VerificationResult | null;
};

function isEmpty(s: SavedState): boolean {
  return (
    s.step === 1 &&
    !s.setup.writerId &&
    !s.setup.recipientName &&
    s.files.length === 0 &&
    !s.notes &&
    !s.brief &&
    !s.draft &&
    !s.verification
  );
}

function safeStringify(state: SavedState): string {
  // Try the full state first; if it's over the cap, truncate the largest
  // `files[].text` blobs to PER_FILE_TEXT_CAP_BYTES and try again.
  const full = JSON.stringify(state);
  if (full.length <= SAVE_SIZE_CAP_BYTES) return full;
  const truncated: SavedState = {
    ...state,
    files: state.files.map((f) => ({
      ...f,
      text: f.text && f.text.length > PER_FILE_TEXT_CAP_BYTES
        ? f.text.slice(0, PER_FILE_TEXT_CAP_BYTES)
        : f.text,
    })),
  };
  return JSON.stringify(truncated);
}

export default function EvaluationLetterWorkflow() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [setup, setSetup] = useState<SetupData>(initialSetup);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [brief, setBrief] = useState<ResearchBrief | null>(null);
  const [draft, setDraft] = useState<LetterDraft | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);

  // `hydrated` flips true after we read localStorage on mount. Keep it false
  // during the first render so we don't write the (default) state back over
  // a real save before it's loaded, and to avoid SSR/CSR class mismatches.
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage on first client render.
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedState>;
        if (parsed && typeof parsed === 'object') {
          if (parsed.step === 1 || parsed.step === 2 || parsed.step === 3 || parsed.step === 4) {
            setStep(parsed.step);
          }
          if (parsed.setup) setSetup({ ...initialSetup, ...parsed.setup });
          if (Array.isArray(parsed.files)) setFiles(parsed.files);
          if (typeof parsed.notes === 'string') setNotes(parsed.notes);
          if (parsed.brief !== undefined) setBrief(parsed.brief ?? null);
          if (parsed.draft !== undefined) setDraft(parsed.draft ?? null);
          if (parsed.verification !== undefined) setVerification(parsed.verification ?? null);
        }
      }
    } catch {
      // Ignore parse / storage errors and start fresh.
    }
    setHydrated(true);
  }, []);

  // Debounced auto-save whenever any tracked piece of state changes.
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const snapshot: SavedState = { step, setup, files, notes, brief, draft, verification };
      try {
        if (isEmpty(snapshot)) {
          window.localStorage.removeItem(STORAGE_KEY);
        } else {
          window.localStorage.setItem(STORAGE_KEY, safeStringify(snapshot));
        }
      } catch {
        // Quota exceeded or storage disabled — silently drop. The user can
        // still continue; auto-save just won't survive this tab close.
      }
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [hydrated, step, setup, files, notes, brief, draft, verification]);

  function reset() {
    setSetup(initialSetup);
    setFiles([]);
    setNotes('');
    setBrief(null);
    setDraft(null);
    setVerification(null);
    setStep(1);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore.
    }
  }

  function handleStartOverClick() {
    if (typeof window === 'undefined') return;
    const ok = window.confirm('Start over? This will clear all entered data.');
    if (ok) reset();
  }

  return (
    <div>
      {hydrated ? (
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleStartOverClick}
            className="text-[16px] text-maroon hover:underline focus:outline-none focus:ring-2 focus:ring-maroon/30 px-1"
          >
            Start over
          </button>
        </div>
      ) : null}

      {step === 1 ? (
        <>
          <StepHeader
            step={1}
            title="Choose the writer."
            subtitle="Pick yourself (the department head writing this letter) and the evaluation year. Recipient details come from the upload in the next step."
          />
          <SetupForm
            value={setup}
            onChange={setSetup}
            onContinue={() => setStep(2)}
          />
        </>
      ) : null}

      {step === 2 ? (
        <>
          <StepHeader
            step={2}
            title="Upload &amp; review the recipient."
            subtitle="Upload the recipient's self-evaluation and CV. We auto-detect their name, title, department, and role category from the documents. Then add your own observation notes. These shape the letter's tone."
          />
          <UploadStep
            files={files}
            notes={notes}
            setup={setup}
            onFilesChange={setFiles}
            onNotesChange={setNotes}
            onSetupChange={setSetup}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
          />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <StepHeader
            step={3}
            title="Generate, review, rate."
            subtitle="Extract pulls the facts from your uploads. Draft writes the letter body. Verify fact-checks every claim. Then you assign per-area ratings, with the Mays definitions visible, and the formal Summary is appended."
          />
          <GenerateStep
            setup={setup}
            files={files}
            notes={notes}
            brief={brief}
            draft={draft}
            verification={verification}
            onSetupChange={setSetup}
            onBriefChange={setBrief}
            onDraftChange={setDraft}
            onVerificationChange={setVerification}
            onBack={() => setStep(2)}
            onContinue={() => setStep(4)}
          />
        </>
      ) : null}

      {step === 4 && draft ? (
        <>
          <StepHeader
            step={4}
            title="Download."
            subtitle="Download the letter and the accompanying email as Word documents. Both follow the Mays formatting and Hari's writing style rules."
          />
          <DownloadStep
            setup={setup}
            draft={draft}
            onBack={() => setStep(3)}
            onStartOver={reset}
          />
        </>
      ) : null}
    </div>
  );
}
