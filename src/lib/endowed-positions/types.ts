/**
 * Shared types for the Endowed Positions Letter Writer (Stage 2).
 *
 * Stage 2 = the memorandum from Rogelio Oliva (Chair of the Mays Research
 * Council, Associate Dean for Research and Scholarship) to Dean Nate Sharp
 * recommending the appointment / reappointment / fellowship of an
 * endowed-position candidate after the MRC has voted.
 */

export type NominationType =
  | 'new-chair'
  | 'new-professorship'
  | 'reappoint-chair'
  | 'reappoint-professorship'
  | 'fellowship';

export type DeptCode =
  | 'ACCT'
  | 'FINC'
  | 'INFO'
  | 'MGMT'
  | 'MKTG'
  | "Dean's Office";

export type VoteChoice = 'yes' | 'no' | 'abstain';

/**
 * High-level grouping derived from `nominationType`. Renewals are existing
 * endowed-position holders coming back through the cycle; new appointments
 * cover first-time endowed positions and fellowship nominations.
 */
export type NominationCategory = 'renewal' | 'new-appointment';

export type Candidate = {
  id: string;
  name: string;
  /** Long department name (used in the letter) */
  department: string;
  /** Short code used in the outcome table */
  deptCode: DeptCode;
  /** Default nomination type, derived from the FY27 packet folder structure. */
  nominationType: NominationType;
  /** Default endowed-position name (left blank where uncertain — user fills in). */
  defaultPositionName?: string;
  /** Current title (Assistant Professor / Associate Professor / Professor / etc.). */
  currentTitle: string;
  /** Existing endowed appointment as displayed in the outcome table. */
  currentEndowedPosition: string;
  /** Recommended endowed appointment (column 4 of the outcome table). */
  recommendedEndowedPosition: string;
  /** Department head or supervisor name (column 5 of the outcome table). */
  departmentHead: string;
};

export type MRCMember = {
  id: string;
  name: string;
  /** Administrative appointment column. "None" for regular voting members. */
  administrativeAppointment: string;
  rank: string;
  endowedPosition: string;
  department: DeptCode;
  /** Member | Chair */
  typeOfMember: 'Member' | 'Chair';
  votingRights: 'Yes' | 'No';
};

export type SetupData = {
  candidateId: string;
  /** Candidate name (editable after auto-fill). */
  candidateName: string;
  candidateDepartment: string;
  candidateDeptCode: DeptCode;
  /** Currently held title — appears on the SUBJECT line and the outcome table. */
  candidateCurrentTitle: string;
  candidateCurrentEndowedPosition: string;
  candidateDepartmentHead: string;
  /** Recommended endowed-position name (e.g. "Pat & Tom Powers Endowed Professorship"). */
  recommendedPositionName: string;
  recommendedEndowedPosition: string;
  nominationType: NominationType;
  /** Term length in years; default 5. */
  termYears: number;
  /** Memo date — defaults to today. */
  memoDate: string;
  /** Fiscal year used in the MRC composition paragraph. Defaults to current FY. */
  fiscalYear: number;
};

export type UploadedFile = {
  id: string;
  filename: string;
  text: string;
  size: number;
  /** "dept-head-letter" | "cv" | "other" */
  kind: 'dept-head-letter' | 'cv' | 'other';
};

export type MRCVote = {
  /** MRC member id (matches mrc.ts). */
  memberId: string;
  /**
   * Whether the member concurs with the department head's recommendation
   * (yes), rejects it (no), or recuses themselves (abstain).
   */
  choice?: VoteChoice;
};

export type VoteTally = {
  yes: number;
  no: number;
  abstain: number;
  total: number;
};

export type LetterDraft = {
  /** Full assembled memo text — what the .docx generator and the editable
   *  textarea both render from. */
  text: string;
  /** Raw model output (for debugging / regeneration). */
  modelJson?: string;
  generatedAt: string;
};

/**
 * The four AI-generated fields the model returns. The server-side assembler
 * stitches these with the verbatim institutional boilerplate.
 */
export type GeneratedParts = {
  subjectLine: string;
  openingSentence: string;
  summaryReasonsClause: string;
  achievementParagraph: string;
};
