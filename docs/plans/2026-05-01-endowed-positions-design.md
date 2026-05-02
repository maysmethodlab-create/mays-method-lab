# Endowed Positions Letter Writer — Design

**Date:** 2026-05-01
**Status:** Approved scope, ready to implement.

---

## 1. Goal (Stage 2)

Build the second stage of the Mays Endowed Positions process: the memorandum
the **Associate Dean for Research and Scholarship (Rogelio Oliva)**, acting as
**Chair of the Mays Research Council (MRC)**, sends to the **Dean (Nate Sharp)**
recommending the appointment, reappointment, or fellowship of an endowed-position
candidate **after** the MRC has voted.

Stage 1 (department-head letter to Rogelio) and Stage 3 (final letter from the
Dean to the candidate) are out of scope for this build.

The deliverable is a `.docx` that mirrors the FY25 Boivie reappointment memo
exactly: same structure, same boilerplate paragraphs verbatim, same two tables,
same signature block. The only AI-generated content is:

- the **SUBJECT** line,
- the **opening sentence** (the "this memorandum includes our recommendation…"),
- the **Summary and Recommendations** sentence (the "citing X, Y, Z" reasons),
- the **Candidate's Achievement and Qualifications** paragraph (~150-250 words).

Everything else — Post-Tenure Review paragraph, Review Process paragraphs, the
secret-ballot sentence, the signature-block intro line — is **institutional
language copied verbatim from the Boivie example**.

---

## 2. Source materials

Read-only references on the user's local machine (not committed):

- `C:\…\Senior Associate Dean\RESEARCH\Endowed Positions\Process for Endowed Letters\EXAMPLE of last year letter - Boivie_Reappt Endowed-Appt-Committee-Rec-Memo_Boivie.docx`
  → the structural template. Extracted to `apps/Endowed Positions Letter Writer/Boivie-Example-2025.txt` as the AI's reference.
