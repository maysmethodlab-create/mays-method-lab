# APT Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring APT-letter generation up to "demo-ready" by tightening the Hurta diff vs Sean's actual letter from ~70% drift to <15%, then proving the same approach works for Rich (Curtsinger) and Wendy (Panina).

**Architecture:** Per the design doc at [docs/plans/2026-05-01-apt-skill-design.md](docs/plans/2026-05-01-apt-skill-design.md). Add a `WriterStyleOverrides` block on each writer in `writers.ts`. Add a new `apt-exemplars.ts` map keyed by `(writerId, roleCategoryId)`. Add an APT-specific branch to the `writingPrompt` builder in `prompts.ts` that loads overrides + 1-2 exemplar letters and stops Hari's structural template from overriding Sean's voice.

**Tech Stack:** TypeScript / Next.js 14 / Anthropic SDK. No formal test framework — verification is via the diff scripts in `scripts/test-*-baseline.mjs` against ground-truth letters.

---

## Phase 1: Per-writer style overrides

### Task 1.1: Add `WriterStyleOverrides` type and seed values

**Files:**
- Modify: `src/lib/evaluation-letters/writers.ts`

**Step 1.** Read the file end-to-end to confirm current shape.

**Step 2.** Add the type above `WRITERS`:

```ts
export type WriterStyleOverrides = {
  /** How many lines of the FROM block to render. Default = all
   *  available lines from fromBlockLines(). Sean = 2 (suppresses chair
   *  and honors), Rich = 3 (chair, no honors). */
  fromBlockMaxLines?: number;

  /** Whether the body uses bold section headings. Default = true
   *  (Hari pattern). Sean = false. */
  useSectionHeadings?: boolean;

  /** Target letter length range in words. Default = { min: 700, max: 1100 }. */
  targetWords?: { min: number; max: number };

  /** Salutation style. 'none' = no "Dear X," — letter goes straight from
   *  SUBJECT line to body. Default = 'first'. Sean = 'none'. */
  salutationStyle?: 'none' | 'first' | 'formal';

  /** Where the AACSB paragraph goes in APT letters. Default = 'discrete'. */
  aacsbPlacement?: 'discrete' | 'woven';

  /** Closing line(s) appended verbatim before the writer's name. */
  closingLines?: string[];

  /** Opening boilerplate verbatim. Used in place of the generic
   *  "Thank you for submitting your materials..." line. Sean has a
   *  specific opening pattern that always appears in his letters. */
  openingBoilerplate?: string;
};
```

Add `styleOverrides?: WriterStyleOverrides;` to the `Writer` type.

**Step 3.** Populate Sean (`mcguire`) overrides per the diff findings:

```ts
styleOverrides: {
  fromBlockMaxLines: 2,
  useSectionHeadings: false,
  targetWords: { min: 550, max: 800 },
  salutationStyle: 'none',
  aacsbPlacement: 'discrete',
  closingLines: [
    'Please let me know if you have any questions about my assessment. To that end, please contact Diana Kruse to schedule a time to meet with me if you would like to discuss my assessment.',
    'Thank you for everything that you do for our students and department!',
  ],
  openingBoilerplate: 'Thank you for submitting your annual Professional Activity and Accomplishment Report this spring. The purpose of this memo is to provide you with my assessment of your performance from January 1, {YEAR} to December 31, {YEAR}. My assessment is based upon the Mays Guidelines and will be the basis for any department resource allocation decisions and for the reappointment decision. Following the Mays Guidelines, the performance categories are excellent, effective, needs improvement, and unsatisfactory.',
},
```

**Step 4.** Populate Rich (`metters`) overrides — derived from his bundled lecturer / associate letters:

```ts
styleOverrides: {
  fromBlockMaxLines: 3,
  useSectionHeadings: true,
  targetWords: { min: 500, max: 850 },
  salutationStyle: 'none',
  aacsbPlacement: 'discrete',
},
```

