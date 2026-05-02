import 'server-only';
import type { MaysLayout } from './brand';

/**
 * Type definitions for the PowerPoint Reformatter pipeline.
 *
 * The six-step pipeline (synthesize, brand-study, plan, review,
 * accessibility, generate) passes structured JSON between steps. These
 * types are the contract.
 *
 * Ordering of types in this file mirrors the pipeline order so the file
 * reads top-to-bottom in the same direction the data flows.
 */

/* ===========================================================================
 *  Step 1 output: SynthesizedDeck
 *  --------------------------------------------------------------------------
 *  Haiku reads ParsedDeck (from parse-input.ts) and returns this shape.
 *  Each slide gets a semantic type and a key message so subsequent steps
 *  can reason about purpose, not just text.
 * ========================================================================= */

export type SlideKind =
  | 'title'
  | 'section'
  | 'content'
  | 'two-column'
  | 'data'
  | 'image'
  | 'closing';

export type SynthesizedSlide = {
  /** 1-based source slide index from the input deck. */
  index: number;
  /** Detected semantic type. */
  kind: SlideKind;
  /** One-sentence summary of what this slide is meant to communicate. */
  keyMessage: string;
  /** Original headline text the parser pulled out (may be empty). */
  sourceTitle: string;
  /** Speaker notes carried forward verbatim. */
  notes: string;
  /** Any image references the parser flagged on this slide. */
  hasImage: boolean;
  /** Any tabular data the parser flagged. */
  hasTable: boolean;
  /** A textual description of any image content, if available. */
  imageDescriptions: string[];
};

export type SynthesizedDeck = {
  slideCount: number;
  /** A single line summary of the entire deck. */
  deckSummary: string;
  slides: SynthesizedSlide[];
};

/* ===========================================================================
 *  Step 2 output: BrandStudy
 *  --------------------------------------------------------------------------
 *  Haiku maps each synthesized slide to one of the approved Mays layouts
 *  and explains the reasoning. Reasoning is preserved so the review step
 *  can argue with it.
 * ========================================================================= */

export type LayoutChoice = {
  index: number;
  /** The chosen layout from the approved Mays set. */
  layout: MaysLayout;
  /** Short justification (one sentence). */
  reason: string;
};

export type BrandStudy = {
  choices: LayoutChoice[];
};

/* ===========================================================================
 *  Step 3 output: BrandedDeckPlan (initial)
 *  Step 4 output: BrandedDeckPlan (revised)
 *  --------------------------------------------------------------------------
 *  This is the primary plan structure. Step 3 produces the first version
 *  and Step 4 (aesthetic review) edits it in place. Same shape both times.
 * ========================================================================= */

export type BrandedSlide = {
  /** 1-based slide index in the OUTPUT deck (may not match source after splits). */
  index: number;
  /** Source slide index from the input deck, for the audit trail. */
  sourceIndex: number;
  /** Chosen layout. */
  layout: MaysLayout;
  /** Headline text. Hard cap: 8 words. Sentence case. */
  headline: string;
  /** Optional sub-headline / eyebrow. */
  eyebrow?: string;
  /** Body paragraph (used for layouts that take prose, not bullets). Hard cap: 60 words. */
  body?: string;
  /** Bullets (used for content layouts). Hard cap: 5 bullets, ~12 words each. */
  bullets?: string[];
  /** Two-column body. Used only for layout='two-column'. */
  twoColumn?: { left: string[]; right: string[]; leftHeading?: string; rightHeading?: string };
  /** Caption + alt text for image-caption layouts. */
  image?: { caption: string; altText?: string; placeholder: true };
  /** Footer override (rare). Defaults to the brand footer. */
  footer?: string;
  /** Speaker notes. Carried through to the output deck. */
  notes?: string;
  /** Free-form designer note from the review pass, e.g. "tableomitted; see source p. 7". */
  designerNote?: string;
};

export type BrandedDeckPlan = {
  slideCount: number;
  /** Whether this plan has been through the aesthetic review. */
  reviewed: boolean;
  /** Optional running header for the deck (e.g. the deck title). */
  deckTitle?: string;
  slides: BrandedSlide[];
};

/* ===========================================================================
 *  Step 5 output: AccessibilityPlan + AccessibilityReport
 *  --------------------------------------------------------------------------
 *  AccessibilityPlan is the structured set of overrides that the
 *  generator applies (alt text, reading order, color flags). The
 *  AccessibilityReport is the human-readable summary written alongside
 *  the .pptx (passed/auto-fixed/needs-review).
 * ========================================================================= */

export type AccessibilitySlideAnnotation = {
  /** Index of the slide in the BrandedDeckPlan. */
  index: number;
  /** Screen-reader-friendly slide title. Goes in the title placeholder. */
  srTitle: string;
  /** Reading order for the slide. Strings are layout regions: "title", "body", "bullets", "footer". */
  readingOrder: string[];
  /** Image alt text override, if the slide has an image. */
  imageAltText?: string;
  /** Hyperlinks on the slide, with their descriptive text (no "click here"). */
  links: Array<{ url: string; description: string }>;
  /** True when the planner flagged a contrast or color-only issue. */
  flaggedColor?: boolean;
};

export type AccessibilityPlan = {
  slides: AccessibilitySlideAnnotation[];
};

export type AccessibilityFinding = {
  /** Slide index this finding applies to (or -1 for deck-wide). */
  slideIndex: number;
  /** Category. */
  category:
    | 'alt-text'
    | 'reading-order'
    | 'contrast'
    | 'min-size'
    | 'hyperlink-text'
    | 'color-only'
    | 'table-headers'
    | 'screen-reader-title';
  /** "passed" — already meets the bar. */
  /** "auto-fixed" — the pipeline corrected it on output. */
  /** "needs-review" — flagged for human inspection (rare). */
  status: 'passed' | 'auto-fixed' | 'needs-review';
  /** One-line description for the report. */
  detail: string;
};

export type AccessibilityReport = {
  /** 0..100. Heuristic score: 100 = nothing flagged, drops 5 per needs-review item. */
  score: number;
  passedCount: number;
  autoFixedCount: number;
  needsReviewCount: number;
  findings: AccessibilityFinding[];
};

/* ===========================================================================
 *  Pipeline result
 *  --------------------------------------------------------------------------
 *  The end-to-end runner returns this. The API route picks fields off it
 *  to render the response JSON the client consumes.
 * ========================================================================= */

export type PipelineResult = {
  synthesized: SynthesizedDeck;
  brandStudy: BrandStudy;
  plan: BrandedDeckPlan;
  accessibility: {
    plan: AccessibilityPlan;
    report: AccessibilityReport;
  };
};

/**
 * Step labels emitted as progress events. Ordered list — the client
 * highlights the active step. Step 0 is the upload itself; the pipeline
 * then walks 1..6.
 */
export const PIPELINE_STEPS = [
  'uploading',
  'synthesizing',
  'studying-brand',
  'planning',
  'reviewing',
  'accessibility-pass',
  'generating',
  'ready',
] as const;

export type PipelineStep = (typeof PIPELINE_STEPS)[number];
