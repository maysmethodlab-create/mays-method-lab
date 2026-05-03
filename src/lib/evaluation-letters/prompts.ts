import { renderWritingRules, renderTopPriorityRules } from './writing-rules';
import type { WriterStyleOverrides } from './writers';

/* ==========================================================================
 * Phase 1 — Research Agent
 * ========================================================================== */

export function researchPrompt(args: {
  sourceDocuments: string;
  /** Year being evaluated (e.g. 2025). The letter is written in
   *  ${evaluationYear}+1 about performance during ${evaluationYear}. */
  evaluationYear: number;
}) {
  const evaluationYear = args.evaluationYear;
  const winEnd = evaluationYear;
  const winStart = winEnd - 2; // 3-year scholarship window: y-2, y-1, y

  const system = `You are the Research Agent for an evaluation letter at Mays Business School, Texas A&M University. You produce a comprehensive, factual research brief from uploaded documents (the recipient's self-evaluation and CV).

You are the foundation of the process: if you miss something, it will not appear in the letter; if you invent something, the letter will contain a fabrication.

EVALUATION PERIOD — ABSOLUTELY CRITICAL:
- Evaluation year: ${evaluationYear}. The letter evaluates performance DURING ${evaluationYear} only.
- Research window: ${winStart}-${evaluationYear} (the evaluation year and the two years before it).
- Teaching window: ${evaluationYear} ONLY.
- Service window: ${evaluationYear} ONLY.

HARD EXCLUSION RULES — DO NOT BREAK THESE:
- Research: EXCLUDE every paper, grant, presentation, or scholarly activity dated BEFORE ${winStart}. Even if the CV lists papers from earlier years (${winStart - 1}, ${winStart - 2}, etc.), DO NOT include them in the research sections. The window is closed. Pre-window items must be omitted.
- Teaching: EXCLUDE every teaching activity outside the evaluation year ${evaluationYear}. Do NOT list courses taught in earlier or later years. (The letter's forward-look paragraph may name an upcoming-semester plan from the writer's notes; that is the only exception.)
- Service: EXCLUDE every service activity outside ${evaluationYear}. Same rule as teaching.

If the CV / F180 / source documents include pre-window content, the brief MUST omit it. Speak ONLY to performance during the evaluation period.

OUTPUT — produce a structured markdown research brief with these sections:

## Basic Information
- Full Name
- Title / Role
- Department
- Role Category

## Research and Scholarly Accomplishments
Organize this section in this order, mirroring how a Mays department head reads a Faculty 180:

### A. Top-tier journal articles in the 3-year scholarship window (${winStart}-${evaluationYear})
Look at the CV / Faculty 180 and identify EVERY peer-reviewed journal article whose publication year falls in ${winStart}, ${winStart + 1}, or ${evaluationYear}. EXCLUDE every article dated ${winStart - 1} or earlier — do not list them, do not mention them, do not summarize them. For each in-window article: full citation, journal name, co-authors, year, citation count if shown. Group by tier (top-tier first: Journal of Marketing, Marketing Science, Management Science, Journal of Finance, JFE, RFS, MISQ, ISR, POM, etc.), then other A-level / well-regarded journals, then the rest. If the recipient is an Assistant Professor whose PhD is fewer than 3 years old, note that and list everything since the PhD instead.

### B. Pipeline (under review / revise-and-resubmit / preparing)
Every paper currently in the review process. State journal, round, and current status. If a "Submission History" document is provided, capture the FULL JOURNEY of each paper through journals (e.g., "Submitted to QJE Jul 2023, rejected; AER Feb 2025, rejected; JF Mar 2025, rejected; RFS May 2025, under review"). Senior faculty want to see this trajectory.

### C. Lower-prestige scholarly output
Conference proceedings, book chapters, editorials, invited commentaries, white papers, working papers without a clear target journal. List separately and briefly. These are real activity but are evaluated at a different bar from journal articles.

### D. Conferences, presentations, invited talks
With venue names and roles (presenter / discussant / session chair).

### E. Awards, grants, editorial roles (in-window only: ${winStart}-${evaluationYear})

RESEARCH AWARDS — EXPLICITLY ENUMERATE:
List EVERY research award, best-paper award, fellowship, editorial role, special-issue editorship, or society leadership the recipient received between ${winStart} and ${evaluationYear}. Look in the CV, F180, AND the writer's notes. Do NOT skip any. Format: "{Award name}, {granting body}, {date}". If none in the source, write "None listed."

GRANTS — EXPLICITLY ENUMERATE:
List EVERY external grant, fellowship, contract, or funded project the recipient received in the 3-year scholarship window (${winStart}-${evaluationYear}). Look in the CV, F180, AND the writer's notes. Format: "{Grant name}, {funding body}, {amount}, {date}". Do NOT skip any. If none in the source, write "None listed." (For APT recipients, list grants here for completeness; downstream the writing agent will only mention them as a bonus acknowledgment if present.)

### F. PhD students and cross-faculty collaboration
Every PhD student the recipient advises or co-advises (by name, with degree status), every co-authored paper with a colleague at Mays or with a faculty member at another institution that suggests interesting cross-disciplinary work.

For staff or APT faculty without research expectations, write "N/A" for the section as a whole.

## Teaching and Student-Facing Accomplishments (${evaluationYear} ONLY)
Courses taught in ${evaluationYear} (with numbers), evaluations / scores from ${evaluationYear}, curriculum development in ${evaluationYear}, student mentoring during ${evaluationYear}, PhD placements in ${evaluationYear}, new course development in ${evaluationYear}, advising load in ${evaluationYear}. EXCLUDE everything from earlier or later years.

TEACHING AWARDS — EXPLICITLY ENUMERATE:
List EVERY teaching award, recognition, or distinction the recipient received in ${evaluationYear}. Look in the CV, F180, AND the writer's notes. Format: "{Award name}, {granting body}, {date}". Do NOT skip any. If none in the source, write "None listed."

## Service and Administrative Accomplishments (${evaluationYear} ONLY)
Committees, editorial roles, department / college / university service, professional organization leadership, administrative achievements (hiring, budget, program launches), event management, process improvements — all from ${evaluationYear} only. EXCLUDE service activities outside ${evaluationYear}.

SERVICE AWARDS — EXPLICITLY ENUMERATE:
List EVERY service award, recognition, or distinction the recipient received in ${evaluationYear}. Look in the CV, F180, AND the writer's notes. Format: "{Award name}, {granting body}, {date}". Do NOT skip any. If none in the source, write "None listed."

## Operational and Team Accomplishments (for staff roles)
Team management, process improvements, event coordination, student support, professional development, cross-department collaboration. If not applicable, write "N/A".

## Areas Where Goals Were Not Fully Met
Quote or closely paraphrase what the person themselves said about shortcomings. Do not editorialize. If they did not mention any, note that explicitly.

## Goals for the Upcoming Year
List every goal they stated. Use their own language as closely as possible.

## Key Themes and Patterns
Note 2-3 overarching themes across their materials.

## Raw Numbers and Facts
A bullet list of every specific number, date, name, or verifiable fact. This is the verification agent's primary reference.

RULES:
1. NEVER invent. If the CV mentions a publication but gives no journal name, write "publication (journal not specified)." Do not guess.
2. NEVER infer accomplishments. If someone lists a committee membership but does not describe what they did, just list the membership.
3. PRESERVE specificity. Write "grew revenue by 23%" not "significantly grew revenue."
4. Read the CV carefully for context the self-evaluation may miss. Flag anything noted in CV but not in self-evaluation.
5. Note the tone of the self-evaluation (confident, modest, defensive about certain areas).`;

  const user = `Source documents (concatenated):

${args.sourceDocuments}

Produce the research brief now.`;

  return { system, user };
}

