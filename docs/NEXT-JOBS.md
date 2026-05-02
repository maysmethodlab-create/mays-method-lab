# Next jobs — pick up here

Use this as the resume point on a new computer. Updated 2026-05-01.

## Top of the queue (in priority order)

0. **🚨 Render deploy status — figure out what's actually happening.**
   The repo is on GitHub at https://github.com/maysmethodlab-create/mays-method-lab.
   Render service is set up via the `render.yaml` blueprint. Three fix
   commits already landed for build issues (path-alias resolution):
   - `a59abde` — added `baseUrl` to tsconfig
   - `2764e1d` — switched `src/app/about/*` to relative imports
   - `1502b4e` — bound `@/` alias explicitly in `next.config.js` webpack hook

   Local production build (`npm run build` after `rm -rf .next`) compiles
   ALL 17 routes cleanly with `1502b4e`. So the source is good.

   Last thing the user saw on Render: build log truncated at "Creating
   an optimized production build…" with no further output, no compile
   error, no success badge. Status badge color was unclear. Three
   likely scenarios:

   (a) **Out-of-memory kill on Render's free tier (512 MB).** Most likely.
       Next.js production builds spike to 700 MB-1 GB. Fix: upgrade the
       service to Starter ($7/mo, 2 GB RAM) in the Render dashboard.
       Or shrink the build via `next build --experimental-build-mode compile`
       (no minification — smaller memory footprint).

   (b) **Build still running when the user checked.** Production builds
       with no cache + a ~100 KB faculty-roster JSON in the bundle take
       ~90 seconds on Render free tier. Just wait, refresh the deploy
       page in 2 min.

   (c) **A different webpack error after "Creating an optimized
       production build…" that wasn't visible in the truncated log.**
       Get the FULL log tail (last 50 lines, or scroll to the very
       bottom and copy) before doing anything else.

   First action when you pick this up: open the Render dashboard, look
   at the badge color of the most recent deploy.
   - 🟡 In progress → wait
   - 🔴 Failed + truncated log → upgrade plan to Starter, OR ask the
     dashboard for the full log
   - 🟢 Live → done; visit the URL printed at the top

1. **🐛 Faculty dropdown not showing in Step 2.**
   User reported in the last session: when going through the
   evaluation-letter workflow, the faculty directory dropdown was empty
   / not displaying any names. Something broke in recent changes.
   Likely culprits to inspect first:
   - `src/components/evaluation-letters/FacultyPicker.tsx` — the strict
     scope change removed the "Show all departments" toggle and the
     all-groups path. If `writerId` from setup isn't reaching the
     picker correctly, `writerDept` will be `null` and the dropdown
     renders an empty state instead of any faculty.
   - `src/lib/evaluation-letters/faculty-roster.ts` — the dean
     exclusion regex (`isEvaluableFaculty`) might over-filter. Run:
     ```
     node -e "const {evaluableFacultyByDepartment} = require('./src/lib/evaluation-letters/faculty-roster.ts'); /* ts file - use ts-node or compile */"
     ```
     Or check the roster JSON directly — should still show ~40 per
     dept after dean exclusion.
   - `src/components/evaluation-letters/UploadStep.tsx` — verify that
     `setup.writerId` is being passed into `<FacultyPicker writerId={...} />`.
   First action: open the browser, inspect the page in dev tools, see
   if FacultyPicker rendered the empty-state warning ("Choose a writer
   in the previous step first") or rendered nothing at all. The
   browser console + the `evaluableFacultyByDepartment()` return value
   tells you which side is broken.

2. **APT (non-tenure-track) letter quality pass.**
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

3. **Rename "Admin Tools".**
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

4. **Mays Anthem YouTube hero.** Embed
   https://www.youtube.com/watch?v=zfZBXZ9wl54 as a paused-by-default
   YouTube background in `src/components/HeroSection.tsx` with a small
   play/pause button overlay in the bottom-right corner. Use the
   YouTube IFrame API (`enablejsapi=1`) and post `playVideo` /
   `pauseVideo` messages to the iframe via
   `iframe.contentWindow.postMessage(...)`. Iframe URL format:
   `https://www.youtube.com/embed/zfZBXZ9wl54?autoplay=0&mute=1&loop=1&playlist=zfZBXZ9wl54&controls=0&modestbranding=1&playsinline=1&enablejsapi=1`.
   Keep the white `.hero-card` floating over the bottom-left.

## Other open items

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
