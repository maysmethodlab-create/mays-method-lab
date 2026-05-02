/**
 * Editorial stories — the weekly "what someone at Mays did with AI" card
 * shown at the top of /learning-community.
 *
 * One story per week, rotated automatically by week index. Hari can edit
 * this file in any week to add or replace a story. No code changes needed
 * for the rotation itself.
 *
 * Voice rules (per Hari):
 *   - Point first. One confident headline.
 *   - Two to three sentences in the blurb. Concrete nouns. Active verbs.
 *   - No em dashes. No AI cheerleader words.
 *   - The story should describe a real workflow, not "AI is amazing".
 */

import type { LearningRole } from './learning-community';
import { promptBySlug } from './prompts';

export type EditorialStoryPrompt = {
  /** Full paste-ready prompt text rendered inline below the editorial card. */
  text: string;
  /** Optional one-line caption under the copy button. */
  caption?: string;
};

export type EditorialStory = {
  /** ISO date the story was published. Useful for sort and audit. */
  publishedAt: string;
  /** Which audience this story speaks to. 'both' shows for either role. */
  role: LearningRole | 'both';
  /** Eyebrow shown above the headline. */
  eyebrow: string;
  /** Single confident headline in sentence case. */
  headline: string;
  /** 2 to 3 sentences. Hari voice. Concrete. No em dashes. */
  blurb: string;
  /** Optional CTA label, e.g. "Try the prompt". */
  cta?: string;
  /** Optional CTA href. Internal route or external link. */
  href?: string;
  /** Optional inline copy-ready prompt rendered below the editorial card. */
  prompt?: EditorialStoryPrompt;
};

const DEFAULT_PROMPT_CAPTION =
  'Paste this into TAMU AI Chat or your tool of choice.';

/** Pull a prompt's full text from src/lib/prompts.ts by slug. */
function promptTextFor(slug: string): string {
  const found = promptBySlug(slug);
  return found ? found.promptText : '';
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/* =============================================================
   Seed stories. Two per role for now. Add more as Hari writes them.
   ============================================================= */

export const EDITORIAL_STORIES: EditorialStory[] = [
  /* ---------- FACULTY ---------- */
  {
    publishedAt: '2026-05-02',
    role: 'faculty',
    eyebrow: 'Faculty story this week',
    headline: 'Twelve papers, four minutes, every theme tagged.',
    blurb:
      'A research-heavy associate professor dropped twelve PDFs into NotebookLM and asked it to map themes across the set. The AI did not write the lit review. It got her to the part where she could.',
    cta: 'Open NotebookLM',
    href: '/tools#notebooklm',
    prompt: {
      text: promptTextFor('literature-review-summary'),
      caption: DEFAULT_PROMPT_CAPTION,
    },
  },
  {
    publishedAt: '2026-04-25',
    role: 'faculty',
    eyebrow: 'Faculty story this week',
    headline: 'Thirty practice exam questions from one syllabus.',
    blurb:
      'A clinical professor pasted his syllabus into TAMU AI Chat and asked for thirty practice questions across three difficulty levels. He kept twenty, edited five, and threw out five. Forty minutes saved before noon.',
    cta: 'Try the prompt',
    href: '/prompts/exam-prep-questions',
  },

  /* ---------- STAFF ---------- */
  {
    publishedAt: '2026-05-02',
    role: 'staff',
    eyebrow: 'Staff story this week',
    headline: 'Three bullets in. A polished update out.',
    blurb:
      'A program coordinator pasted three rough bullets into TAMU AI Chat and got back a clean program announcement. She would have spent twenty minutes drafting it from scratch. The whole loop took under a minute.',
    cta: 'Try the prompt',
    href: '/prompts/announcement-writer',
    prompt: {
      text: promptTextFor('announcement-writer'),
      caption: DEFAULT_PROMPT_CAPTION,
    },
  },
  {
    publishedAt: '2026-04-25',
    role: 'staff',
    eyebrow: 'Staff story this week',
    headline: 'A confused student. A degree-plan policy doc. Cited answers.',
    blurb:
      'An advisor uploaded the degree-plan policy doc to NotebookLM and used it to answer a confused student in real time. Every answer carried a citation back to the source paragraph. No guessing, no policy hunt.',
    cta: 'Open NotebookLM',
    href: '/tools#notebooklm',
  },
];

/* =============================================================
   Helpers
   ============================================================= */

/**
 * Pick the story to feature this week for the given role.
 *
 * Rotation is deterministic by week index. For a given week and role the
 * same story shows for everyone. Each new week the index advances by one
 * and wraps. Add stories to EDITORIAL_STORIES and rotation widens
 * automatically without code changes.
 */
export function currentStoryFor(role: LearningRole): EditorialStory {
  const eligible = EDITORIAL_STORIES.filter(
    (s) => s.role === role || s.role === 'both',
  );
  if (eligible.length === 0) {
    // Defensive fallback so the page never breaks if the data is empty.
    return {
      publishedAt: new Date().toISOString().slice(0, 10),
      role,
      eyebrow: role === 'faculty' ? 'Faculty story this week' : 'Staff story this week',
      headline: 'Pilot your idea with the Lab.',
      blurb:
        'Have a workflow you wish AI handled? Email the Lab. We will pair with you for an hour and ship a working draft.',
      cta: 'Email the Lab',
      href: 'mailto:ssridhar@mays.tamu.edu?subject=Pilot%20an%20AI%20workflow',
    };
  }
  const weekIndex = Math.floor(Date.now() / WEEK_MS);
  return eligible[weekIndex % eligible.length];
}