**Step 5.** Leave Wendy and Jamie without explicit overrides for now — their default behavior (Hari pattern) will be observed in baseline runs in Phase 4 and tuned then.

**Step 6.** Commit:

```bash
git add src/lib/evaluation-letters/writers.ts
git commit -m "Add WriterStyleOverrides type and seed Sean + Rich values"
```

---

### Task 1.2: Add a helper to access overrides safely with defaults

**Files:**
- Modify: `src/lib/evaluation-letters/writers.ts`

**Step 1.** At the bottom of the file, add a `resolveStyleOverrides(writerId)` helper that returns the writer's overrides merged with defaults:

```ts
const DEFAULT_STYLE_OVERRIDES: Required<WriterStyleOverrides> = {
  fromBlockMaxLines: 99,
  useSectionHeadings: true,
  targetWords: { min: 700, max: 1100 },
  salutationStyle: 'first',
  aacsbPlacement: 'discrete',
  closingLines: [],
  openingBoilerplate: '',
};

export function resolveStyleOverrides(writerId: string): Required<WriterStyleOverrides> {
  const writer = getWriter(writerId);
  return { ...DEFAULT_STYLE_OVERRIDES, ...(writer?.styleOverrides ?? {}) };
}
```

**Step 2.** Commit:

```bash
git add src/lib/evaluation-letters/writers.ts
git commit -m "Add resolveStyleOverrides helper"
```

---

## Phase 2: Exemplar letter pool

### Task 2.1: Create `apt-exemplars.ts`

**Files:**
- Create: `src/lib/evaluation-letters/apt-exemplars.ts`

**Step 1.** Write the file:

```ts
import fs from 'node:fs';
import path from 'node:path';

const TEMPLATES_ROOT = path.join(
  process.cwd(),
  'apps',
  'Annual Evaluation Letters',
  'Template Letters',
);

/**
 * Map from "<writerId>/<roleCategoryId>" to a list of exemplar letter
 * file paths (RELATIVE to Template Letters/). At draft time the prompt
 * builder loads these so the model has a concrete voice and structure
 * to imitate.
 *
 * As more real letters arrive, swap in better exemplars or rotate
 * older ones out — the rest of the pipeline picks up the change with
 * no further edits.
 */
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
};

/**
 * Resolve and read 0-2 exemplar letters for the given writer + role
 * combination. Returns an empty string if none are configured.
 */
export function loadApt Exemplars(writerId: string, roleCategoryId: string): string {
  const key = `${writerId}/${roleCategoryId}`;
  const paths = APT_EXEMPLARS[key];
  if (!paths || paths.length === 0) return '';
  const out: string[] = [];
  for (const rel of paths) {
    const abs = path.join(TEMPLATES_ROOT, rel);
    try {
      const text = fs.readFileSync(abs, 'utf8');
      out.push(`--- EXEMPLAR LETTER (${path.basename(rel)}) ---\n${text}`);
    } catch {
      // missing exemplar — skip silently; the model will fall back to
      // the skill file alone.
    }
  }
  return out.join('\n\n');
}
```

(Fix the typo: `loadApt Exemplars` → `loadAptExemplars` when actually writing.)

**Step 2.** Commit:

```bash
git add src/lib/evaluation-letters/apt-exemplars.ts
git commit -m "Add APT exemplar pool with Sean and Rich seed entries"
```

---

## Phase 3: Prompt builder branch for APT

### Task 3.1: Read `writingPrompt` end-to-end

**Files:**
- Read: `src/lib/evaluation-letters/prompts.ts:135-271`
- Read: the route that calls it: `src/app/api/evaluation-letters/draft/route.ts`

Confirm the contract: what fields are passed in, where `args.hasResearchEvaluation` toggles the research block, and where the body-section prose is generated.

### Task 3.2: Extend `WritingPromptArgs` with overrides + exemplars

**Files:**
- Modify: `src/lib/evaluation-letters/prompts.ts` (the `WritingPromptArgs` type definition above `writingPrompt`)

**Step 1.** Add to the type:

```ts
type WritingPromptArgs = {
  // ... existing
  styleOverrides: Required<WriterStyleOverrides>;
  exemplars: string;  // resolved exemplar text or empty string
};
```

**Step 2.** Update the draft route to populate them:

In `src/app/api/evaluation-letters/draft/route.ts`:

```ts
import { resolveStyleOverrides } from '@/lib/evaluation-letters/writers';
import { loadAptExemplars } from '@/lib/evaluation-letters/apt-exemplars';

// inside the handler, before calling writingPrompt:
const styleOverrides = resolveStyleOverrides(setup.writerId);
const exemplars = loadAptExemplars(setup.writerId, setup.roleCategoryId);
```

Pass both into `writingPrompt`.

### Task 3.3: Branch the body-structure section of `writingPrompt` for APT

**Files:**
- Modify: `src/lib/evaluation-letters/prompts.ts:135-271`

**Step 1.** Replace the existing single-path body-structure block with a branch:

```ts
const isApt = !args.hasResearchEvaluation;

const headerStyle = args.styleOverrides.useSectionHeadings
  ? 'Use bold section headings wrapped in **double-asterisks** for the body sections listed below.'
  : 'Do NOT use bold section headings. Write the body as flowing paragraphs only — no headings, no bullets except where the writer''s style explicitly uses them.';

const fromLines = args.writerFromLines.slice(0, args.styleOverrides.fromBlockMaxLines);

const salutation = args.styleOverrides.salutationStyle === 'none'
  ? '(no salutation — go straight from SUBJECT to body)'
  : `"Dear ${args.recipientFirstName},"`;

const targetLength = `Target length: ${args.styleOverrides.targetWords.min}-${args.styleOverrides.targetWords.max} words. Be concise. Cut filler.`;

const opening = args.styleOverrides.openingBoilerplate
  ? args.styleOverrides.openingBoilerplate.replace(/\{YEAR\}/g, String(args.evaluationYear))
  : 'Thank them, reference their Professional Activity Report (faculty) or self-evaluation (staff/APT), note this letter follows the annual performance review meeting.';

const closingBlock = args.styleOverrides.closingLines.length > 0
  ? `Close with these lines verbatim:\n${args.styleOverrides.closingLines.map((l, i) => `   ${i + 1}. ${l}`).join('\n')}`
  : '';
```

**Step 2.** Replace the `BODY STRUCTURE:` block in the role prompt (currently lines ~219-253 of prompts.ts) with a branch:

```ts
const bodyStructure = isApt ? `
APT BODY STRUCTURE:

${headerStyle}

${args.styleOverrides.useSectionHeadings ? `
Use these bold sections in this order:
1. **Teaching** — primary section, longest. Be specific to courses, evaluations, mentoring, curricular contributions.
2. **Service** — committee work, student-org advising, BUSN 101, etc.
3. **AACSB** — discrete paragraph quoting AACSB language about maintaining instructional currency. Mention CPA / professional license if relevant.
` : `
Write 3-5 flowing paragraphs in this order, no headings:
- Paragraph 1-2: Teaching narrative — specific course numbers, evaluations, course development, student feedback.
- Paragraph 3 (only if substantial): Service narrative — committee work, advising, BUSN 101, exam proctoring, etc.
- Paragraph 4: AACSB paragraph — discrete block. Quote AACSB language directly. Mention CPA / professional license if relevant.
- Paragraph 5: Closing — support stated goals, encourage growth, warm close.
`}

${closingBlock}

${targetLength}

CRITICAL: This is APT. Do NOT include any research evaluation. Do NOT reference the absence of research negatively. Per Mays Guidelines Section 6.2, lack of research activity is NOT a negative factor.

${args.exemplars ? `\nREFERENCE LETTERS — match the structure, voice, and length of these exemplars from the same writer:\n\n${args.exemplars}\n` : ''}
` : `
[ existing TT body structure block — unchanged ]
`;
```

**Step 3.** Replace the existing `REQUIRED HEADER` salutation/from-block lines with the override-aware versions:

