# APT Letter Style Guide

*Updated 2026-05-02 afternoon. Voice fingerprint for every APT subtype across four calibrated writers, validated against production.*

## How to read this

This guide codifies what each writer's APT letters actually look like once
they leave the platform: header shape, opening boilerplate, body structure,
AACSB handling, closing lines, and target word count. Anyone tuning a new
writer's `styleOverrides` in `src/lib/evaluation-letters/writers.ts` should
match the closest pattern below.

The four calibrated writers are Sean McGuire (Accounting), Rich Metters
(Information & Operations Management), Wendy Boswell (Management), and
Jamie Brown (Finance). One writer (Keith Wilcox / Marketing) still falls
back to the default Hari pattern until at least two real letters arrive.

## Length policy (May 2026)

Faculty appreciate slightly longer letters than the historical samples;
the AI does not over-index on exact historical lengths. Each writer's
`targetWords` was widened from the raw historical band:

- Sean (mcguire): 550-1000 words (was 550-800)
- Rich (metters): 350-900 words (was 450-700; floor down so genuinely
  thin briefs still pass criterion 1, ceiling up for substantive cases)
- Wendy (boswell): 350-750 words (was 350-550)
- Jamie (brown): 850-1300 words TT default; 450-1100 for APT subtypes
  via `targetWordsByRoleCategory` (Jamie's APT letters were co-drafted
  with Nicky Amos last cycle and run shorter than his pure-Jamie TT)

## Validation matrix (May 2026)

Twelve cases run end-to-end against production. Each scored against the
9-point rubric: word count in writer's range, no bold headings or trailing
**Summary** block, FROM-block matches `fromBlockMaxLines`, no "Dear ...",
correct opening boilerplate, AACSB placement matches subtype rule, correct
closing lines, concrete forward-look (specific course / program /
semester), and no hallucinated facts.

| Case | Writer | Subtype | Words | Score | Notes |
| --- | --- | --- | ---: | --- | --- |
| Hurta | Sean | Lecturer | 721 | 9/9 | NOTES pin ACCT 405 Fall 2025 + ACCT 421 expansion |
| Curtsinger | Rich | Senior Lecturer | 559 | 9/9 | First-pass clean |
| Panina | Wendy | Clinical Professor | 536 | 9/9 | First-pass clean |
| Larkin | Sean | Senior Lecturer | 616 | 9/9 | First-pass clean |
| Becker | Rich | Clinical Professor | 653 | 9/9 | NOTES pin ISTM 281/481 + Spring 2026 |
| Allen | Sean | Principal Lecturer | 711 | 9/9 | First-pass clean on widened range |
| Ranzilla | Sean | Executive Professor | 564 | 9/9 | writer-notes pass-through to hallucination agent |
| Berberian | Rich | Lecturer | 430 | 9/9 | Lifted from 8/9 by widening Rich's range floor down to 350 |
| Phinney | Rich | Principal Lecturer | 587 | 9/9 | First-pass clean |
| McFarland | Wendy | Clinical Associate | 486 | 9/9 | First-pass clean |
| Cetina | Jamie | APT-Practice | 1007 | 9/9 | First-pass clean — inside Jamie's APT 450-1100 range |
| **Cziraki** | **Jamie** | **TT-Assistant** | **2107** | **8/9** | **Length over Jamie's TT 1300 max. Jamie's TT structure has 6 sections; the prompt's general "HARD CEILING" doesn't get respected on multi-section letters. Smallest fix: per-section word budget for Jamie TT (~250 opening + 200 each major section + 50 closing = ~1250 budget). Held off pending Hari's call.** |

**11 of 12 at 9/9; Cziraki at 8/9 (length).**

## Cross-cutting rules

These hold across every APT subtype and writer.

- **No research evaluation.** Per Mays Guidelines Section 6.2, lack of
  research activity is not a negative factor for APT faculty. The letter
  must not mention research as a gap, even by implication.
- **No leading markdown heading.** The letter starts with the DATE line.
  The sanitize step strips any `#` heading the model puts at the top.
- **No bold section headings in any APT subtype.** All three calibrated
  writers run flowing paragraphs, not labelled sections. Headings would
  feel wrong in a one-page memo.
- **`appendStandardSummary: false` for Sean, Rich, and Wendy.** Each writer
  closes with their own sign-off. The default `**Summary**` block would
  duplicate the close.
- **Forward-look rule.** Every APT letter ends with at least one concrete
  sentence that names a course number, semester, program, or initiative
  the recipient is teaching, expanding, co-teaching, or developing in the
  upcoming year. Generic phrasing like "continue to evaluate and improve
  your courses" is a fail.
