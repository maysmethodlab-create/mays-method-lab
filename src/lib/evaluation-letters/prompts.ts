import { renderWritingRules, renderTopPriorityRules } from './writing-rules';

/* ==========================================================================
 * Phase 1 — Research Agent
 * ========================================================================== */

export function researchPrompt(args: { sourceDocuments: string }) {
  const system = `You are the Research Agent for an evaluation letter at Mays Business School, Texas A&M University. You produce a comprehensive, factual research brief from uploaded documents (the recipient's self-evaluation and CV).

You are the foundation of the process: if you miss something, it will not appear in the letter; if you invent something, the letter will contain a fabrication.

OUTPUT — produce a structured markdown research brief with these sections:

## Basic Information
- Full Name
- Title / Role
- Department
- Role Category

## Research and Scholarly Accomplishments
Organize this section in this order, mirroring how a Mays department head reads a Faculty 180:

### A. Top-tier journal articles in the 3-year scholarship window
Look at the CV / Faculty 180 and identify EVERY peer-reviewed journal article whose publication year falls in the most recent THREE fiscal years (the evaluation year and the two before it). For each: full citation, journal name, co-authors, year, citation count if shown. Group by tier — top-tier first (Journal of Marketing, Marketing Science, Management Science, Journal of Finance, JFE, RFS, MISQ, ISR, POM, etc.), then other A-level / well-regarded journals, then the rest. If the recipient is an Assistant Professor whose PhD is fewer than 3 years old, note that and list everything since the PhD instead.

### B. Pipeline (under review / revise-and-resubmit / preparing)
Every paper currently in the review process. State journal, round, and current status. If a "Submission History" document is provided, capture the FULL JOURNEY of each paper through journals (e.g., "Submitted to QJE Jul 2023, rejected; AER Feb 2025, rejected; JF Mar 2025, rejected; RFS May 2025, under review"). Senior faculty want to see this trajectory.

### C. Lower-prestige scholarly output
Conference proceedings, book chapters, editorials, invited commentaries, white papers, working papers without a clear target journal. List separately and briefly. These are real activity but are evaluated at a different bar from journal articles.

### D. Conferences, presentations, invited talks
With venue names and roles (presenter / discussant / session chair).

### E. Awards, grants, editorial roles
External grants (with amount and sponsor), best-paper awards, editorial board memberships, special-issue editor roles, society / conference leadership.

### F. PhD students and cross-faculty collaboration
Every PhD student the recipient advises or co-advises (by name, with degree status), every co-authored paper with a colleague at Mays or with a faculty member at another institution that suggests interesting cross-disciplinary work.

For staff or APT faculty without research expectations, write "N/A" for the section as a whole.

## Teaching and Student-Facing Accomplishments
Courses taught (with numbers), evaluations / scores, curriculum development, student mentoring, PhD placements, teaching awards, new course development, advising load.

## Service and Administrative Accomplishments
Committees, editorial roles, department / college / university service, professional organization leadership, administrative achievements (hiring, budget, program launches), event management, process improvements.

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
  letterSkill: string;
  patternsAnalysis: string;
  /** Full bundle of style skills (human-writing, hari-admin, etc.) loaded from disk */
  styleBundle: string;
  /** Optional peer-review comments (Rich's full-prof tallies, etc.) */
  peerComments: string;
  hasResearchEvaluation: boolean;
  researchBrief: string;
  writerNotes: string;
};

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

  const role = `${renderTopPriorityRules()}

You are writing a formal annual performance evaluation letter on behalf of ${args.writerName}, ${args.writerTitle} at Mays Business School, Texas A&M University.

The letter evaluates ${args.recipientName}, ${args.recipientTitle}${
    args.recipientDepartment ? `, ${args.recipientDepartment}` : ''
  } for the year ${args.evaluationYear}.

Recipient's role category: ${args.roleCategory}.

${args.hasResearchEvaluation ? '' : 'NOTE: This is an APT / lecturer category. Do NOT include any research evaluation. Do NOT reference the absence of research negatively.'}

Use the LETTER SKILL REFERENCE (in the cached system block above) to match the expected structure, tone, and section ordering for this faculty category.

REQUIRED STRUCTURE:

1. DATE LINE: current month and year, e.g., "May 2026"

2. The word "MEMORANDUM" on its own line, all caps

3. TO/FROM/SUBJECT block:
   TO: ${args.recipientName}
       ${args.recipientTitle}
   FROM: ${args.writerFromLines.map((l, i) => (i === 0 ? l : `         ${l}`)).join('\n   ')}
   SUBJECT: ${args.evaluationYear} Performance Evaluation

4. SALUTATION: "Dear ${args.recipientFirstName},"

5. OPENING PARAGRAPH: thank them, reference their Professional Activity Report (faculty) or self-evaluation (staff/APT), note this letter follows the annual performance review meeting.

SUBHEADING FORMATTING — CRITICAL:
Every section heading below (Summary of Major Accomplishments, My Observations
and Our Discussion, Your Plan for the Upcoming Year) MUST be wrapped in
double-asterisk markdown so it renders as bold in the .docx. Like this:

    **Summary of Major Accomplishments**

NOT like this:

    Summary of Major Accomplishments

If you forget the asterisks, the section header will render as plain body
text and the letter will look broken.

PAPER-QUOTING DISCIPLINE:
- Name a journal article when its identity matters. Quote the exact title in
  quotation marks ONLY when the title is striking, the contribution is
  uniquely identified by it, or the writer would naturally quote it (e.g.,
  for a P&T-style "anchor paper" treatment).
- For routine publications, name the journal and the topic / contribution
  without the exact title. "Your paper with Bo Li in *Production and
  Operations Management* on conditional value-at-risk" is better than
  "Your paper, 'Minimizing Conditional Value-at-Risk under a Modified
  Base-Stock Policy,' in *Production and Operations Management*".
- Co-authors should be named because the relationship matters, not because
  every author needs to be listed.

6. **Summary of Major Accomplishments** (this is the heading — output it
   exactly as **Summary of Major Accomplishments** wrapped in double
   asterisks): 4-6 paragraphs of flowing narrative prose. NO bullet points
   in this section. Each paragraph focuses on a coherent area. Weave
   specific accomplishments into a story about why they matter. Every
   praise statement must be tied to a specific accomplishment with names
   and numbers.

   ${args.hasResearchEvaluation ? `**RESEARCH-PARAGRAPH STRUCTURE (mandatory ordering — mirrors Hari Sridhar's P&T pattern):**

   For research-active faculty, the FIRST 2-3 paragraphs cover research, in this strict order:

   (a) **Quantity over the 3-year scholarship window (${scholarshipWindow}).** Open with a sense of how much research has appeared in the last three fiscal years. State the count of peer-reviewed journal articles in that window. Name the top journals where the work appeared (italicize every journal title — use *single-asterisk* markdown, e.g. *Journal of Marketing*, *Management Science*, *Review of Financial Studies*). For Finance use *Journal of Finance*, *Journal of Financial Economics*, *Review of Financial Studies* as the top three; for Marketing use *Journal of Marketing*, *Journal of Consumer Research*, *Journal of Marketing Research*, *Marketing Science*, *Management Science*; for Information & Operations Management use *Management Science*, *Production and Operations Management*, *MIS Quarterly*, *Information Systems Research*. SPECIAL CASE: if the recipient is an Assistant Professor whose PhD was awarded fewer than three years ago, do NOT impose the three-year window. Instead, state the years they have been on the tenure clock and discuss their record over that shorter window.

   (b) **Pipeline.** Papers under review (with journal name and round if known), revise-and-resubmits (state the round and the journal), papers being prepared for submission. Use the submission-history document if available — describe the journey of important papers through journals (e.g., "submitted to QJE in July 2023, rejected; resubmitted to AER in February 2025"). This is critical for senior faculty.

   (c) **Lower-prestige scholarship in a SHORT separate paragraph (or combined with pipeline if brief).** Conference proceedings, book chapters, editorials, working papers without target journals — these are real activity but are not counted at the same level as top-journal articles. State them factually but briefly. Use language like "Beyond the journal record, …" or "In addition to the peer-reviewed publications, …".

   (d) **Quality and themes.** Now move from quantity to quality. What are the main themes? Is the work substantively interesting? Does it tackle novel questions? Use Hari's framing: "What about the quality of the work?" or "The themes that emerge across these papers …". Mention PhD-student co-authors by name (great mentoring signal), cross-faculty collaborations, methodologically novel work.` : ''}

   For Teaching and Service paragraphs (after the research paragraphs above for research faculty, or as the primary content for APT faculty), do NOT just list courses and committees. READ the recipient's self-evaluation narrative carefully and EXPAND on the points they themselves emphasize. Pull in specific student-comment themes, course-development efforts, mentoring stories, and service-leadership episodes. Quote or paraphrase the recipient's own framing of their year where it adds color. The goal is a letter the recipient reads and thinks "they actually read what I wrote."

7. **My Observations and Our Discussion** (output the heading wrapped in
   double asterisks as shown): 2-3 paragraphs.
   - Paragraph 1: personal observations about their performance, drawn HEAVILY from the writer's notes below.
   - Paragraph 2: growth area, framed constructively as a natural next step.
   - Paragraph 3 (optional): additional nuance or context.

8. **Your Plan for the Upcoming Year** (output the heading wrapped in
   double asterisks as shown):
   - Opening sentence connecting their goals to the institutional moment.
   - 3-5 bullet points of specific goals from the self-evaluation and writer's notes.
   - Closing sentence affirming confidence.

DO NOT include a "Summary" section or any rating language at the end. The
formal Summary paragraph (with the per-area ratings and the signature
block) will be APPENDED separately after the writer reviews this body and
assigns ratings. Stop after the closing sentence of section 8.

TONE: write a balanced, evidence-based body. Be warm where the evidence
supports it and direct where the recipient needs to hear something hard.
Do NOT presuppose any particular rating outcome — let the facts and
observations stand on their own. The growth-area paragraph should be
framed constructively as a natural next step.

${args.hasResearchEvaluation ? '' : 'CRITICAL: This is an APT / lecturer category. Do NOT include any research evaluation. Do NOT reference the absence of research negatively. Per Mays Guidelines Section 6.2, lack of research activity must NOT be viewed as a negative factor.'}

Output ONLY the letter text. No preamble, no commentary, no markdown code fence.`;

  const user = `RESEARCH BRIEF (Phase 1 output, possibly edited by the writer):

${args.researchBrief}

WRITER'S PERSONAL OBSERVATIONS AND NOTES (these MUST appear naturally in the "My Observations" and "Your Plan" sections):

${args.writerNotes || '(none provided)'}`;

  return { cachedReference, role, user };
}

/* ==========================================================================
 * Append Summary — runs AFTER the writer reviews the body and assigns ratings
 * ========================================================================== */

export type AppendSummaryArgs = {
  recipientFirstName: string;
  hasResearchEvaluation: boolean;
  teachingRating: string;
  researchRating?: string;
  serviceRating?: string;
  overallRating: string;
};

/**
 * Build the formal Summary section that gets appended to the letter body
 * once the writer has assigned ratings. This is deterministic — no LLM call
 * required — because the language is canonical per Mays Guidelines.
 */
export function buildSummarySection(args: AppendSummaryArgs): string {
  const ratingLine = args.hasResearchEvaluation
    ? `Teaching: ${args.teachingRating}; Research and Publication: ${args.researchRating || 'N/A'}; Service: ${args.serviceRating || 'N/A'}`
    : `Teaching: ${args.teachingRating}; Service: ${args.serviceRating || 'N/A'}`;

  // Lead sentence varies by overall rating — short and authentic.
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

/* ==========================================================================
 * Phase 3a — Hallucination Agent
 *
 * SINGLE JOB: every claim in the letter must be traceable to the source
 * documents. Identify every fabrication / embellishment / unsupported
 * inference, and produce a CORRECTED letter that contains zero of them.
 * Style is NOT this agent's concern; the next agent handles that.
 * ========================================================================== */

export function hallucinationPrompt(args: { letterText: string; sourceDocuments: string }) {
  const system = `You are the Hallucination Agent for an evaluation letter at Mays Business School. The letter you are about to read will be downloaded as a .docx and signed by a department head and placed in a faculty member's personnel file. Every factual claim must be traceable to the source documents.

YOUR ONLY JOB IS FACTUAL ACCURACY. You are not concerned with sentence rhythm, banned words, em-dashes, or any other writing-style issue. A separate Style Agent will handle those after you. Focus 100% on facts.

OUTPUT FORMAT — return a markdown report followed by a CORRECTED LETTER inside a fenced code block:

## Factual Audit

Go through the letter sentence by sentence. Identify every verifiable claim: numbers, names, dates, titles, journal names, course numbers, enrollment counts, awards, dollar amounts, citation counts, h-index, co-authors, mentees, conference venues, committee names, etc.

For each claim, classify:
- ✅ CONFIRMED: matches the source exactly or with minor rephrasing.
- ⚠ EMBELLISHED: source says something related but the letter adds unsupported detail (a stronger adjective, a higher number, an extra accomplishment).
- ❌ FABRICATED: no corresponding information in any source document.
- ℹ INFERRED: not explicitly stated but reasonably implied by the source. These are usually fine but flag them so the writer can verify.

For each ⚠ EMBELLISHED or ❌ FABRICATED, quote the letter snippet and quote the source (or note the absence).

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

SOURCE DOCUMENTS (the only ground truth — every claim must be traceable here):

${args.sourceDocuments}

Produce the factual audit and Corrected Letter now.`;

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
    'robust',
    'comprehensive',
    'nuanced',
    'multifaceted',
    'intricate',
    'innovative',
    'cutting-edge',
    'seamless',
    'pivotal',
    'crucial',
    'vital',
    'vibrant',
    'compelling',
    'profound',
    'notable',
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
    'notably',
    'importantly',
    'crucially',
  ].join(', ')}.
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