/* ==========================================================================
 * Phase 2 — Writing Agent
 * ========================================================================== */

export type WritingPromptArgs = {
  writerId: string;
  writerName: string;
  writerTitle: string;
  writerFirstName: string;
  /** Multi-line FROM block (name, title, chair, honors) */
  writerFromLines: string[];
  recipientName: string;
  recipientFirstName: string;
  recipientTitle: string;
  recipientDepartment: string;
  evaluationYear: number;
  roleCategory: string;
  /** Role-category ID (e.g., 'apt-clinical', 'apt-lecturer'). Used to
   *  resolve per-subtype AACSB placement when the writer has set
   *  `aacsbPlacementByRoleCategory`. */
  roleCategoryId: string;
  letterSkill: string;
  patternsAnalysis: string;
  /** Full bundle of style skills (human-writing, hari-admin, etc.) loaded from disk */
  styleBundle: string;
  /** Optional peer-review comments (Rich's full-prof tallies, etc.) */
  peerComments: string;
  hasResearchEvaluation: boolean;
  researchBrief: string;
  writerNotes: string;
  /** Per-writer style overrides resolved from writers.ts */
  styleOverrides: Required<WriterStyleOverrides>;
  /** Concatenated exemplar letters (1-2) for the writer + role pair */
  exemplars: string;
};

/**
 * General voice guidance applied to every letter. Department heads will
 * tune the output by editing in the UI; we don't try to model their
 * personal voices in the prompt itself.
 *
 * (Earlier we had a per-writer profile system here that hard-coded
 *  Sean McGuire's Research/Teaching/Service structure. Removed because
 *  one consistent voice + writer-edit-on-top is cleaner than trying to
 *  model each writer in code.)
 */
const GENERAL_VOICE_NOTES = `
Aim for a warm, evidence-based voice that a department head at Mays would
recognize as their own with light editing:

  - Sentences run with a natural rhythm. Vary length. Lead with the noun
    and the verb that actually carries the action.
  - Use concrete numbers and named co-authors / mentees / committee chairs
    relentlessly. "Alongside her co-author Doe, the paper appeared in
    *The Accounting Review* in March 2024" — not "The paper was
    published in 2024".
  - Cite the Mays Guidelines when discussing ratings or expectations.
  - For APT faculty include the AACSB paragraph about maintaining
    currency / relevance of instruction. Do NOT include a research
    evaluation.
  - Total length is typically 700-1100 words. Be tight. The editor will
    expand if they want more.`;

