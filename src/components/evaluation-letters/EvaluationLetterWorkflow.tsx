'use client';

import { useState } from 'react';
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

const today = new Date();
const defaultEvaluationYear = today.getMonth() < 2 ? today.getFullYear() - 1 : today.getFullYear() - 1;

const initialSetup: SetupData = {
  writerId: '',
  evaluationYear: defaultEvaluationYear,
  recipientName: '',
  recipientTitle: '',
  recipientDepartment: '',
  roleCategoryId: '',
};

export default function EvaluationLetterWorkflow() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [setup, setSetup] = useState<SetupData>(initialSetup);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [brief, setBrief] = useState<ResearchBrief | null>(null);
  const [draft, setDraft] = useState<LetterDraft | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);

  function reset() {
    setSetup(initialSetup);
    setFiles([]);
    setNotes('');
    setBrief(null);
    setDraft(null);
    setVerification(null);
    setStep(1);
  }

  return (
    <div>
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
            subtitle="Upload the recipient's self-evaluation and CV. We auto-detect their name, title, department, and role category from the documents. Then add your own observation notes — these shape the letter's tone."
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
            subtitle="Extract pulls the facts from your uploads. Draft writes the letter body. Verify fact-checks every claim. Then you assign per-area ratings — with the Mays definitions visible — and the formal Summary is appended."
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
