import type { Rating } from './role-categories';

export type SetupData = {
  writerId: string;
  evaluationYear: number;
  /** Optional in Step 1 — auto-detected from uploads in Step 2 if blank. */
  recipientName: string;
  /** Optional in Step 1 — auto-detected from uploads in Step 2 if blank. */
  recipientTitle: string;
  recipientDepartment: string;
  recipientEmail?: string;
  roleCategoryId: string;
  /** Per-area ratings (research may be undefined if not applicable) */
  teachingRating?: Rating;
  researchRating?: Rating;
  serviceRating?: Rating;
  overallRating?: Rating;
};

export type UploadedFile = {
  /** Server-friendly stable id used to reference the file across phases */
  id: string;
  filename: string;
  /** Plain-text contents extracted from the upload */
  text: string;
  /** Original byte size for display */
  size: number;
  /** Tag for the user — "self-evaluation" | "cv" | "peer-comments" | "other" */
  kind: 'self-evaluation' | 'cv' | 'peer-comments' | 'other';
};

export type ResearchBrief = {
  raw: string;
  generatedAt: string;
};

export type LetterDraft = {
  text: string;
  generatedAt: string;
};

export type VerificationResult = {
  report: string;
  correctedText?: string;
  generatedAt: string;
};