- **Hallucination guard.** Writer notes must specify exact course numbers,
  named committees, and semester labels. The hallucination agent treats
  notes as ground truth alongside the CV/F180.
- **AACSB placement is per-subtype.** Sean weaves AACSB into Clinical
  letters and runs a discrete paragraph for Lecturer and Practice. Rich
  and Wendy omit AACSB entirely.
- **TO block and salutation.** All three writers go straight from
  SUBJECT to body. No "Dear ...,".
- **Trailing reviewer-signature box.** Stripped at exemplar load time
  (`stripTrailingBoilerplate` in `apt-exemplars.ts`).

## Lecturer

Validated cases:
- Amy Hurta (Sean / Lecturer / `apt-lecturer`)
- Rose Berberian (Rich / Lecturer / `apt-lecturer`)

See the validation matrix at the top of this guide for current scores.

### Sean's pattern (Accounting)

- FROM block: 2 lines. `Sean McGuire, Ph.D.` + `Professor and Department Head`.
- Salutation: none.
- Opening boilerplate: verbatim `"Thank you for submitting your annual
  Professional Activity and Accomplishment Report this spring..."` (with
  `{YEAR}` substituted).
- Body: 3-5 flowing paragraphs in this order: teaching narrative
  (longest), service, AACSB (discrete paragraph), closing with
  forward-look.