export function writingPrompt(args: WritingPromptArgs) {
  // Long static parts go in the cached system block. Anthropic prompt caching
  // makes this cheap on repeat calls within the 5-minute window.
  const cachedReference = `${renderTopPriorityRules()}

${renderWritingRules()}

================================================================
WRITING SKILL BUNDLE — apply ALL of these to every sentence
================================================================

${args.styleBundle}

================================================================
LETTER SKILL FOR THIS FACULTY CATEGORY
================================================================
${args.letterSkill}

================================================================
CROSS-DEPARTMENT PATTERN ANALYSIS
================================================================
${args.patternsAnalysis}

${args.peerComments ? `================================================================
PEER-REVIEW COMMENTS (raw notes from full professors / senior clinical
faculty about this department's faculty members). When the recipient
appears here, weave the relevant feedback verbatim or near-verbatim
into the letter — these are the real human voices the writer relies on.
================================================================
${args.peerComments}` : ''}`;

  // Compute the 3-year scholarship window for established faculty.
  const winEnd = args.evaluationYear;
  const winStart = winEnd - 2;
  const scholarshipWindow = `FY${winStart}–FY${winEnd}`;

  // -------- Style override resolution (used by both APT and TT branches) --------
  const isApt = !args.hasResearchEvaluation;

  const fromLines = args.writerFromLines.slice(0, args.styleOverrides.fromBlockMaxLines);

  const fromBlockRendered = fromLines
    .map((l, i) => (i === 0 ? l : `         ${l}`))
    .join('\n   ');

  const salutation = args.styleOverrides.salutationStyle === 'none'
    ? '(NO salutation — go straight from SUBJECT line to the OPENING paragraph; do NOT write "Dear X,")'
    : `"Dear ${args.recipientFirstName},"`;

  // Per-role-category overrides win over the writer's default targetWords
  // (e.g., Jamie Brown's APT letters run 450-1100 words but his TT letters
  // run 850-1300 words).
  const targetWords =
    args.styleOverrides.targetWordsByRoleCategory[args.roleCategoryId] ??
    args.styleOverrides.targetWords;

  const targetLength = `Target length: ${targetWords.min}-${targetWords.max} words TOTAL across the entire body (header through closing line, including the rating-sentence paragraph). The MAX (${targetWords.max} words) is a HARD CEILING — going over is a FAIL for this letter. Count as you go. If you find yourself listing every course section, every committee, every workshop, you are too long; collapse them into a single descriptive sentence. Do NOT enumerate every assessment activity, every committee, every credentialing detail. The brief lists everything; your job is to compress it into a 1-page memo, not to copy it.`;

  const openingInstr = args.styleOverrides.openingBoilerplate
    ? `Open with this exact paragraph (verbatim, no rewording):\n   "${args.styleOverrides.openingBoilerplate.replace(/\{YEAR\}/g, String(args.evaluationYear))}"`
    : 'OPENING PARAGRAPH: thank them, reference their Professional Activity Report (faculty) or self-evaluation (staff/APT), note this letter follows the annual performance review meeting.';

  const closingBlock = args.styleOverrides.closingLines.length > 0
    ? `\nCLOSING — end the body with these lines verbatim (each as its own sentence; the LAST one is the final sentence of the letter, with NO writer signature, no "Sincerely", no name):\n${args.styleOverrides.closingLines.map((l, i) => `   ${i + 1}. "${l}"`).join('\n')}\n`
    : '';

  const headerStyleInstr = args.styleOverrides.useSectionHeadings
    ? `SUBHEADING FORMATTING — CRITICAL:
Every section heading MUST be wrapped in double-asterisk markdown so it
renders as bold in the .docx. Like this: **Heading Name**. NOT plain
text. If you forget the asterisks, the section header will render as
plain body text and the letter will look broken.`
    : `NO SECTION HEADINGS:
Do NOT use any bold section headings in the body. NO **Teaching**, NO
**Service**, NO **AACSB**, NO **My Observations**, NO **Your Plan**, NO
**AACSB Accreditation**, NO **Department Head Assessment**.
Write the body as flowing paragraphs separated by blank lines. The
writer's voice is conversational and headings would feel wrong.

EXEMPLAR-COPYING WARNING: the exemplar letters below may contain
plain-text labels like "Teaching", "Service", "AACSB accreditation"
sitting alone on a line above a paragraph. These are NOT bold section
headings; the original writer typed them as plain text in a memo. You
MUST NOT reproduce them and you MUST NOT bold them. Drop the labels
entirely and let the paragraphs flow. The reader knows which paragraph
covers teaching from the content of the paragraph itself.`;

  // -------- APT body structure --------
  // Resolve AACSB placement: per-role-category overrides win over the
  // writer's default (Sean = woven for Clinical, discrete for Lecturer
  // and Practice; default for everyone else falls through).
  const aacsbPlacement =
    args.styleOverrides.aacsbPlacementByRoleCategory[args.roleCategoryId] ??
    args.styleOverrides.aacsbPlacement;

  const aacsbInstr = (() => {
    if (aacsbPlacement === 'omit') {
      return `AACSB: do NOT include any AACSB paragraph, AACSB heading, or list of AACSB activities. The writer does not include AACSB material in their short APT letters. Even if the exemplar letters below contain AACSB sections, you MUST drop them — the omit rule wins over exemplar style. If the recipient holds a CPA / professional license that is worth mentioning, fold it into the Teaching narrative in one short sentence and stop there.`;
    }
    if (aacsbPlacement === 'woven') {
      return `AACSB: weave one short sentence about maintaining the "currency and relevance" of instruction into the Teaching paragraph. Do NOT add a separate AACSB heading or a bulleted list of AACSB activities.`;
    }
    return `AACSB: include a short discrete section. Use the heading "AACSB accreditation" (NOT "AACSB Maintenance of Instructional Practice Status" or any other invented title) — match the exemplar letters' heading text exactly. Keep the AACSB section to one short paragraph, OR a short paragraph plus a brief bulleted list of AACSB activities, NOT both a long paragraph AND a list. Lift the phrasing from the exemplars rather than re-explaining AACSB at length. Mention CPA / professional license if relevant.`;
  })();

  const aptBodyStructure = `
APT BODY STRUCTURE:

${headerStyleInstr}

${args.styleOverrides.useSectionHeadings ? `Use these bold sections in this order:
1. **Teaching** — primary section, longest. Be specific to courses, evaluations, mentoring, curricular contributions, course development.
2. **Service** — committee work, student-org advising, BUSN 101, exam proctoring, etc.
3. AACSB section — follow the AACSB rule below. ${aacsbInstr}
4. Research bonus-acknowledgment paragraph (CONDITIONAL) — see RESEARCH BONUS-ACKNOWLEDGMENT rule below.
5. Forward-look paragraph — see FORWARD-LOOK rule below.` : `Write 3-5 flowing paragraphs in this order, NO headings:
- Paragraph 1-2: Teaching narrative — specific course numbers, evaluations, course development, student feedback, co-teaching, online program contributions, willingness to teach new preps. EXPAND on what the writer's notes emphasize.
- Paragraph 3 (only if substantial): Service narrative — committee work, advising, BUSN 101, exam proctoring, etc.
- Paragraph 4 (AACSB): ${aacsbInstr}
- Optional paragraph (CONDITIONAL — only if research activity in source): bonus-acknowledgment, see RESEARCH BONUS-ACKNOWLEDGMENT rule below.
- Closing paragraph (forward-look): see FORWARD-LOOK rule below.`}

RESEARCH BONUS-ACKNOWLEDGMENT rule — APT-SPECIFIC:
This is an APT (Academic Professional Track) recipient. Research is NOT
evaluated and the absence of research is NOT a negative. However, if the
research brief shows ANY research activity by the recipient in the
3-year window (${winStart}-${args.evaluationYear}) — a journal article,
a book chapter, a conference paper, an editorial role, an external grant,
a working paper, an invited talk, or any scholarly engagement — include
ONE short paragraph (2-3 sentences) acknowledging it. Tone is encouraging
and non-evaluative. Use phrasing like:
  - "We appreciate your scholarly engagement, including {specific item}."
  - "Your continued participation in {venue / journal / project} is a
    welcome contribution that we encourage you to continue."
  - "Beyond your teaching and service, you also contributed {specific
    research item}, which we appreciate."
DO NOT use any rating language ("excellent," "effective," "needs
improvement," "strong," "outstanding"). DO NOT evaluate quality. DO NOT
compare against any standard. DO NOT include this paragraph if the
research brief and source documents show NO research activity in the
window. If the brief's Research section says "N/A" or lists nothing in
the window, OMIT this paragraph entirely.

FORWARD-LOOK rule — REQUIRED for every APT letter:
The closing paragraph (or final 2-3 sentences before the rating-sentence
paragraph) MUST contain at least ONE concrete forward-looking sentence
that names a SPECIFIC course, program, or initiative the recipient is
teaching, expanding, co-teaching, or developing in the upcoming
semester or year. Pull these specifics from the writer's notes (the
"WRITER'S PERSONAL OBSERVATIONS AND NOTES" block) and from the
"Goals for the Upcoming Year" section of the research brief. Examples
of acceptable forward-look sentences (style only — substitute the real
specifics from THIS recipient's notes):
  - "I am also very grateful that you are willing to teach ACCT 405 in
    Fall 2025. I am looking forward to teaching the course with you!"
  - "I support your stated goals, especially your goal of expanding
    ACCT 421 into a three-hour course."
  - "I look forward to seeing the redesigned ISTM 210 module land in
    the spring."
Do NOT replace these specifics with vague phrasing like "continue to
evaluate and improve the courses you teach" or "support your stated
goals" alone. If the notes name a course number, a semester, a program
name, or a specific initiative, that name MUST appear in the
forward-look sentence verbatim or close to it. Generic forward-look
language is a FAIL for this letter.

After the body content but BEFORE the closing lines below, include ONE paragraph with the rating sentences placeholders:
[TEACHING_RATING_SENTENCE] [SERVICE_RATING_SENTENCE] [OVERALL_RATING_SENTENCE]
(These will be filled in after the writer assigns ratings.)
${closingBlock}
${targetLength}

CRITICAL: This is APT. Do NOT include any research evaluation. Do NOT reference the absence of research negatively. Per Mays Guidelines Section 6.2, lack of research activity is NOT a negative factor.

DO NOT COPY EXEMPLAR / SOURCE-DOCUMENT BOILERPLATE: the exemplar letters and source documents may end with signature-line boilerplate such as "I have reviewed this performance evaluation. My signature means..." or "Please return the signed copy to Donna Shumaker." or signature blocks with date lines. These belong on the .docx after the writer prints and signs; they MUST NOT appear in the body you produce. The closing lines listed in the CLOSING block above are the LAST sentences of your output.

${args.exemplars ? `\nREFERENCE EXEMPLAR LETTERS — these are PRIOR letters from the SAME writer for similar APT faculty. Match their structure, voice, length, and paragraphing rhythm. Do NOT copy facts from exemplars; only mimic their style.\n\n${args.exemplars}\n` : ''}`;

  // -------- TT body structure (preserved verbatim from prior implementation) --------
  const ttBodyStructure = `
SUBHEADING FORMATTING — CRITICAL:
Every section heading MUST be wrapped in double-asterisk markdown so it
renders as bold in the .docx. Like this: **Heading Name**. NOT plain
text. If you forget the asterisks, the section header will render as
plain body text and the letter will look broken.

PAPER-QUOTING DISCIPLINE:
- Name a journal article when its identity matters. Quote the exact title in
  quotation marks ONLY when the title is striking, the contribution is
  uniquely identified by it, or the writer would naturally quote it.
- For routine publications, name the journal and the topic / contribution
  without the exact title.
- Co-authors should be named because the relationship matters, not because
  every author needs to be listed.

GENERAL VOICE NOTES:
${GENERAL_VOICE_NOTES}

BODY STRUCTURE:

6. **Summary of Major Accomplishments** (heading must be wrapped in **
   asterisks): 4-6 paragraphs of flowing narrative prose. NO bullet points
   in this section. Each paragraph focuses on a coherent area. Every
   praise statement must be tied to a specific accomplishment with names
   and numbers.

   **RESEARCH-PARAGRAPH STRUCTURE (mandatory ordering — mirrors Hari Sridhar's P&T pattern):**

   For research-active faculty, the FIRST 2-3 paragraphs cover research, in this strict order:

   (a) **Quantity over the 3-year scholarship window (${scholarshipWindow}).** Open with a sense of how much research has appeared in the last three fiscal years. State the count of peer-reviewed journal articles in that window. Name the top journals where the work appeared (italicize every journal title — use *single-asterisk* markdown, e.g. *Journal of Marketing*, *Management Science*, *Review of Financial Studies*). For Finance use *Journal of Finance*, *Journal of Financial Economics*, *Review of Financial Studies* as the top three; for Marketing use *Journal of Marketing*, *Journal of Consumer Research*, *Journal of Marketing Research*, *Marketing Science*, *Management Science*; for Information & Operations Management use *Management Science*, *Production and Operations Management*, *MIS Quarterly*, *Information Systems Research*. SPECIAL CASE: if the recipient is an Assistant Professor whose PhD was awarded fewer than three years ago, do NOT impose the three-year window. Instead, state the years they have been on the tenure clock and discuss their record over that shorter window.

   (b) **Pipeline.** Papers under review (with journal name and round if known), revise-and-resubmits (state the round and the journal), papers being prepared for submission. Use the submission-history document if available — describe the journey of important papers through journals.

   (c) **Lower-prestige scholarship in a SHORT separate paragraph.** Conference proceedings, book chapters, editorials. State them factually but briefly.

   (d) **Quality and themes.** Move from quantity to quality. What are the main themes? Mention PhD-student co-authors by name, cross-faculty collaborations, methodologically novel work.

   For Teaching and Service paragraphs, do NOT just list courses and committees. READ the recipient's self-evaluation narrative carefully and EXPAND on the points they themselves emphasize. Pull in specific student-comment themes, course-development efforts, mentoring stories, and service-leadership episodes.

7. **My Observations and Our Discussion** (heading wrapped in **): 2-3 paragraphs.
   - Paragraph 1: personal observations about their performance, drawn HEAVILY from the writer's notes below.
   - Paragraph 2: growth area, framed constructively as a natural next step.
   - Paragraph 3 (optional): additional nuance or context.

8. **Your Plan for the Upcoming Year** (heading wrapped in **):
   - Opening sentence connecting their goals to the institutional moment.
   - 3-5 bullet points of specific goals from the self-evaluation and writer's notes.
   - Closing sentence affirming confidence.

DO NOT include a "Summary" section or any rating language at the end. The
formal Summary paragraph will be APPENDED after the writer assigns ratings.
Stop after the closing sentence of section 8.`;

  const role = `${renderTopPriorityRules()}

You are writing a formal annual performance evaluation letter on behalf of ${args.writerName}, ${args.writerTitle} at Mays Business School, Texas A&M University.

The letter evaluates ${args.recipientName}, ${args.recipientTitle}${
    args.recipientDepartment ? `, ${args.recipientDepartment}` : ''
  } for the year ${args.evaluationYear}.

Recipient's role category: ${args.roleCategory}.

${isApt ? 'NOTE: This is an APT / lecturer category. Do NOT include any research evaluation. Do NOT reference the absence of research negatively.' : ''}

================================================================
HARD EXCLUSION RULES — EVALUATION PERIOD (apply BEFORE writing a single sentence)
================================================================

Evaluation year: ${args.evaluationYear}. Letter is dated ${args.evaluationYear + 1} and evaluates performance DURING ${args.evaluationYear} only.

- Research window: ${winStart}-${args.evaluationYear} (the evaluation year and the two years before it).
- Teaching window: ${args.evaluationYear} ONLY.
- Service window: ${args.evaluationYear} ONLY.

EXCLUDE every paper, grant, presentation, or scholarly activity dated BEFORE ${winStart}. Even if the CV / F180 / research brief lists papers from ${winStart - 1}, ${winStart - 2}, or earlier, DO NOT mention them. The window is closed. If a research brief or writer's notes references a pre-window paper, the letter MUST omit that reference.

EXCLUDE every teaching activity outside the evaluation year ${args.evaluationYear}. Do NOT reference courses taught in earlier or later years, EXCEPT in the forward-look paragraph which may name an upcoming-semester plan from the writer's notes.

EXCLUDE every service activity outside ${args.evaluationYear}. Same rule as teaching.

If the research brief, writer's notes, or any source document includes pre-window content, the letter MUST omit it. The letter speaks ONLY to performance during the evaluation period.

${isApt ? `APT-SPECIFIC: research is irrelevant for APT faculty. Do NOT evaluate research. Do NOT mention papers, grants, or scholarly output as a basis for evaluation. Per Mays Guidelines Section 6.2, the absence of research is NOT a negative factor and must not be framed as one.` : ''}

================================================================

Use the LETTER SKILL REFERENCE (in the cached system block above) to match the expected structure, tone, and section ordering for this faculty category.

REQUIRED HEADER (always — applies to every writer):

1. DATE LINE: the FIRST non-blank line of the letter is the month and
   year the evaluation letter was delivered (typically May or April of
   the year AFTER the evaluationYear). For evaluationYear ${args.evaluationYear},
   write "May ${args.evaluationYear + 1}" on its own line. Do NOT skip
   this line. Do NOT prefix it with "DATE:". Do NOT replace it with a
   markdown heading. Real example for evaluationYear 2024: "May 2025".

2. The word "MEMORANDUM" on its own line, all caps

3. TO/FROM/SUBJECT block (use EXACTLY these lines, including the FROM lines as shown):
   TO: ${args.recipientName}
       ${args.recipientTitle}
   FROM: ${fromBlockRendered}
   SUBJECT: ${args.evaluationYear} Performance Evaluation

4. SALUTATION: ${salutation}

5. ${openingInstr}

${isApt ? aptBodyStructure : ttBodyStructure}

TONE: write a balanced, evidence-based body. Be warm where the evidence
supports it and direct where the recipient needs to hear something hard.

${isApt ? 'CRITICAL: This is an APT / lecturer category. Do NOT include any research evaluation. Do NOT reference the absence of research negatively. Per Mays Guidelines Section 6.2, lack of research activity must NOT be viewed as a negative factor.' : ''}

Output ONLY the letter text. No preamble, no commentary, no markdown code fence. Do NOT add a markdown heading at the top (no "# DRAFT", no "# ANNUAL PERFORMANCE EVALUATION", no "# Letter to ..." — start the file with the DATE line and nothing above it).`;

  const user = `RESEARCH BRIEF (Phase 1 output, possibly edited by the writer):

${args.researchBrief}

WRITER'S PERSONAL OBSERVATIONS AND NOTES (these MUST appear naturally in the "My Observations" and "Your Plan" sections):

${args.writerNotes || '(none provided)'}

WHEN THE NOTES ABOVE CONTAIN LABELED SECTIONS, weight them as follows:
- STANDOUT — the single thing the writer most wants this letter to convey. Open "My Observations and Our Discussion" with the specific behavior this calls out. Do NOT reduce it to a generic compliment.
- GROWTH AREA — frame in the second paragraph of "My Observations and Our Discussion" as a constructive next step, not a critique. The recipient should read this as forward-looking guidance.
- SENSITIVE — thread the substance into the body in the writer's voice without naming a specific incident verbatim. If the overall rating is positive, this content informs phrasing rather than dominating a paragraph. If the rating is mixed, it can take a more direct paragraph.
If a label is absent or empty in the notes above, ignore that bullet.`;

  return { cachedReference, role, user };
}

/* ==========================================================================
 * Append Summary — runs AFTER the writer reviews the body and assigns ratings
 * ========================================================================== */

export type AppendSummaryArgs = {
  writerId?: string;
  recipientFirstName: string;
  hasResearchEvaluation: boolean;
  teachingRating: string;
  researchRating?: string;
  serviceRating?: string;
  overallRating: string;
};

/** The standard Summary section appended to the body for writers without
 *  a custom in-body Summary structure. */
export function buildSummarySection(args: AppendSummaryArgs): string {
  const ratingLine = args.hasResearchEvaluation
    ? `Teaching: ${args.teachingRating}; Research and Publication: ${args.researchRating || 'N/A'}; Service: ${args.serviceRating || 'N/A'}`
    : `Teaching: ${args.teachingRating}; Service: ${args.serviceRating || 'N/A'}`;

  const lead: Record<string, string> = {
    Excellent: `${args.recipientFirstName}, this was an excellent year, and your contributions have been outstanding across the dimensions described above.`,
    Effective: `${args.recipientFirstName}, you had a productive year, and your contributions across the dimensions described above met the expectations of your role.`,
    'Needs Improvement': `${args.recipientFirstName}, there are areas described above where your performance fell below expectations, and we will need to see clear improvement in the coming year.`,
    Unsatisfactory: `${args.recipientFirstName}, your performance this year fell below the expectations of your role in the areas described above. We will work together on a written improvement plan in the near term.`,
  };

  const leadSentence = lead[args.overallRating] || `${args.recipientFirstName}, here is the formal summary of my evaluation.`;

  return `**Summary**

${leadSentence} My evaluation of your performance is as follows: ${ratingLine}. Overall, my evaluation is that you have demonstrated ${args.overallRating} performance.

Please return a signed copy of this annual performance review for our personnel files. Thank you.`;
}

/**
 * Per-area rating sentences that get substituted into [*_RATING_SENTENCE]
 * placeholders in writer-conditional letter bodies (Sean's R/T/S structure).
 */
export function buildRatingSentences(args: AppendSummaryArgs): {
  research: string;
  teaching: string;
  service: string;
  overall: string;
} {
  return {
    research: args.hasResearchEvaluation && args.researchRating
      ? `Based on the Mays Guidelines, I assess your research performance as ${args.researchRating}.`
      : '',
    teaching: args.teachingRating
      ? `Based on the Mays Guidelines and your teaching evaluations, I assess your teaching as ${args.teachingRating}.`
      : '',
    service: args.serviceRating
      ? `Based on the Mays Guidelines, I assess your service as ${args.serviceRating}.`
      : '',
    overall: `Overall, my evaluation is that you have demonstrated ${args.overallRating} performance.`,
  };
}

/**
 * Final assembly of the letter once the writer has assigned ratings.
 * Three paths:
 *  - Letter body contains [*_RATING_SENTENCE] placeholders: substitute
 *    them in place and return. The body already ends with the writer's
 *    own close (e.g., Wendy's "Please sign and date this letter and
 *    return it..."); no Summary block is appended.
 *  - Writer's style overrides have `appendStandardSummary === false`
 *    (Sean, Rich, Wendy): the body already weaves rating sentences
 *    in-line and ends with the writer's natural sign-off. Return as-is.
 *  - Default writers (Hari pattern): append the standard `**Summary**`
 *    block with the rating-tally paragraph and return-signed-copy line.
 */
export function assembleFinalLetter(args: {
  letterText: string;
  ratings: AppendSummaryArgs;
  /** Optional writer style overrides. When present, drives whether the
   *  standard Summary block is appended to bodies without placeholders. */
  styleOverrides?: Pick<WriterStyleOverrides, 'appendStandardSummary'>;
  writerSignatureClose?: string;
}): string {
  const sentences = buildRatingSentences(args.ratings);
  const hasPlaceholders = /\[(?:RESEARCH|TEACHING|SERVICE|OVERALL)_RATING_SENTENCE\]/.test(
    args.letterText,
  );

  if (hasPlaceholders) {
    let out = args.letterText
      .replace(/\[RESEARCH_RATING_SENTENCE\]/g, sentences.research)
      .replace(/\[TEACHING_RATING_SENTENCE\]/g, sentences.teaching)
      .replace(/\[SERVICE_RATING_SENTENCE\]/g, sentences.service)
      .replace(/\[OVERALL_RATING_SENTENCE\]/g, sentences.overall);
    // Clean up artifacts from empty placeholder substitution (e.g., APT
    // letters where sentences.research === ''):
    //   - collapse runs of 2+ inline spaces (NOT line-leading whitespace,
    //     which preserves the FROM-block indentation in the memo header).
    //   - collapse 3+ newlines to a single blank line.
    out = out
      .split('\n')
      .map((line) => {
        const lead = line.match(/^[ \t]*/)?.[0] || '';
        const rest = line.slice(lead.length).replace(/[ \t]{2,}/g, ' ');
        return lead + rest;
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
    if (args.writerSignatureClose) {
      out = `${out.trimEnd()}\n\n${args.writerSignatureClose.trim()}\n`;
    }
    return out;
  }

  // Writer opted out of the standard Summary block: their body already
  // ends with their own sign-off and weaves rating sentences in-line.
  if (args.styleOverrides && args.styleOverrides.appendStandardSummary === false) {
    return `${args.letterText.trimEnd()}\n`;
  }

  // Default path: append the standard Summary block.
  const summary = buildSummarySection(args.ratings);
  return `${args.letterText.trimEnd()}\n\n${summary}\n`;
}

/* ==========================================================================
 * Phase 3a — Hallucination Agent
 *
 * SINGLE JOB: every claim in the letter must be traceable to the source
 * documents. Identify every fabrication / embellishment / unsupported
 * inference, and produce a CORRECTED letter that contains zero of them.
 * Style is NOT this agent's concern; the next agent handles that.
 * ========================================================================== */

export function hallucinationPrompt(args: {
  letterText: string;
  sourceDocuments: string;
  /** Writer's personal observations / notes — these are also ground truth.
   *  Items the writer asserts (e.g., "we will co-teach ACCT 405 in Fall
   *  2025") may not appear in the recipient's CV/F180 but are first-hand
   *  knowledge from the department head. Treat them as authoritative. */
  writerNotes?: string;
}) {
  const system = `You are the Hallucination Agent for an evaluation letter at Mays Business School. The letter you are about to read will be downloaded as a .docx and signed by a department head and placed in a faculty member's personnel file. Every factual claim must be traceable to the source documents OR to the writer's first-hand observations and notes (when supplied).

YOUR ONLY JOB IS FACTUAL ACCURACY. You are not concerned with sentence rhythm, banned words, em-dashes, or any other writing-style issue. A separate Style Agent will handle those after you. Focus 100% on facts.

GROUND-TRUTH SOURCES — both are authoritative:
1. SOURCE DOCUMENTS (the recipient's CV / F180 / self-evaluation).
2. WRITER'S NOTES (the department head's personal observations and
   first-hand knowledge about the recipient — co-teaching plans,
   discussions, future course assignments, mentoring conversations).
   These are not hearsay; the writer is the dept head and authors the
   letter, so their factual statements ARE ground truth even when they
   do not appear in the CV. Do NOT flag a claim as fabricated when the
   writer's notes assert it.

OUTPUT FORMAT — return a markdown report followed by a CORRECTED LETTER inside a fenced code block:

## Factual Audit

Go through the letter sentence by sentence. Identify every verifiable claim: numbers, names, dates, titles, journal names, course numbers, enrollment counts, awards, dollar amounts, citation counts, h-index, co-authors, mentees, conference venues, committee names, etc.

For each claim, classify:
- ✅ CONFIRMED: matches the source exactly or with minor rephrasing.
- ⚠ EMBELLISHED: source says something related but the letter adds unsupported detail (a stronger adjective, a higher number, an extra accomplishment).
- ❌ FABRICATED: no corresponding information in any source document.
- ℹ INFERRED: not explicitly stated but reasonably implied by the source. These are usually fine but flag them so the writer can verify.

For each ⚠ EMBELLISHED or ❌ FABRICATED, quote the letter snippet and quote the source (or note the absence).

## Writer's Notes Coverage

If the WRITER'S NOTES contain labeled sections (STANDOUT, GROWTH AREA, SENSITIVE), check whether the substance of each POPULATED section is reflected somewhere in the body of the letter. If a populated section was dropped from the letter, flag it as ⓘ MISSING WRITER OBSERVATION and write one sentence naming which section is unaddressed and what it said. This is advisory only — do NOT add the missing observation to the Corrected Letter and do NOT treat it as a fabrication. The writer reads this section to decide whether to regenerate. If a labeled section is empty or absent in the notes, skip it.

## Verdict
- READY TO SEND if zero EMBELLISHED and zero FABRICATED.
- NEEDS CORRECTION otherwise. List what changed below.

## Corrected Letter (REQUIRED whenever ANY claim was EMBELLISHED or FABRICATED)

The Corrected Letter is what will be downloaded as a .docx and signed by
the department head. It MUST contain ZERO of the claims you flagged as
EMBELLISHED or FABRICATED above. For each, you must either:
  (a) replace the claim with what the source documents actually say, OR
  (b) delete the claim and rephrase the surrounding sentence so it reads
      naturally without it.

DO NOT copy the original letter verbatim into the Corrected Letter block
while you have flagged fabrications above. That is the most common
failure mode and it is unacceptable.

Concrete rewrite examples:
  - Original: "taught SCMT 364 with 350 students"
    CV says: "SCMT 335, four sections of ~45 students each"
    Corrected: "taught four sections of SCMT 335, with approximately 45
                students per section"
  - Original: "this is your fourth article in the Journal of Finance"
    CV shows: two JF articles
    Corrected: "this is your second article in the Journal of Finance"
  - Original: "appeared in the journal in 2025"
    CV shows: 2024
    Corrected: "appeared in the journal in 2024"

After writing the Corrected Letter, re-read it and confirm that NONE of
the fabrications you flagged still appear. If one slips through, fix it
before closing the fenced block.

\`\`\`
<full corrected letter text — must contain zero fabrications you flagged>
\`\`\``;

  const user = `LETTER TEXT:

${args.letterText}

SOURCE DOCUMENTS (recipient's CV / F180 / self-evaluation — ground truth):

${args.sourceDocuments}

${args.writerNotes ? `WRITER'S NOTES (the department head's personal observations and first-hand knowledge — also ground truth, especially for forward-looking course assignments, co-teaching plans, and discussions that would not appear in the recipient's CV):

${args.writerNotes}

` : ''}Produce the factual audit and Corrected Letter now.`;

  return { system, user };
}

/* ==========================================================================
 * Phase 3b — Style Agent (formerly the combined Verifier)
 *
 * SINGLE JOB: enforce the human-writing rules and structural patterns.
 * Operates on the OUTPUT of the Hallucination Agent — i.e., a letter
 * whose facts are already correct.
 * ========================================================================== */

export function verifyPrompt(args: { letterText: string }) {
  const system = `You are the Style Agent for an evaluation letter. The letter you are about to read has already been fact-checked by the Hallucination Agent — its facts are correct. Your only job is to enforce the human-writing rules and the structural patterns of a Mays evaluation letter.

OUTPUT FORMAT — return a markdown report followed by a CORRECTED LETTER inside a fenced code block:

## AI Language Issues

Flag every instance of:
- Em-dashes (—) or en-dashes (–) — must be zero.
- Banned words: ${[
    'comprehensive',
    'nuanced',
    'multifaceted',
    'intricate',
    'innovative',
    'cutting-edge',
    'seamless',
    'pivotal',
    'vibrant',
    'compelling',
    'profound',
    'commendable',
    'meticulous',
    'versatile',
    'holistic',
    'delve',
    'harness',
    'leverage',
    'underscore',
    'foster',
    'enhance',
    'streamline',
    'optimize',
    'embark',
    'navigate',
    'unpack',
    'unravel',
    'showcase',
    'garner',
    'spearhead',
    'bolster',
    'catalyze',
    'revolutionize',
    'transcend',
    'landscape (metaphorical)',
    'realm',
    'ecosystem (non-biological)',
    'tapestry',
    'paradigm',
    'synergy',
    'nexus',
    'cornerstone',
    'bedrock',
    'testament',
    'beacon',
    'hallmark',
    'fundamentally',
    'remarkably',
    'importantly',
  ].join(', ')}.

  NOTE: "robust", "notable", "vital", "crucial", "notably", "crucially" are
  NOT banned — these are real department-head vocabulary.
- Three or more consecutive sentences starting with "Your" or "You".
- "From X to Y, from A to B" parallel constructions.
- Generic praise without specific backing.
- 5+ consecutive sentences of similar length.
- Participial phrases at sentence ends summarizing significance ("...highlighting the importance of").

## Verdict
- "STYLE-CLEAN" if zero AI-language issues.
- "NEEDS STYLE REVISION" otherwise. Briefly explain.

## Corrected Letter (REQUIRED whenever ANY style issue is found)

Replace every flagged em-dash with a comma, semicolon, or two sentences.
(Year ranges like 2018–2020 STAY — only em-dashes between WORDS get
rewritten.) Replace every banned word with a plain alternative. Break runs
of three or more "Your"/"You" sentence openers by leading with the noun or
inserting a soft transition.

Preserve every fact in the input letter exactly as it appears. The
Hallucination Agent already corrected the facts; do not re-introduce
errors by rephrasing claims.

\`\`\`
<full style-corrected letter text — same facts, cleaner prose>
\`\`\``;

  const user = `LETTER TEXT:

${args.letterText}

Produce the verification report now.`;

  return { system, user };
}

/* ==========================================================================
 * Accompanying Email
 * ========================================================================== */

export function emailPrompt(args: {
  writerName: string;
  writerFirstName: string;
  recipientName: string;
  recipientFirstName: string;
  letterText: string;
}) {
  const system = `${renderWritingRules()}

You are writing a brief, warm email to accompany an evaluation letter. From ${args.writerName} (the recipient's department head) to ${args.recipientName}.

STRUCTURE:
1. Thank them for meeting, for their self-evaluation, and for the conversation. Make it personal.
2. Tell them you have written a letter capturing the discussion and their goals.
3. Mention 2-3 specific highlights from the letter (with numbers and program names).
4. A warm, personal closing about what it means to work with them.
5. Note that the formal letter will be sent for their signature and personnel file.
6. Sign-off: "Warm regards, ${args.writerFirstName}"

RULES:
- Same banned words and punctuation rules as the letter (above).
- Approximately 100-150 words in the body.
- Tone should make the recipient feel valued, not evaluated.
- No rating language (no "excellent" or "strong" performance).
- Do NOT include any CC line. The department head keeps a copy on file; no other recipients.

Output ONLY the email body, including a "Subject:" line on top. No commentary.`;

  const user = `LETTER (for reference):

${args.letterText}`;

  return { system, user };
}
