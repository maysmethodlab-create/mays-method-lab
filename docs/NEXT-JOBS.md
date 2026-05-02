# Next jobs — pick up here

Updated 2026-05-02 morning. Production live at https://mays-method-lab.onrender.com/.

## What landed overnight (2026-05-01 → 2026-05-02)

Six commits shipped and auto-deployed clean to Render. Production verified HTTP 200 at the home, /admin/evaluation-letters (307 → /login), and /admin/endowed-positions (307 → /login).

- **🎉 New app shipped: Endowed Positions Letter Writer.** `/admin/endowed-positions`. Full 5-step workflow (Setup → Upload → MRC Votes → Generate → Download). Default landing case is **Len Berry** (FY27 Reappoint Chair, Marketing) with a dismissable demo banner and a 5-0 unanimous-Chair vote pre-loaded. AI prompt returns a strict JSON envelope (4 fields) and the server stitches the verbatim Boivie boilerplate around it, so the model never reproduces institutional language. .docx output includes both tables (outcome + MRC composition) and the 5-line signature block. FY27 candidate roster (24 candidates) is seeded; per-candidate materials are gitignored. Smoke test on Stauffer (4-1 Professorship vote) passes end-to-end.
- **APT skill — Phases 1-3 shipped.** Per-writer style overrides on `writers.ts` (Sean: 2-line FROM, no headings, 550-800 words; Rich: 3-line FROM, headings, 500-850 words). New `apt-exemplars.ts` pool with Sean and Rich seed exemplars. `prompts.ts` `writingPrompt` now branches for APT and threads the overrides + exemplars into the prompt.
- **APT validation: Hurta 8/9 PASS.** AI letter went from 7,625 chars (Hari-voice, ~70% over Sean) to 4,496 chars (~22% over). Now in Sean's voice: flowing paragraphs, no salutation, exact opening boilerplate, discrete AACSB paragraph, Diana Kruse closing line. The one miss: forward-looking specifics (Fall 2025 ACCT 405, ACCT 421 expansion to 3-hour) didn't survive into the letter.
- **APT validation: Curtsinger structurally right, length 2× over Rich.** Bold sections, "Research, Not applicable", peer-comment paragraph, signature box are all in. But length is ~1,400 words vs Rich's 700, and the prompt forced an AACSB paragraph which Rich never writes. Tuning needed (see job 1 below).
- **3 prompted Observations questions** replace the single free-text notes box on Step 2. Stand-out / growth-area / sensitive. Concatenated into the existing `notes` string for the prompt.
- **Per-department letterheads.** `mktg.png` (genuine Marketing letterhead), `info.jpg`, `acct.jpg`, `mgmt.jpg` extracted from existing letter docs and wired through `writers.ts`. Brown (Finance) stays on default — no source available. `docx-generator.ts` now picks the right ImageRun type by extension.
- **Auto-save + Start over.** Both workflow apps (evaluation-letters, endowed-positions) now persist state to `localStorage` with a 4MB cap and per-file truncation fallback, hydrate on mount, and show a "Start over" link in the top-right of every step (with a `confirm()` guard).
- **Phase 1 box renamed Research → Extract** in user-visible copy.
- **Mays Anthem YouTube hero** autoplays muted with a Pause toggle; hero card enlarged.
- **Faculty dropdown bug fixed** — Step 2 dropdown is scoped to writer's department.
- **Render build fixed** — moved tailwindcss + typescript + postcss + autoprefixer + @types/* to dependencies so `npm install` doesn't drop them under `NODE_ENV=production`.
- **Template Letters reorganized** — 5-department / per-individual structure; bundled letters split into per-recipient .txt; `INVENTORY.md` documents the layout. `scripts/_template-files.mjs` resolves any filename to its location in the new tree, so existing test scripts and `letter-skills.ts` keep working.

## Top of the queue (in priority order)

1. **APT skill — finish the calibration loop.**
   - **Hurta:** add the missing forward-look. The prompt picked up "continue to evaluate and improve the courses" but dropped the Fall 2025 ACCT 405 co-teaching mention and the ACCT 421 → 3-hour expansion. Suspect: the writingPrompt's "DO NOT include a Summary section" rule may also be eating forward-looking text. Re-read `prompts.ts` lines 250-260 and find a way to require a 1-2 sentence forward-look paragraph. Re-run `BASE_URL=https://mays-method-lab.onrender.com ADMIN_PASSWORD=mml-dev2026 node scripts/test-hurta-apt-baseline.mjs` and check `apps/Annual Evaluation Letters/test-output/hurta-apt-baseline/06-final.md` for the Fall 2025 mention.
   - **Curtsinger:** Rich's letter is structurally right but 2× too long, and AACSB is being forced. Two changes to `writers.ts` styleOverrides for Metters: (a) drop targetWords max to ~700; (b) add a new field `aacsbPlacement: 'omit'` (extend the type) and add the omit branch in the APT prompt at `prompts.ts`. Re-run `node scripts/test-curtsinger-apt-baseline.mjs` and check word count + absence of AACSB section.
   - **Panina:** not yet run. Wendy Boswell hasn't had styleOverrides populated. Use Wendy's actual letter (`Template Letters/Management (Boswell)/Panina, Daria [APT]/Daria Panina 2025.docx`) to derive her overrides, then create `scripts/test-panina-apt-baseline.mjs` (clone Curtsinger), run, validate.
   - Pass criteria are still 7+/9 from the Hurta plan.

2. **Endowed Positions — wire the live LLM call.**
   The agent reported `.env.local`'s `ANTHROPIC_API_KEY` was empty during its run; the smoke test fell back to the placeholder code path which still produces a valid envelope-stitched memo, but the achievement paragraph is generic. Verify the local `.env.local` (it shows `sk-ant-api03-...`), restart the dev server, re-run `node scripts/test-endowed-stauffer-baseline.mjs`, confirm the achievement paragraph is real LLM output. Also: the `summaryReasonsClause` placeholder uses "(her/their)" pronoun fallback — test that the LLM path produces clean prose without it.

3. **Endowed Positions — backfill department-head names in `candidates.ts`.**
   Today they're best-guess from the public roster (Wilcox / Brown / Boswell / McGuire / Metters). Confirm by reading each candidate's actual nomination packet header in `Senior Associate Dean/RESEARCH/Endowed Positions/Process for Endowed Letters/FY27 Endowed Packets/`. The user already says they'll be replaced via the Setup form anyway, but better defaults speed demos.

4. **Wendy / Jamie writers — fill in styleOverrides** once they have at least 2 real letters each.
   Wendy: only Panina + McFarland letters today. Jamie: Amos and White are PDFs without parseable text yet. Once OCR or hand-transcription is available, populate `writers.ts` overrides for them. Until then, both fall back to the Hari pattern, which is workable but not voice-matched.

5. **Local Windows `npm run build`** still trips on OneDrive sync errors during the static-export phase (`EINVAL: invalid argument, readlink ...BUILD_ID`). Render Linux build is unaffected. If it becomes annoying for local dev, either move the project off OneDrive or add a `next.config.js` setting to skip static export of the marketing pages. Low priority.

6. **Stage 1 (department-head writes endowed nomination letter)** and **Stage 3 (Dean writes appointment letter)** for the Endowed Positions app. Templates exist in the source folder. Defer until Hari has the FY27 Stage-2 cycle done — the demand for those stages is post-MRC.

## How to run things

- Dev server: `npm run dev` (port 3000). If `.next` cache gets corrupted from parallel agent edits, `rm -rf .next tsconfig.tsbuildinfo` and restart.
- Type check: `npm run typecheck`
- Brand lint: `npm run brand-lint` (catches heading-color, sharp-corner, drop-shadow, palette violations — must pass before merging)
- APT diff scripts:
  - `BASE_URL=https://mays-method-lab.onrender.com ADMIN_PASSWORD=mml-dev2026 node scripts/test-hurta-apt-baseline.mjs`
  - `BASE_URL=https://mays-method-lab.onrender.com ADMIN_PASSWORD=mml-dev2026 node scripts/test-curtsinger-apt-baseline.mjs`
  - Outputs land in `apps/Annual Evaluation Letters/test-output/<case>/`
- Endowed smoke test: `node scripts/test-endowed-stauffer-baseline.mjs` — outputs to `apps/Endowed Positions Letter Writer/test-output/stauffer-baseline/`
- Faculty roster refresh: `node scripts/scrape-faculty-roster.mjs`

## Environment

- `.env.local` (gitignored) holds:
  - `ANTHROPIC_API_KEY` — real key required for AI generation
  - `ADMIN_PASSWORD` — currently `mml-dev-2026` (with hyphen)
  - `SESSION_SECRET` — optional; defaults to ADMIN_PASSWORD
- Render env vars (set in dashboard, not synced from `render.yaml`):
  - `ANTHROPIC_API_KEY` — real key
  - `ADMIN_PASSWORD` — `mml-dev2026` (no hyphen — different from local)
  - `NODE_ENV=production`, `NODE_VERSION=20.11.1`

## Brand contract

Every page change must conform to `docs/BRAND.md`:
- Oswald 400 sentence-case maroon for H1/H2/H3
- Work Sans body
- Sharp 0px corners on buttons / inputs / pills
- `.dotted-frame` wrapping page hero panels
- `.divider` (dotted) for section separators
- No drop shadows on cards
- `npm run brand-lint` enforces these.
