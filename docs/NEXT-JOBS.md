# Next jobs — pick up here

Use this as the resume point on a new computer. Updated 2026-05-01.

## Top of the queue

1. **APT (non-tenure-track) letter quality pass.**
   The pipeline currently treats APT faculty (lecturers, clinical, professor of
   practice) as a hidden case in the same Hari-style structure. Sean's actual
   letters for Hurta and Curtsinger lean teaching+service hard. Refine the
   writing prompt for APT categories specifically:
   - No research evaluation, no negative framing of its absence (Mays §6.2).
   - Focus the body on teaching narrative (courses, evaluations, mentoring,
     student comments) and service narrative.
   - Include the AACSB paragraph about maintaining currency / relevance of
     instruction.
   - Keep total length under 800 words for APT — these letters are typically
     tighter than tenure-track letters.

   Test fixtures already in the repo:
   - `apps/Annual Evaluation Letters/Template Letters/Amy Hurta Annual Evaluation 2024.pdf`
     (Sean's actual APT letter for Hurta)
   - `apps/Annual Evaluation Letters/Template Letters/CV-Amy-Hurta-202508.pdf`
   - `apps/Annual Evaluation Letters/Template Letters/curtsinger f180.pdf`
   - `apps/Annual Evaluation Letters/Template Letters/Curtsinger.docx`
   - `apps/Annual Evaluation Letters/Template Letters/phinney f180.pdf`

   Approach: spawn a role-play agent the same way `scripts/test-stuber-comparison.mjs`
   walked Sean's letter. Generate, compare to ground truth, refine the
   APT-specific path of the writing prompt.

2. **Rename "Admin Tools".**
   The label "Admin Tools" reads bureaucratic and doesn't capture what's
   inside (an evaluation-letter writer; future apps for letters, grants,
   reviews). Brainstorm a better name and update:
   - `src/components/Header.tsx` (top nav)
   - `src/app/admin/page.tsx` (page header + card grid title)
   - `src/lib/tools.ts` (config array — tool labels)
   - The Mays Method Lab tagline / About copy if needed

   Candidates to consider: "Faculty Tools", "Department-Head Tools",
   "Faculty Workflows", "Admin Studio", "Lab Apps". Probably "Faculty
   Tools" or "Workflows" reads cleanest. Keep the same routes
   (`/admin/...`) to avoid breaking saved links — only change the label.

## Other open items

- **Mays Anthem hero.** Embed
  https://www.youtube.com/watch?v=zfZBXZ9wl54 as a paused-by-default
  YouTube background in `HeroSection.tsx` with a play/pause button overlay.
  Use the YouTube IFrame API (`enablejsapi=1`) and post `playVideo` /
  `pauseVideo` messages to the iframe.

- **Per-department letterhead images.** Right now every writer uses the
  shared `mays-default.jpg` letterhead. Drop department-specific JPGs
  into `public/letterheads/` and update `letterheadImage` per writer in
  `src/lib/evaluation-letters/writers.ts` (e.g. `mktg.jpg` for Wilcox,
  `info.jpg` for Metters). The `MKTG Letterhead.docx` template in
  `apps/Annual Evaluation Letters/Template Letters/` has the source
  art for Marketing.

- **Update `letter-skills/*.md` for Wendy / MGMT patterns.** The
  skill files were derived from Sean / Rich / Jamie letters only.
  Wendy's MGMT letters are now in `Template Letters/`; her style
  patterns should be folded in.

## How to run things

- Dev server: `npm run dev` (or already running on :3000)
- Type check: `npm run typecheck`
- Brand lint: `npm run brand-lint` (catches heading-color, sharp-corner,
  drop-shadow, palette violations — must pass before merging)
- Pipeline test against a single faculty member: see
  `scripts/test-stuber-comparison.mjs`,
  `scripts/test-agrawal-bugfix.mjs`, etc. Each script logs in, runs the
  full pipeline, saves outputs to
  `apps/Annual Evaluation Letters/test-output/<case>/`.
- Faculty roster refresh: `node scripts/scrape-faculty-roster.mjs` —
  re-pulls the entire Mays directory from
  https://mays.tamu.edu/wp-json/wp/v2/directory and writes
  `src/lib/evaluation-letters/faculty-roster.json`.

## Environment

- `.env.local` (gitignored) holds:
  - `ANTHROPIC_API_KEY` — real key required for AI generation
  - `ADMIN_PASSWORD` — currently `mml-dev-2026`
  - `SESSION_SECRET` — optional; defaults to ADMIN_PASSWORD
- Render needs the same three env vars set in the dashboard.

## Brand contract

Every page change must conform to `docs/BRAND.md`:
- Oswald 400 sentence-case maroon for H1/H2/H3
- Work Sans body
- Sharp 0px corners on buttons / inputs / pills
- `.dotted-frame` wrapping page hero panels
- `.divider` (dotted) for section separators
- No drop shadows on cards
- `npm run brand-lint` enforces these.
