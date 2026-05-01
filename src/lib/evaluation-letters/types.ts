import type { Rating } from './role-categories';

export type SetupData = {
  writerId: string;
  evaluationYear: number;
  recipientName: string;
  recipientTitle: string;
  recipientDepartment: string;
  roleCategoryId: string;
  ccName: string;
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
  /** Tag for the user — "self-evaluation" | "cv" | "other" */
  kind: 'self-evaluation' | 'cv' | 'other';
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
