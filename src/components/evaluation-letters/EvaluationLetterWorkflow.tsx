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
  ccName: 'Dean Sharp',
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
            title="Set up the letter."
            subtitle="Identify yourself, the recipient, and assign per-area performance ratings using the Mays four-level scale."
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
            title="Upload documents and add notes."
            subtitle="Self-evaluation and CV are required. Your free-text notes shape the &quot;My Observations&quot; and &quot;Your Plan&quot; sections — write in shorthand, the AI will weave them in."
          />
          <UploadStep
            files={files}
            notes={notes}
            onFilesChange={setFiles}
            onNotesChange={setNotes}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
          />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <StepHeader
            step={3}
            title="Generate the letter."
            subtitle="Three phases: Research extracts every fact from your uploads, Draft writes the letter in your voice, Verify fact-checks every claim against the sources and flags AI-language patterns."
          />
          <GenerateStep
            setup={setup}
            files={files}
            notes={notes}
            brief={brief}
            draft={draft}
            verification={verification}
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
