# APT Skill Upgrade — Design

**Date:** 2026-05-01
**Status:** Approved by Hari, ready to implement.

---

## 1. Goal

Make APT (Academic Professional Track) annual evaluation letters as
trustworthy as TT letters. Today the pipeline correctly identifies APT
faculty and routes them to APT skill files, but the generated letter
ends up in *Hari's structural voice* (bold headings: Summary of Major
Accomplishments / My Observations / Looking Ahead / Summary) instead of
the writer's own voice (Sean writes flowing paragraphs with no headings;
Rich uses bullet-point teaching lists; Wendy weaves stories).

Bar for "good enough to demo": a writer can generate an APT letter with
**< 15 % manual editing**.

---

## 2. Baseline (what we observed today)

Ran `scripts/test-hurta-apt-baseline.mjs` against Sean's actual 2024
letter for Amy Hurta. Diff highlights:

| Aspect | Sean's actual | AI-generated |
|---|---|---|
| Length | 660 words | 1,100 words (+70 %) |
| Section headings | None — flowing paragraphs | Four bold headings |
| Opening | "Thank you for submitting your annual Professional Activity and Accomplishment Report this spring. The purpose of this memo is..." | "Thank you for submitting your materials... This memorandum follows our annual performance review meeting..." |
| Salutation | None | "Dear Amy," |
| FROM block | 2 lines (Sean McGuire, Professor and Department Head / department) | 4 lines (incl. endowed chair + Presidential Impact Fellow) |
| AACSB paragraph | Discrete block with quoted AACSB language | Woven into 2 paragraphs |
| Closing | "Please contact Diana Kruse to schedule a time to meet with me… Thank you for everything that you do for our students and department!" | "Please return a signed copy… Thank you." |
| Forward-looking | Specific (co-teaching ACCT 405 Fall 2025, expanding ACCT 421 to 3-hour) | Generic |

The *content* (courses, AI Faculty Learning Committee, BUSN 101
mentoring, CPA license, AACSB instruction-currency requirement) was
mostly accurate — extracted faithfully from the CV. The structure and
voice were wrong.

Fixtures available (12 APT cases across 4 writers, all 6 ranks
represented):
- **Sean** — Allen, Hurta, Ranzilla
- **Rich** — Berberian, Boone, Curtsinger, Phinney, Stech
- **Wendy** — McFarland, Panina
- **Jamie** — Amos, White (PDF only — no parseable text yet)

---

## 3. Approach — B + C

**(B)** Per-writer style overrides on top of a generic APT skill.
**(C)** Inline 1 – 2 actual exemplar letters per writer × track in the
prompt at draft time.

(B) gives clean structural control; (C) gives voice fidelity. Together
they let us tune the system as more letters arrive without rewriting
prompts.

---

## 4. Architecture changes

### 4.1 New per-writer style override block in `writers.ts`

Extend the `Writer` type with optional fields:

```ts
type Writer = {
  // ... existing
  styleOverrides?: WriterStyleOverrides;
};

type WriterStyleOverrides = {
  /** How many lines in the FROM block. Default = 4 (name, title,
   *  chair, honors). Sean = 2, Rich = 3, etc. */
  fromBlockLines?: number;

  /** Whether to use bold section headings. Default = true (Hari).
   *  Sean = false, Rich = true (his are different though). */
  useSectionHeadings?: boolean;

  /** Target letter length range, in words. Default = 800-1200. */
  targetWords?: { min: number; max: number };

  /** Salutation style. 'none' = no "Dear X,". 'first' = "Dear Amy,".
   *  'formal' = "Dear Dr. Hurta,". Default = 'first'. */
  salutationStyle?: 'none' | 'first' | 'formal';

  /** Where the AACSB paragraph goes for APT letters. 'discrete' = its
   *  own paragraph block. 'woven' = integrated into teaching/service
   *  paragraphs. Default = 'discrete'. */
  aacsbPlacement?: 'discrete' | 'woven';

  /** Per-writer signature closing line(s) that get appended verbatim. */
  closingLines?: string[];
};
```

Initial values for the four APT writers (derived from the fixtures we
have today; will update as more letters arrive):

- **Sean (`mcguire`):** `fromBlockLines: 2, useSectionHeadings: false, targetWords: { min: 550, max: 750 }, salutationStyle: 'none', aacsbPlacement: 'discrete', closingLines: ['Please let me know if you have any questions about my assessment. To that end, please contact Diana Kruse to schedule a time to meet with me if you would like to discuss my assessment.', 'Thank you for everything that you do for our students and department!']`
- **Rich (`metters`):** `fromBlockLines: 3, useSectionHeadings: true, targetWords: { min: 500, max: 800 }, salutationStyle: 'none', aacsbPlacement: 'discrete'`
- **Wendy (`boswell`):** TBD — populate after first Wendy APT diff.
- **Jamie (`brown`):** TBD — populate after first Jamie APT diff.

