'use client';

import { useEffect, useRef, useState } from 'react';
import StepHeader from './StepHeader';
import CandidateSetupForm from './CandidateSetupForm';
import UploadStep from './UploadStep';
import MRCVoteStep from './MRCVoteStep';
import GenerateStep from './GenerateStep';
import DownloadStep from './DownloadStep';
import DemoBanner from './DemoBanner';
import { getCandidate } from '@/lib/endowed-positions/candidates';
import type {
  GeneratedParts,
  LetterDraft,
  MRCVote,
  SetupData,
  UploadedFile,
} from '@/lib/endowed-positions/types';

const today = new Date();
const todayIso = today.toISOString().slice(0, 10);

/**
 * Sample / demo candidate the workflow lands on so a first-time
 * visitor sees a populated example without typing anything. The user
 * can pick any other candidate from the Step 1 dropdown to clear
 * the sample data.
 */
const SAMPLE_CANDIDATE_ID = 'len-berry';
const SAMPLE_POSITION_NAME = 'M.B. Zale Chair in Retailing and Marketing Leadership';

function buildInitialSetup(): SetupData {
  const c = getCandidate(SAMPLE_CANDIDATE_ID);
  if (!c) {
    return {
      candidateId: '',
      candidateName: '',
      candidateDepartment: '',
      candidateDeptCode: 'INFO',
      candidateCurrentTitle: '',
      candidateCurrentEndowedPosition: 'None',
      candidateDepartmentHead: '',
      recommendedPositionName: '',
      recommendedEndowedPosition: 'Professorship',
      nominationType: 'new-professorship',
      termYears: 5,
      memoDate: todayIso,
      fiscalYear: today.getFullYear() + 1,
    };
  }
  return {
    candidateId: c.id,
    candidateName: c.name,
    candidateDepartment: c.department,
    candidateDeptCode: c.deptCode,
    candidateCurrentTitle: c.currentTitle,
    candidateCurrentEndowedPosition: c.currentEndowedPosition,
    candidateDepartmentHead: c.departmentHead,
    recommendedPositionName: SAMPLE_POSITION_NAME,
    recommendedEndowedPosition: c.recommendedEndowedPosition,
    nominationType: c.nominationType,
    termYears: 5,
    memoDate: todayIso,
    fiscalYear: today.getFullYear() + 1,
  };
}

const initialSetup: SetupData = buildInitialSetup();

/**
 * Illustrative MRC tally for the sample case (5-0 in favor of Chair).
 * The actual FY27 MRC has not yet met — these values are placeholders
 * to make the workflow feel populated on first landing.
 */
function buildSampleVotes(): MRCVote[] {
  return [
    { memberId: 'ahmed', choice: 'chair' },
    { memberId: 'johnson', choice: 'chair' },
    { memberId: 'oliva-info', choice: 'chair' },
    { memberId: 'jones', choice: 'chair' },
    { memberId: 'boswell', choice: 'chair' },
  ];
}

const initialVotes: MRCVote[] = buildSampleVotes();

// localStorage key for the auto-saved workflow state.
const STORAGE_KEY = 'mml.endowedLetters.draftState.v1';
// Roughly 4MB cap on serialized JSON before per-file text truncation kicks in.
const SAVE_SIZE_CAP_BYTES = 4 * 1024 * 1024;
const PER_FILE_TEXT_CAP_BYTES = 200 * 1024;

type SavedState = {
  step: 1 | 2 | 3 | 4 | 5;
  setup: SetupData;
  files: UploadedFile[];
  votes: MRCVote[];
  draft: LetterDraft | null;
  parts: GeneratedParts | null;
};

function safeStringify(state: SavedState): string {
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

export default function EndowedLetterWorkflow() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [setup, setSetup] = useState<SetupData>(initialSetup);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [votes, setVotes] = useState<MRCVote[]>(initialVotes);
  const [draft, setDraft] = useState<LetterDraft | null>(null);
  const [parts, setParts] = useState<GeneratedParts | null>(null);

  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // True until the user picks a different candidate or dismisses the
  // banner. Determines whether the demo banner is rendered.
  const onSampleCandidate = setup.candidateId === SAMPLE_CANDIDATE_ID;

  // Hydrate from localStorage on first client render.
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedState>;
        if (parsed && typeof parsed === 'object') {
          if (
            parsed.step === 1 ||
            parsed.step === 2 ||
            parsed.step === 3 ||
            parsed.step === 4 ||
            parsed.step === 5
          ) {
            setStep(parsed.step);
          }
          if (parsed.setup) setSetup({ ...initialSetup, ...parsed.setup });
          if (Array.isArray(parsed.files)) setFiles(parsed.files);
          if (Array.isArray(parsed.votes)) setVotes(parsed.votes);
          if (parsed.draft !== undefined) setDraft(parsed.draft ?? null);
          if (parsed.parts !== undefined) setParts(parsed.parts ?? null);
        }
      }
    } catch {
      // Start fresh on any parse / storage error.
    }
    setHydrated(true);
  }, []);

  // Debounced auto-save.
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const snapshot: SavedState = { step, setup, files, votes, draft, parts };
      try {
        window.localStorage.setItem(STORAGE_KEY, safeStringify(snapshot));
      } catch {
        // Ignore quota / disabled-storage errors.
      }
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [hydrated, step, setup, files, votes, draft, parts]);

  function reset() {
    setSetup(initialSetup);
    setFiles([]);
    setVotes(initialVotes);
    setDraft(null);
    setParts(null);
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
            className="text-[13px] text-maroon hover:underline focus:outline-none focus:ring-2 focus:ring-maroon/30 px-1"
          >
            Start over
          </button>
        </div>
      ) : null}

      {onSampleCandidate ? (
        <DemoBanner candidateName={setup.candidateName || 'Len Berry'} />
      ) : null}

      {step === 1 ? (
        <>
          <StepHeader
            step={1}
            title="Choose the candidate."
            subtitle="Pick from the FY27 list and confirm the endowed-position name, term, and nomination type."
          />
          <CandidateSetupForm
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
            title="Upload supporting documents."
            subtitle="Drop the department head's recommendation letter and the candidate's CV. Both are read by the AI."
          />
          <UploadStep
            files={files}
            onFilesChange={setFiles}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
          />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <StepHeader
            step={3}
            title="Record MRC votes."
            subtitle="Five voting members of the Mays Research Council. Each chooses Chair / Professorship / No endowed position. Anonymous comments optional."
          />
          <MRCVoteStep
            votes={votes}
            onChange={setVotes}
            onBack={() => setStep(2)}
            onContinue={() => setStep(4)}
          />
        </>
      ) : null}

      {step === 4 ? (
        <>
          <StepHeader
            step={4}
            title="Generate, review, edit."
            subtitle="The AI writes only the four variable-content fields (subject, opening, summary reasons, achievement paragraph). The institutional boilerplate is stitched in verbatim."
          />
          <GenerateStep
            setup={setup}
            files={files}
            votes={votes}
            draft={draft}
            parts={parts}
            onDraftChange={setDraft}
            onPartsChange={setParts}
            onBack={() => setStep(3)}
            onContinue={() => setStep(5)}
          />
        </>
      ) : null}

      {step === 5 && draft && parts ? (
        <>
          <StepHeader
            step={5}
            title="Download."
            subtitle="Letter as .docx. Mays/TAMU letterhead, both tables, signature block."
          />
          <DownloadStep
            setup={setup}
            votes={votes}
            draft={draft}
            parts={parts}
            onBack={() => setStep(4)}
            onStartOver={reset}
          />
        </>
      ) : null}
    </div>
  );
}