- AACSB: discrete paragraph using the heading `AACSB accreditation`
  (lower-case "accreditation" matches Sean's letters).
- Closing lines (verbatim):
  1. `"Please let me know if you have any questions about my assessment.
     To that end, please contact Diana Kruse to schedule a time to meet
     with me if you would like to discuss my assessment."`
  2. `"Thank you for everything that you do for our students and
     department!"`
- Target words: 550-800.
- Voice sample (real, from Hurta 2024): "I am incredibly grateful for your
  dedication to teaching and student success. Your communications course
  (ACCT 421) is vital to our students' professional development, and I am
  delighted by your very positive teaching evaluations and the outstanding
  student comments."

### Rich's pattern (Information & Operations)

- FROM block: 3 lines. `Rich Metters, Ph.D.` + `Department Head, Department
  of Information and Operations Management` + `Paul W. and Rosalie Robertson
  Chair in Business`.
- Salutation: none.
- Opening boilerplate: verbatim `"Both Texas A&M University and Mays
  Business School require..."` (long version with the four review
  purposes folded into one paragraph).
- Body: 3-5 flowing paragraphs. Teaching first (with raw enrollment
  numbers and evaluation scores), then service, then a forward-look
  paragraph.
- AACSB: omitted. CPA / professional licenses fold into one teaching
  sentence if relevant.
- Closing line: `"If you wish to discuss your review, schedule a time."`
- Target words: 450-700.

## Senior Lecturer

Validated cases:
- Wanda Curtsinger (Rich / Senior Lecturer / `apt-lecturer`)
- Natalie Allen (Sean / Senior Lecturer / `apt-lecturer`)
- Ryan Larkin scored as Sean's Senior-Lecturer test case is also here in
  the inventory but maps to `apt-lecturer` role.

### Sean's pattern

Same as Lecturer above. Sean treats Senior Lecturer as an extension of the
Lecturer mold; the only differences are that the recipient typically has
more service to summarize and may carry a coordinator role (faculty
adviser for a course help desk, organization adviser, etc.).

### Rich's pattern

Same as Lecturer above. Rich's Senior-Lecturer letters tend to lead with a
summary of student credit hours, then move to evaluation scores, then
service. Wanda Curtsinger's is the canonical Senior-Lecturer voice for
Rich (scoring 9/9 on production).

## Principal Lecturer

Validated cases:
- Ryan Larkin (Sean)
- Theresa Phinney (Rich)
- Natalie Allen also fits this rung.

### Sean's pattern

Identical to Lecturer / Senior Lecturer. Principal Lecturers tend to
carry program coordination, online-program participation, and committee
service that the body absorbs into longer paragraphs but the structure
stays the same.

### Rich's pattern

Identical to Lecturer / Senior Lecturer. Phinney's role-category in the
test script is `apt-lecturer` because the platform's role-category list
groups Lecturer / Senior Lecturer / Principal Lecturer under one ID.

## Clinical Professor

Validated cases:
- Daria Panina (Wendy / Clinical Professor / `apt-clinical`)
- Aaron Becker (Rich / Clinical Professor / `apt-clinical`)
- Brent Garza is Sean's Clinical exemplar and was used to seed the
  woven-AACSB rule, though Garza himself is not in the validation matrix.

### Sean's pattern (Clinical)

- FROM block: 2 lines (same as Lecturer).
- Opening boilerplate: same verbatim opening.
- AACSB: woven, not discrete. One short sentence inside the teaching
  paragraph mentioning currency-and-relevance of instruction. No AACSB
  heading.
- Closing lines: same Diana Kruse + thank-you sign-off as Lecturer.
- Target words: 550-800.

### Rich's pattern (Clinical)

- FROM block: 3 lines.
- Opening boilerplate: same long opening as his Lecturer letters.
- AACSB: omitted.
- Closing line: `"If you wish to discuss your review, schedule a time."`
- Target words: 450-700.

### Wendy's pattern (Clinical Professor)

- FROM block: 2 lines. `Wendy R. Boswell, Ph.D.` + `Interim Head,
  Department of Management`.
- Opening boilerplate: verbatim with bulleted lists for the three review
  purposes and the four performance levels (longer than Sean's or Rich's).
- Body: 3-5 short flowing paragraphs. Teaching, then scholarly endeavours
  (when applicable, factual only), then service, then a forward-look line.
- AACSB: omitted.
- Closing lines (verbatim):
  1. `"If you would like to meet and discuss this letter, please contact
     me at your convenience so we can schedule a meeting."`
  2. `"Please sign and date this letter and return it to me. A signed
     copy of this letter will be placed in your official personnel file."`
- Target words: 350-550.
- Voice sample (real, from McFarland 2025): "You teach several different
  course preps for the department and college, including MGMT 422, MGMT
  466, and MGMT 679. Your student feedback and AEFIS ratings indicate
  excellent teaching."

## Clinical Associate

Validated case:
- Ken McFarland (Wendy / Clinical Associate Professor / `apt-clinical`)

Wendy's only Clinical Associate exemplar today. Pattern is the same as her
Clinical Professor letter above. The platform stores both under
`apt-clinical`; the recipient title field carries "Clinical Associate
Professor" through to the TO block.

## Professor of Practice

Validated case:
- Sam Ranzilla (Sean / Executive Professor / `apt-practice`)

The role-category list pairs `apt-practice` with the Executive-Professor
and Professor-of-Practice letter skill, so Sean's Ranzilla letter sits in
the same exemplar pool as Michael Harding (Executive Professor) for prompt
retrieval. Pattern matches Sean's Lecturer/Senior-Lecturer mold:

- FROM block: 2 lines.
- Opening boilerplate: same verbatim opening as Sean's Lecturer.
- AACSB: discrete paragraph.
- Closing lines: Diana Kruse + thank-you sign-off.
- Target words: 550-800.

## Executive Professor

Validated case:
- Sam Ranzilla (Sean / Executive Professor / `apt-practice`). Same
  pattern as Professor of Practice above.

Michael Harding is Sean's reference Executive-Professor exemplar in the
APT_EXEMPLARS pool but is not in the validation matrix today.

## Where the rules live

| Concern | File |
| --- | --- |
| Per-writer style overrides | `src/lib/evaluation-letters/writers.ts` |
| AACSB-placement rules | `src/lib/evaluation-letters/writers.ts` (`aacsbPlacement`, `aacsbPlacementByRoleCategory`) |
| Forward-look rule, leading-heading ban, DATE-line rule, exemplar guidance | `src/lib/evaluation-letters/prompts.ts` |
| Exemplar pool per writer + role | `src/lib/evaluation-letters/apt-exemplars.ts` |
| Trailing reviewer-signature stripper | `src/lib/evaluation-letters/apt-exemplars.ts` (`stripTrailingBoilerplate`) |
| Leading-heading stripper, mid-paragraph banned-opener stripper | `src/lib/evaluation-letters/sanitize.ts` |
| Standard Summary append toggle | `src/lib/evaluation-letters/prompts.ts` (`assembleFinalLetter`) |
| Writer-notes pass-through to hallucination agent | `src/app/api/evaluation-letters/verify/route.ts` |

## Writing notes that pass the hallucination agent

The hallucination agent treats `writerNotes` as ground truth alongside
the CV/F180. Forward-look claims about future course assignments,
co-teaching plans, or program contributions only survive verify if the
notes assert them explicitly. Pattern that works:

```
Forward-look (specifics that MUST appear in the closing): {recipient}
will continue {role} in {semester/year}, {specific initiative} in
{course/program}, and {named committee work}. Name {course numbers},
{semester labels}, and {program names} in the forward-look paragraph.
```

If the notes do not name the specifics, the model writes generic
"continue your good work" prose because that is the only safe way to
satisfy both the FORWARD-LOOK rule and the no-fabrication rule.
