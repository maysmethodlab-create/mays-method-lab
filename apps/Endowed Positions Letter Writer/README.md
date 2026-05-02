# Endowed Positions Letter Writer

Stage 2 of the Mays endowed-positions process: the Associate Dean for
Research and Scholarship (Rogelio Oliva, Chair of the Mays Research Council)
writes a memorandum to the Dean (Nate Sharp) recommending the appointment,
reappointment, or fellowship for an endowed-position candidate, after the
MRC has voted.

## Routes

- App: `/admin/endowed-positions`
- API: `/api/endowed-positions/{extract,draft,verify,download}`

## Stage scope

| Stage | Letter | Status |
|---|---|---|
| 1 | Department head writes recommendation to Rogelio | Out of scope |
| **2** | **Rogelio writes recommendation to Dean Nate Sharp** | **In scope** |
| 3 | Dean writes appointment letter to candidate | Out of scope |

## Workflow (5 steps)

1. **Setup** — pick the candidate from the FY27 dropdown; pick nomination
   type, endowed-position name, term length.
2. **Upload** — drop the dept-head's recommendation letter (.docx/.pdf) and
   the candidate's CV (.pdf).
3. **MRC Votes** — record each MRC member's vote (Chair / Professorship /
   No endowed position) plus optional anonymous comment. Live tally.
4. **Generate** — AI writes the four variable-content fields (subject line,
   opening sentence, summary-reasons clause, achievement paragraph), the
   server stitches them with the verbatim Boivie boilerplate.
5. **Download** — `.docx` with Mays/TAMU letterhead, both required tables,
   five-line signature block.

## What's institutional vs. AI-generated

The Boivie letter (`Boivie-Example-2025.txt`) defines the structural template.
**Boilerplate paragraphs are copied verbatim** by the assembler:

- "Post-Tenure Review" paragraph
- "Review Process" paragraphs (the three about three-year terms, eligibility,
  etc.)
- The MRC composition table prose framing
- The secret-ballot / Qualtrics paragraph
- The signature-block intro line

**AI generates only**:

- The SUBJECT line
- The opening sentence ("This memorandum includes our recommendation…")
- The "Summary and Recommendations" sentence (with 2–3 reasons drawn from the
  dept-head letter)
- The "Candidate's Achievement and Qualifications" paragraph (~150–250 words,
  citing specific publication counts, journals, and citation totals from the
  CV when available)

## FY27 candidates

Hardcoded in `src/lib/endowed-positions/candidates.ts`:

- **New endowed:** Jon Stauffer, Matt Call, Priyanka Dwivedi, Yifan Song
- **Renewals — Chairs:** Eli Jones, Len Berry, Rajan Varadarajan, Shane Johnson
- **Renewals — Professorships:** Amalesh Sharma, Annie McGowan, Arvind Mahajan,
  Casey Kyllonen, Chris Yust, Huiwen Lian, Russ Peterson, Senyo Tse, Wei Wu,
  Xen Koufteros
- **Fellowship nominations:** Andrew Fieldhouse, Davide Tomio, Jiayi Bao,
  Jing Huang, Lorena Keller, Rajiv Mukherjee

## Local-only references

The `Source Materials/` and `test-output/` subfolders are gitignored.
Candidate CVs and dept-head letters live there during local testing but
are never committed.
