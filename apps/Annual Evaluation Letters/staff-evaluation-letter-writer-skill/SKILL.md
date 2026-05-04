---
name: staff-evaluation-letter-writer
description: "Write annual performance evaluation letters for STAFF (non-faculty) at Mays Business School and Texas A&M University. Use this skill whenever the user asks to write a staff performance evaluation, an annual review for a direct report who is staff (executive assistants, program coordinators, assistant directors, operations staff, communications staff), or mentions writing a letter for a staff member. The skill produces publication-ready .docx files with the official Texas A&M letterhead, in the same memorandum format Hari uses for faculty letters, but adapted for the staff context: no research or teaching sections, single-year scope, rating language aligned with TAMU Workday (\"met expectations\", \"exceeded expectations\", etc.), and a configurable signer so Hari can sign the letter himself or help another administrator (e.g., the executive director of an affiliated center) draft a letter for their own direct report. ALWAYS use this skill when writing staff evaluation letters, even for a single person."
---

# Staff Annual Evaluation Letter Writer

This skill produces annual performance evaluation letters as Word documents (.docx) for staff direct reports at Mays Business School and Texas A&M University. Each letter is a formal memorandum with the Texas A&M letterhead, written in the warm-but-substantive voice of the Kathleen Rowland template, formatted to match prior staff letters exactly.

It is the staff counterpart to the faculty `evaluation-letter-writer` skill. The two skills share writing rules, the docx layout, and the same letterhead asset; they differ in section structure, scope, and signer flexibility.

## What is different from the faculty skill

| | Faculty skill | Staff skill |
|---|---|---|
| Scope | Calendar year (Jan 1 - Dec 31) | Single review period (annual cycle, can be partial year for new hires or mid-year cycles) |
| Sections | Major Accomplishments / Observations / Plan / Summary, with research, teaching, and service emphasis | Major Accomplishments / Observations / Plan / Summary — no research, no teaching; emphasis on operational excellence, client/faculty relationships, systems, team contribution |
| Rating language | "demonstrated [excellent/very strong/strong/solid] performance" | "**met expectations** / **exceeded expectations**" (Workday-aligned), bolded |
| Workday line | Not present | "Please ensure you acknowledge the same on Workday. Thank you." |
| Signer | Hari (Senior Associate Dean) | Configurable — Hari, OR another Mays/A&M administrator who Hari is helping draft the letter (e.g., the Executive Director of CED writing for an Assistant Director) |
| Hallucination check | Three-phase pipeline | Same writing rules and ground-truth check, but the source material is typically a single self-evaluation document plus the supervisor's notes from the review meeting |

## How this skill works

The letter-writing process uses the same three sequential phases as the faculty skill. Each phase has a distinct job, and the output of one feeds the next.

**Phase 1 — Research Brief**: Read every source document the supervisor provided (the staff member's self-evaluation, the supervisor's review-meeting notes, any prior-year letter for context). Produce a structured brief that captures, in the source's own words where possible:

- Identity: name, title, center/department, review period
- Strengths the supervisor explicitly named (with the supervisor's own phrasing where possible)
- Growth areas the supervisor named, AND growth areas the staff member self-identified
- Stated professional development needs, both the staff member's list and what the supervisor added
- Any broader context (center-level challenges, team dynamics, role transitions) that explains why a particular growth area was emphasized

The brief must NEVER invent, infer, or embellish. If a claim is not in the source, it does not go in the brief.

**Phase 2 — Letter Drafting**: Translate the brief into the four-section memorandum, in the voice of the signer, following Hari's writing rules. The structure is:

1. Date line: "[Month] [Year]"
2. MEMORANDUM block: TO / FROM / SUBJECT (subject is "[Year] Performance Evaluation")
3. Opening paragraph: thanks for serving in role, references the review and the conversation
4. **Summary of Major Accomplishments** (3 paragraphs, prose, no bullets): client/faculty relationships, operational/systems work, adaptability under change
5. **My Observations and Our Discussion** (2-3 paragraphs, prose): observation on overall character/strengths, the growth-area paragraph (constructive framing), broader context paragraph if helpful
6. **Your Plan for the Upcoming Year** (intro sentence, 4-6 bullet points, closing sentence)
7. **Summary** (2-3 paragraphs, prose): personal address, optional inspirational quote, the formal evaluation rating sentence with **bolded** rating, the Workday acknowledgment line
8. Signature block

See `references/letter-structure.md` for the full template with examples.

**Phase 3 — Hallucination + Style Check**: Compare the finished letter against the source documents. Flag every factual claim (specific systems, courses, programs, dollar amounts, time periods) and verify it traces back. Also scan for:

- Em dashes (—) or en dashes (–) — must be zero
- Banned words (`leverage`, `delve`, `foster`, `holistic`, `synergy`, `transformative`, `robust`, `pivotal`, `ecosystem` etc.) — see `hari-admin-writing-style` skill for the full list
- Stiff parallelism ("Whether you're X or Y…") — should be zero
- Empty superlatives without specifics — every praise statement must reference a specific accomplishment

If anything fails, revise and re-check before delivering.

## Inputs

For each staff letter, the user provides:

1. **The staff member's self-evaluation** (PDF, DOCX, or text): their own brag sheet and self-reflection
2. **The supervisor's notes** from the review meeting (handwritten scans are common)
3. **Optional**: a prior-year letter for the same person, used as a voice/structure model
4. **Configuration**: signer name and title (default = Hari Sridhar, Senior Associate Dean), evaluation year, output filename

## Output

A .docx file named `[Full Name] [Year] Performance Evaluation [Signer Last Name] ([M] [D] [YYYY]).docx`, saved to the `Letters/` folder of this skill or to a path the user specifies. The .docx contains:

- Texas A&M letterhead at top of page 1 (from `assets/tamu_header.jpg`)
- 11pt Calibri throughout, 1" margins
- Bold section headings
- Bullet points in the "Plan for the Upcoming Year" section
- Italic for any in-line quotation
- Bold for the rating phrase (`met expectations`, `exceeded expectations`)
- Page-number footer on pages 2+
- Signature block with horizontal underscore line, "Signature" / "Date" labels

## Running the skill

The generator is a Node.js script that uses the `docx` npm package (already installed in this repo's `node_modules`). It takes a JSON input file describing the letter content and produces the .docx.

```bash
node "apps/Annual Evaluation Letters/staff-evaluation-letter-writer-skill/scripts/create_staff_letter.mjs" \
  --json /path/to/letter-input.json \
  --output /path/to/output.docx \
  --logo "apps/Annual Evaluation Letters/staff-evaluation-letter-writer-skill/assets/tamu_header.jpg"
```

The JSON shape is documented at the top of `scripts/create_staff_letter.mjs`. See `references/example-input.json` for a complete worked example (Alyssa Morgan, May 2026, signed by Venard Scott Koerwer).

## Voice rules

The letter inherits all the writing rules from the `hari-admin-writing-style` skill, including:

- No em dashes or en dashes anywhere
- No banned AI words
- "This + noun" transitions, never bare "This"
- Specific over generic — name the program, the system, the course
- Vary sentence length deliberately
- Active voice unless old-to-new flow demands otherwise
- "Confident reserve": warm but not effusive; substantive but not stiff

When the signer is someone other than Hari (e.g., a center director), the voice should still follow these rules but the personal phrasing should reflect the signer's relationship with the staff member, not Hari's. Use the signer's notes as the primary voice signal: phrases the signer wrote about the staff member can be incorporated directly into the letter (with light polishing) so it reads as genuinely theirs.

## Performance rating language

The TAMU Workday convention:

- **"exceeded expectations"** — for outstanding performance with clear above-expectation impact
- **"met expectations"** — for solid performance meeting role requirements (this is NOT a soft rating; it is the standard for a staff member doing their job well)
- **"needs improvement"** — for below-expectations performance (rare; handle with extra care)

The rating phrase is bolded in the rating sentence. The accompanying narrative in the Summary section should match the rating: do not write a letter that reads like "exceeded" if the rating is "met", or vice versa.

## When the letter is for someone other than Hari

Hari sometimes helps colleagues at Mays draft staff letters for their own direct reports — for example, the Executive Director of the Center for Executive Development asking Hari to help write a letter for an Assistant Director.

In that case:

1. Use the supervisor's notes as the source of voice and observation, not Hari's voice.
2. The FROM block names the supervisor, not Hari. The SUBJECT, structure, and writing rules stay the same.
3. The signature is the supervisor's. Adjust the underscore line / "Signature" label accordingly.
4. The letterhead is still the standard TAMU letterhead unless the center has a custom letterhead the supervisor wants to use. (CED, for example, uses the standard TAMU letterhead.)
5. Confirm with the supervisor before delivering: do they want a quote in the Summary section, and if so, who? What rating phrase do they want? Did they want any specific item in the Plan for the Upcoming Year that the staff member did not list themselves?

## Where letters go

Final letters live in `Letters/[Year]/[Full Name].docx` within this skill folder, or at a user-specified path. For staff letters Hari is signing for his own direct reports (e.g., his executive assistant), file alongside the faculty letters. For letters Hari is helping a colleague draft, deliver the .docx to the colleague directly and keep a working copy in `Letters/`.