### 4.2 Exemplar letter pool

New file: `src/lib/evaluation-letters/apt-exemplars.ts`. A static map
from `(writerId, roleCategoryId)` → array of exemplar letter file paths
(under `Template Letters/`). At draft time, the prompt builder picks
1 – 2 best-matching exemplars and inlines the letter text as
"REFERENCE LETTERS — match the structure, voice, and length of these".

```ts
export const APT_EXEMPLARS: Record<string, string[]> = {
  'mcguire/apt-lecturer': [
    'Accounting (McGuire)/Hurta, Amy [APT]/Hurta_Annual_Review_2024.txt',
    'Accounting (McGuire)/Allen, Natalie [APT]/Allen_Annual_Review_2024.txt',
  ],
  'mcguire/apt-practice': [
    'Accounting (McGuire)/Ranzilla, Sam [APT]/Ranzilla_Annual_Review_2024.txt',
  ],
  'metters/apt-lecturer': [
    'Information & Operations (Metters)/Curtsinger, Wanda [APT]/Curtsinger_Annual_Review_2025.txt',
    'Information & Operations (Metters)/Boone, Ted [APT]/Boone_Annual_Review_2025.txt',
  ],
  'boswell/apt-clinical': [
    'Management (Boswell)/Panina, Daria [APT]/Daria Panina 2025.docx',
    'Management (Boswell)/McFarland, Ken [APT]/McFarland, Ken.docx',
  ],
  // ... extend as letters arrive
};
```

Resolved via the existing `templateFile()` helper so paths stay stable
even if the directory tree shifts.

### 4.3 Prompt builder changes

`src/lib/evaluation-letters/prompts.ts` (the draft-phase prompt) gets a
new branch for APT roles. The branch:

1. Loads the writer record from `writers.ts`.
2. Loads the matching APT skill file (existing
   `lecturer-and-senior-lecturer.md` or
   `executive-professor-and-professor-of-practice.md`).
3. Loads the writer's style overrides (default fallbacks if none set).
4. Loads exemplar letters for this `(writerId, roleCategoryId)` pair, if
   available.
5. Composes a prompt that lays out:
   - APT structural rules (no research, AACSB, target length, etc.)
   - Writer-specific style rules (heading use, FROM lines, salutation,
     AACSB placement, closing lines)
   - 1 – 2 exemplar letters as "match this voice and structure"
   - Source documents and writer notes

The TT branch is unchanged.

---

## 5. Update path — what happens when new letters arrive

Three files only:

1. **`writers.ts`** — refine `styleOverrides` once you've seen 3-5
   real letters from a given writer (richer fields, better targetWords).
2. **`apt-exemplars.ts`** — drop in better exemplars; rotate out old
   ones as patterns sharpen.
3. **`apps/Annual Evaluation Letters/letter-skills/*.md`** — only edit
   when you see a *structural* pattern not yet captured (e.g., Wendy
   uses a "Colleague & Department Citizenship" mini-section that Sean
   doesn't).

Adding a new writer (e.g., Wilcox once Marketing letters arrive) is a
3-line change in `writers.ts` plus one line in `apt-exemplars.ts`.

---

## 6. Test plan

Each upgrade pass = re-run the diff. Scripts:

- `scripts/test-hurta-apt-baseline.mjs` (already exists from today)
- `scripts/test-curtsinger-apt-baseline.mjs` — new, Rich/lecturer
- `scripts/test-panina-apt-baseline.mjs` — new, Wendy/clinical

For each, write the AI letter and a side-by-side diff to
`apps/Annual Evaluation Letters/test-output/<case>/`. The pass criterion
is **< 15 % word-level diff after manual rating + minimal edit pass**.

---

## 7. Out of scope (deferred)

- **Per-writer TT voice calibration.** Same approach will eventually
  apply, but TT generation is already adequate; APT is the gap that
  blocks the demo.
- **Marketing exemplars.** Zero Wilcox letters today; revisit after
  Hari's outreach to Wilcox.
- **Letter archive (year-over-year continuity).** Already deferred per
  the broader roadmap.

---

## 8. Open questions

None blocking. Hari will validate by running the upgraded pipeline on
Hurta after implementation; if the diff still shows > 15 % drift, we
iterate before rolling to the other 11 APT cases.
