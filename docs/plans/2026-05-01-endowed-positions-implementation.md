# Endowed Positions Letter Writer — Implementation Plan

**Date:** 2026-05-01
**Companion to:** `2026-05-01-endowed-positions-design.md`

---

## Phase A — Library scaffolding

1. Create `src/lib/endowed-positions/` with: `types.ts`, `candidates.ts`,
   `mrc.ts`, `boilerplate.ts`, `prompts.ts`, `assemble.ts`,
   `docx-generator.ts`.
2. Boilerplate constants: copy verbatim from the Boivie example. Replace
   "Fiscal Year 2024" with `{FISCAL_YEAR}` placeholder so the assembler can
   substitute (Boivie's letter has FY2024 — for FY27 candidates we'll
   substitute "Fiscal Year 2027").
3. `assemble.ts` exports `assembleLetter(parts, ctx)` that produces the
   full memo text in the structure expected by the .docx generator. The .docx
   generator does NOT parse this text; it builds paragraphs from the
   assembled struct directly. The text is stored on the draft so the user
   can see and edit the prose in the UI.

## Phase B — API routes

1. `extract/route.ts` — copy the eval-letters route verbatim (it already
   accepts `.docx`/`.pdf`).
2. `draft/route.ts` — accepts `setup`, `votes`, `sourceDocuments`. Calls
   Claude with the draft prompt, expects a fenced JSON block, parses, calls
   `assembleLetter()`, streams the assembled letter text back.
3. `verify/route.ts` — runs the sanitizer (`sanitizeLetter`) on the supplied
   text and returns `{ correctedText, sanitizerChanges }`. Reuses
   `src/lib/evaluation-letters/sanitize.ts` because the rules are the same.
4. `download/route.ts` — accepts `{ letterText, setup, votes }` and calls the
   docx generator. Returns the `.docx` buffer.

## Phase C — UI components

1. `EndowedLetterWorkflow.tsx` — 5-step orchestrator with shared state.
2. `StepHeader.tsx` — copy of eval-letters but with 5 steps.
3. `CandidateSetupForm.tsx` — candidate dropdown (auto-fills the rest),
   nomination-type select, position-name input, term-length input.
4. `UploadStep.tsx` — drag-drop, calls extract API, kind tags
   (dept-head-letter / cv).
5. `MRCVoteStep.tsx` — 5 vote rows with Chair/Professorship/None radios,
   anonymous-comment textareas, live tally.
6. `GenerateStep.tsx` — single Generate button (no multi-phase verify),
   streamed editable textarea.
7. `DownloadStep.tsx` — single download button, preview accordion.

## Phase D — Page + tools registry

1. `src/app/admin/endowed-positions/page.tsx` — page shell.
2. `src/lib/tools.ts` — add a card.

## Phase E — Smoke test

1. `scripts/test-endowed-stauffer-baseline.mjs` — login → upload Stauffer's
   CV + dept-head letter → submit fake 4-1 votes → generate → download →
   save artifacts.

## Phase F — Verify build, commit, push

1. `npm run build` — fix any errors.
2. `npm run brand-lint` — fix any violations.
3. Commit in logical chunks:
   - "Add endowed-positions design and implementation plans"
   - "Add endowed-positions library: candidates, MRC, boilerplate, types"
   - "Add endowed-positions docx generator with outcome and MRC tables"
   - "Add endowed-positions API routes: extract, draft, verify, download"
   - "Add endowed-positions 5-step workflow UI"
   - "Register endowed-positions admin tool card"
   - "Add stauffer smoke test for endowed-positions"
4. Push to main. Render auto-deploys.
5. Verify production responds 200/307.