```ts
3. TO/FROM/SUBJECT block:
   TO: ${args.recipientName}
       ${args.recipientTitle}
   FROM: ${fromLines.map((l, i) => (i === 0 ? l : `         ${l}`)).join('\n   ')}
   SUBJECT: ${args.evaluationYear} Performance Evaluation

4. SALUTATION: ${salutation}

5. OPENING: ${opening}
```

**Step 4.** Commit:

```bash
git add src/lib/evaluation-letters/prompts.ts src/app/api/evaluation-letters/draft/route.ts
git commit -m "Branch writingPrompt for APT: respects writer style overrides and exemplars"
```

---

## Phase 4: Re-run Hurta and iterate to <15% drift

### Task 4.1: Run baseline test

```bash
node scripts/test-hurta-apt-baseline.mjs
```

**Verify:** check `apps/Annual Evaluation Letters/test-output/hurta-apt-baseline/06-final.md` against `Template Letters/Accounting (McGuire)/Hurta, Amy [APT]/Hurta_Annual_Review_2024.txt`.

### Task 4.2: Diff and measure

For each of these criteria, mark PASS or FAIL:

- Word count within Sean's range (550-800)
- No bold section headings
- 2-line FROM block
- No "Dear Amy,"
- Sean's actual opening boilerplate (or close paraphrase)
- Discrete AACSB paragraph
- Sean's closing lines (or close)
- ACCT 405 co-teaching mention
- Forward-looking specifics from notes (Fall 2025 ACCT 405, ACCT 421 expansion)

**If all PASS:** proceed to Phase 5.
**If any FAIL:** identify root cause (skill file? override field? prompt branch?), refine, re-run.

### Task 4.3: Commit when Hurta is at <15% drift

```bash
git add .
git commit -m "Hurta APT baseline at <15% drift vs Sean's actual letter"
```

---

## Phase 5: Validate on Rich (Curtsinger) and Wendy (Panina)

### Task 5.1: Create Curtsinger baseline test

**Files:**
- Create: `scripts/test-curtsinger-apt-baseline.mjs`

Copy `scripts/test-hurta-apt-baseline.mjs` and adapt:
- writerId: `metters`
- recipientName: Wanda Curtsinger
- roleCategoryId: `apt-lecturer`
- ratings from her actual letter (read `Template Letters/.../Curtsinger_Annual_Review_2025.txt`)
- notes synthesized from the letter
- file: `curtsinger f180.pdf` plus `Curtsinger.docx`

Run, diff, log gaps.

### Task 5.2: Create Panina baseline test

Same as 5.1 but for Daria Panina (Wendy / `apt-clinical`). Note: Panina is `apt-clinical`, not `apt-lecturer`. Verify that branch routes through the same prompt logic.

### Task 5.3: If Wendy or Jamie show drift, populate their `styleOverrides`

After observing Wendy's actual letter pattern in the diff, add her overrides to `writers.ts` (Task 1.1 schema). Same for Jamie if their letter ever provides parseable text.

---

## Phase 6: Update NEXT-JOBS and ship

### Task 6.1: Update `docs/NEXT-JOBS.md`

Mark APT skill as in-flight or done. Update the "next priority" section.

### Task 6.2: Commit and push

```bash
git add docs/NEXT-JOBS.md
git commit -m "Update NEXT-JOBS: APT skill at <15% drift across Sean, Rich, Wendy"
git push
```

Render auto-deploys.

---

## Out of scope for this plan

- Letter archive / year-over-year continuity (deferred per design doc).
- Per-department letterhead images (separate concurrent track per Hari's earlier ask — files exist in `_templates/MKTG Letterhead.docx`; remaining departments to be extracted from existing letter files).
- Better Observations prompt UX (separate task — see Hari's ask earlier).
- TT voice calibration (gated on letter collection from each writer).
- More obvious "Edit body" affordance in `GenerateStep.tsx` (small UX polish — note: textarea is already editable, just needs a clearer label).
