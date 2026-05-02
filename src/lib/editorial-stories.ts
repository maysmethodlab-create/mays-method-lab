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
    eyebrow: 'Coming soon: Mays Faculty Guidelines Chatbot',
    headline: 'Ask the guidelines. Get the exact passage with citations.',
    blurb:
      'A new Lab app in development. Type any question about promotion, evaluation, AACSB criteria, leave, or anything else in the October 2025 guidelines. The chatbot quotes the relevant section verbatim with section and page citations. For questions that need a human ruling on your specific case, one click takes you to the senior associate dean.',
    cta: 'Tell Hari what you would ask',
    href: 'mailto:ssridhar@mays.tamu.edu?subject=Faculty%20Guidelines%20Chatbot%20%E2%80%94%20input',
  },

  /* ---------- STAFF ---------- */
  {
    publishedAt: '2026-05-02',
    role: 'staff',
    eyebrow: 'Coming soon: Academic Calendar Chatbot',
    headline: 'Ask the TAMU academic calendar. Get the exact date.',
    blurb:
      'A new Lab app in preview. Type any question about registration windows, drop deadlines, finals, breaks, or graduation. The chatbot returns the specific date with a citation back to the registrar.',
    cta: 'Tell Hari what you would ask',
    href: 'mailto:ssridhar@mays.tamu.edu?subject=Academic%20Calendar%20Chatbot%20%E2%80%94%20input',
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