- `C:\…\FY27 Endowed Packets\` → the candidates whose materials we'll process.

We commit only the Boivie text (institutional, not personally sensitive) and
the candidate metadata (names + departments + nomination types). We do **not**
commit any FY27 candidate CV, dept-head letter, or other PII.

---

## 3. UI workflow (5 steps)

Mirrors the Annual Evaluation Letters app, but with one extra step (vote
collection) inserted between upload and generate.

1. **Setup** — pick the candidate from the FY27 dropdown (auto-fills department,
   default nomination type, default endowed-position name from
   `candidates.ts`); pick term length (default 5 years).
2. **Upload** — drag-drop dept-head recommendation letter (.docx/.pdf) and
   candidate's CV (.pdf). Reuses `extractText()` from the eval-letters app.
3. **MRC Votes** — one row per voting MRC member with three radio choices
   (Chair / Professorship / No endowed position) plus an optional anonymous
   comment textarea. Live tally at the bottom.
4. **Generate** — AI writes the four pieces of variable content listed above,
   then assembles the full memo by stitching them with the verbatim boilerplate.
   Streamed; editable textarea afterward.
5. **Download** — `.docx` button. Letter has the Mays/TAMU letterhead at the
   top, both required tables (outcome + MRC composition), and the signature
   block with five lines.

---

## 4. Architecture decisions

### 4.1 The four AI-generated fields

We do **not** ask the model to emit the entire letter. Instead, we ask it
for a JSON object with four short fields:

```json
{
  "subjectLine": "Recommendation to appoint Dr. Jon Stauffer …",
  "openingSentence": "This memorandum includes our recommendation for Dr. Jon Stauffer to be appointed to the Pat & Tom Powers Endowed Professorship for a five (5) year term.",
  "summaryReasonsClause": "his sustained record of high-impact publications, his leadership of the operations management research community, and his exceptional advising of doctoral students",
  "achievementParagraph": "The members of the Mays Research Council unanimously concurred …"
}
```

The server-side `assembleLetter()` function then stitches these into the full
text using the verbatim boilerplate constants. This keeps the model focused on
writing well, not on copying paragraphs we already have.

### 4.2 Tables in the .docx

Two tables, both rendered with the `docx` library's `Table`/`TableRow`/`TableCell`
primitives:

- **Outcome table** — single data row, 7 columns (Name / Dept / Current / Recommended /
  Dept Head / MRC Chair votes / MRC Professorship votes / MRC No-position votes).
- **MRC composition table** — 6 data rows (5 voting members + Rogelio as
  non-voting chair), 7 columns matching the Boivie example.

### 4.3 Boilerplate handling

`src/lib/endowed-positions/boilerplate.ts` exports four constants:
`POST_TENURE_REVIEW_PARAGRAPH`, `REVIEW_PROCESS_PARAGRAPHS`,
`MRC_INTRO_SENTENCE` (the bit between the MRC composition table and the
Achievement paragraph), `SIGNATURE_INTRO_SENTENCE`. Verbatim copies from Boivie.

### 4.4 MRC composition

Hardcoded for FY27 in `src/lib/endowed-positions/mrc.ts`. Five voting members,
plus Rogelio in the non-voting chair role:

| Name | Dept | Endowed Position |
|---|---|---|
| Anwer Ahmed | ACCT | Chair |
| Shane Johnson | FINC | Chair |
| Eli Jones | MKTG | Chair |
| Wendy Boswell | MGMT | Chair |
| Rogelio Oliva (voting) | INFO | Chair |
| Rogelio Oliva (non-voting Chair, Assoc. Dean) | Dean's Office | Chair |

(Rogelio appears twice in Boivie's table as well — once as the INFO voting
member, once as the non-voting committee chair. We mirror that.)

### 4.5 Candidates list

Hardcoded for FY27 in `src/lib/endowed-positions/candidates.ts` from the FY27
Endowed Packets folder structure. Each entry:

```ts
{
  id: 'jon-stauffer',
  name: 'Jon Stauffer',
  department: 'Information & Operations Management',
  deptCode: 'INFO',
  nominationType: 'new-professorship',
  defaultPositionName: '',  // fill in from dept head letter
  currentTitle: 'Associate Professor',
  currentEndowedPosition: 'None',
}
```

The user can override any of these in the Setup form.

---

## 5. AI prompt

The `draftPrompt()` function:

- Pastes the Boivie example as the structural reference.
- Lists the four required output fields and what each is for.
- Provides the candidate profile, the dept-head letter text, the CV text, the
  vote tally (`5-0-0`, `4-1-0`, etc.) and any anonymous comments.
- Asks for a strict JSON envelope (we parse and fail loudly if invalid).
- Specifies that the `summaryReasonsClause` must cite **2–3 specific reasons**
  drawn from the dept-head letter (not generic praise), and the
  `achievementParagraph` must cite **specific numbers** (publication counts,
  citations, top journals) when they appear in the CV.

We use the same Anthropic model and `buildCachedSystem()` pattern as the
eval-letters app: long static reference (Boivie example + candidate sources)
in a cacheable system block, the writing instruction in a non-cached block.

---

## 6. File list

| Path | Purpose |
|---|---|
| `src/app/admin/endowed-positions/page.tsx` | Page shell (mirrors eval-letters page) |
| `src/components/endowed-positions/EndowedLetterWorkflow.tsx` | 5-step orchestrator |
| `src/components/endowed-positions/StepHeader.tsx` | Step header (5 total) |
| `src/components/endowed-positions/CandidateSetupForm.tsx` | Step 1 |
| `src/components/endowed-positions/UploadStep.tsx` | Step 2 |
| `src/components/endowed-positions/MRCVoteStep.tsx` | Step 3 |
| `src/components/endowed-positions/GenerateStep.tsx` | Step 4 |
| `src/components/endowed-positions/DownloadStep.tsx` | Step 5 |
| `src/lib/endowed-positions/types.ts` | Shared types |
| `src/lib/endowed-positions/candidates.ts` | FY27 candidates list |
| `src/lib/endowed-positions/mrc.ts` | MRC composition |
| `src/lib/endowed-positions/boilerplate.ts` | Verbatim institutional text |
| `src/lib/endowed-positions/prompts.ts` | Draft prompt builder |
| `src/lib/endowed-positions/assemble.ts` | Stitch JSON fields → full memo |
| `src/lib/endowed-positions/docx-generator.ts` | Letter .docx with two tables |
| `src/app/api/endowed-positions/extract/route.ts` | Reuse `extractText()` |
| `src/app/api/endowed-positions/draft/route.ts` | Streaming Claude call |
| `src/app/api/endowed-positions/verify/route.ts` | Optional second pass (sanitizer) |
| `src/app/api/endowed-positions/download/route.ts` | Build & ship .docx |
| `apps/Endowed Positions Letter Writer/README.md` | App README |
| `apps/Endowed Positions Letter Writer/Boivie-Example-2025.txt` | Plain-text reference |
| `scripts/test-endowed-stauffer-baseline.mjs` | Smoke test |
| `docs/plans/2026-05-01-endowed-positions-implementation.md` | Implementation plan |

---

## 7. Pass criteria (recap from the spec)

1. `npm run build` passes locally before push.
2. `npm run brand-lint` passes (sharp corners, Oswald, Calibri, no shadows).
3. `/admin` shows the new card.
4. The full Stauffer workflow runs end-to-end on `localhost:3000`.
5. The downloaded `.docx` opens in Word with all required sections + tables.
6. Production at `/admin/endowed-positions` returns 200 (or 307 to /login).

---

## 8. Out of scope (deferred)

- Stage 1 (dept head writes their recommendation) — different app.
- Stage 3 (Dean writes letter to candidate) — different app, has its own template.
- Editing the MRC composition or the candidates list from the UI — for now,
  these are constants in `src/lib/endowed-positions/`.
- The Qualtrics survey integration — voting is captured in-app for now.
- Email-as-docx export (the eval-letters app has it; we don't need it here).
- Verification / hallucination agent — the boilerplate is fixed, only the
  Achievement paragraph is generative; a single pass through the local
  sanitizer (banned words, em-dashes) is sufficient.
