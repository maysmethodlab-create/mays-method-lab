// Re-run Arreola-Risa locally (calls Claude API directly, no Next.js
// server) after Rich Metters' feedback that the bot was citing 2022 papers,
// missing 2025 teaching awards, and dating the letter "2027" with "2026
// performance".
//
// Goal: confirm the new hard-exclusion rules in researchPrompt and
// writingPrompt produce a letter with:
//   - no pre-2023 papers in the research section
//   - 2025 teaching awards present
//   - "May 2026" letter date
//   - SUBJECT: 2025 Performance Evaluation
//
// Runs against the LOCAL prompts (the same ones deployed to Render) without
// requiring the Next.js server. Loads .env.local for ANTHROPIC_API_KEY.
//
// Run with:
//   node scripts/test-arreola-risa-rich-feedback.mjs
//
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import pdfParse from 'pdf-parse';
import { templateFile } from './_template-files.mjs';

// -- Load .env.local manually (Node does not auto-load it) --
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'apps', 'Annual Evaluation Letters');
const OUT = path.join(APP_DIR, 'test-output', 'arreola-risa-rich-feedback');

function loadDotEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    let val = m[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}
loadDotEnv();

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not set. Aborting.');
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

const CHEAP_MODEL = 'claude-haiku-4-5-20251001';
const SONNET_MODEL = 'claude-sonnet-4-5';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const C = {
  files: ['Antonio Arreola-Risa CV, February 2025.pdf', 'arreola-Risa f-180.pdf'],
  ratings: {
    teachingRating: 'Excellent',
    researchRating: 'Effective',
    serviceRating: 'Excellent',
    overallRating: 'Excellent',
  },
  notes:
    "Outstanding teaching and service this year (2025). Continued strong publication record. Mentorship of doctoral students has been particularly notable.",
};

// -- Extract text from PDFs --
async function extractAll(filenames) {
  const out = [];
  for (const fn of filenames) {
    const buf = fs.readFileSync(templateFile(fn));
    const result = await pdfParse(buf);
    let text = result.text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    out.push({ filename: fn, text, size: buf.length });
  }
  return out;
}

// -- Prompts (mirror src/lib/evaluation-letters/prompts.ts) --
function researchPrompt({ sourceDocuments, evaluationYear }) {
  const winEnd = evaluationYear;
  const winStart = winEnd - 2;
  const system = `You are the Research Agent for an evaluation letter at Mays Business School, Texas A&M University. You produce a comprehensive, factual research brief from uploaded documents (the recipient's self-evaluation and CV).

You are the foundation of the process: if you miss something, it will not appear in the letter; if you invent something, the letter will contain a fabrication.

EVALUATION PERIOD - ABSOLUTELY CRITICAL:
- Evaluation year: ${evaluationYear}. The letter evaluates performance DURING ${evaluationYear} only.
- Research window: ${winStart}-${evaluationYear} (the evaluation year and the two years before it).
- Teaching window: ${evaluationYear} ONLY.
- Service window: ${evaluationYear} ONLY.

HARD EXCLUSION RULES - DO NOT BREAK THESE:
- Research: EXCLUDE every paper, grant, presentation, or scholarly activity dated BEFORE ${winStart}. Even if the CV lists papers from earlier years (${winStart - 1}, ${winStart - 2}, etc.), DO NOT include them in the research sections. The window is closed. Pre-window items must be omitted.
- Teaching: EXCLUDE every teaching activity outside the evaluation year ${evaluationYear}. Do NOT list courses taught in earlier or later years. (The letter's forward-look paragraph may name an upcoming-semester plan from the writer's notes; that is the only exception.)
- Service: EXCLUDE every service activity outside ${evaluationYear}. Same rule as teaching.

If the CV / F180 / source documents include pre-window content, the brief MUST omit it. Speak ONLY to performance during the evaluation period.

OUTPUT - produce a structured markdown research brief with these sections:

## Basic Information
- Full Name
- Title / Role
- Department
- Role Category

## Research and Scholarly Accomplishments

### A. Top-tier journal articles in the 3-year scholarship window (${winStart}-${evaluationYear})
Look at the CV / Faculty 180 and identify EVERY peer-reviewed journal article whose publication year falls in ${winStart}, ${winStart + 1}, or ${evaluationYear}. EXCLUDE every article dated ${winStart - 1} or earlier. For each in-window article: full citation, journal name, co-authors, year. Group by tier.

### B. Pipeline (under review / R&R / preparing)
Every paper currently in the review process. State journal, round, and current status.

### C. Lower-prestige scholarly output
Conference proceedings, book chapters, editorials.

### D. Conferences, presentations, invited talks
With venue names and roles.

### E. Awards, grants, editorial roles (in-window only: ${winStart}-${evaluationYear})

RESEARCH AWARDS AND GRANTS - EXPLICITLY ENUMERATE:
List every research award, best-paper award, external grant, fellowship, editorial role, special-issue editorship, or society leadership the recipient received between ${winStart} and ${evaluationYear}. Format: "{Award name}, {granting body}, {date}". If none, write "None listed."

### F. PhD students and cross-faculty collaboration
Every PhD student the recipient advises, every co-authored paper.

For staff or APT faculty without research expectations, write "N/A".

## Teaching and Student-Facing Accomplishments (${evaluationYear} ONLY)
Courses taught in ${evaluationYear} (with numbers), evaluations / scores from ${evaluationYear}, curriculum development in ${evaluationYear}, student mentoring during ${evaluationYear}, PhD placements in ${evaluationYear}, new course development in ${evaluationYear}, advising load in ${evaluationYear}. EXCLUDE everything from earlier or later years.

TEACHING AWARDS - EXPLICITLY ENUMERATE:
List every teaching award, recognition, or distinction the recipient received in ${evaluationYear}. Look in the CV, F180, and writer's notes. Format: "{Award name}, {granting body}, {date}". Do NOT skip them. If none, write "None listed."

## Service and Administrative Accomplishments (${evaluationYear} ONLY)
Committees, editorial roles, department / college / university service - all from ${evaluationYear} only. EXCLUDE service activities outside ${evaluationYear}.

SERVICE AWARDS - EXPLICITLY ENUMERATE:
List every service award the recipient received in ${evaluationYear}. Format: "{Award name}, {granting body}, {date}". If none, write "None listed."

## Areas Where Goals Were Not Fully Met
Quote what the person said about shortcomings.

## Goals for the Upcoming Year
List every stated goal.

## Key Themes and Patterns
2-3 themes.

## Raw Numbers and Facts
Bullet list of every specific number, date, name.

RULES:
1. NEVER invent. 2. NEVER infer. 3. PRESERVE specificity. 4. Read the CV carefully.`;
  const user = `Source documents:\n\n${sourceDocuments}\n\nProduce the research brief now.`;
  return { system, user };
}

function draftPrompt({
  recipientName,
  recipientFirstName,
  recipientTitle,
  recipientDepartment,
  evaluationYear,
  researchBrief,
  writerNotes,
  hasResearchEvaluation,
}) {
  const winEnd = evaluationYear;
  const winStart = winEnd - 2;
  const isApt = !hasResearchEvaluation;

  // Writer block: Rich Metters as I&O Department Head.
  const writerName = 'Richard Metters';
  const writerTitle = 'Department Head, Information and Operations Management';
  const fromBlockRendered = `${writerName}\n         ${writerTitle}\n         Mays Business School, Texas A&M University`;

  const system = `You are writing a formal annual performance evaluation letter on behalf of ${writerName}, ${writerTitle} at Mays Business School, Texas A&M University.

The letter evaluates ${recipientName}, ${recipientTitle}${recipientDepartment ? `, ${recipientDepartment}` : ''} for the year ${evaluationYear}.

================================================================
HARD EXCLUSION RULES - EVALUATION PERIOD (apply BEFORE writing a single sentence)
================================================================

Evaluation year: ${evaluationYear}. Letter is dated ${evaluationYear + 1} and evaluates performance DURING ${evaluationYear} only.

- Research window: ${winStart}-${evaluationYear} (the evaluation year and the two years before it).
- Teaching window: ${evaluationYear} ONLY.
- Service window: ${evaluationYear} ONLY.

EXCLUDE every paper, grant, presentation, or scholarly activity dated BEFORE ${winStart}. Even if the CV / F180 / research brief lists papers from ${winStart - 1}, ${winStart - 2}, or earlier, DO NOT mention them. The window is closed. If a research brief or writer's notes references a pre-window paper, the letter MUST omit that reference.

EXCLUDE every teaching activity outside the evaluation year ${evaluationYear}. Do NOT reference courses taught in earlier or later years, EXCEPT in the forward-look paragraph which may name an upcoming-semester plan from the writer's notes.

EXCLUDE every service activity outside ${evaluationYear}. Same rule as teaching.

If the research brief, writer's notes, or any source document includes pre-window content, the letter MUST omit it. The letter speaks ONLY to performance during the evaluation period.

================================================================

REQUIRED HEADER:

1. DATE LINE: the FIRST non-blank line is "May ${evaluationYear + 1}" on its own line.
2. The word "MEMORANDUM" on its own line, all caps.
3. TO/FROM/SUBJECT block:
   TO: ${recipientName}
       ${recipientTitle}
   FROM: ${fromBlockRendered}
   SUBJECT: ${evaluationYear} Performance Evaluation

4. SALUTATION: "Dear ${recipientFirstName},"

5. OPENING PARAGRAPH: thank them, reference their Professional Activity Report covering ${evaluationYear}, note this letter follows the annual performance review meeting.

BODY STRUCTURE:

6. **Summary of Major Accomplishments** (heading wrapped in **): 4-6 paragraphs of flowing narrative prose.

   ${isApt ? `APT body: focus on Teaching and Service. Do NOT evaluate research.` : `For research-active faculty, the FIRST 2-3 paragraphs cover research:

   (a) Quantity over the 3-year scholarship window (FY${winStart}-FY${evaluationYear}). State the count of peer-reviewed journal articles published in this window. Italicize journal titles with single asterisks (e.g. *Management Science*).
   (b) Pipeline: papers under review, R&Rs, papers being prepared.
   (c) Lower-prestige scholarship in a SHORT separate paragraph.
   (d) Quality and themes.`}

   For Teaching and Service: read the recipient's narrative carefully and EXPAND on what they emphasize. Pull in specific student-comment themes, course-development efforts, mentoring stories.

7. **My Observations and Our Discussion** (heading wrapped in **): 2-3 paragraphs drawn from writer's notes.

8. **Your Plan for the Upcoming Year** (heading wrapped in **): 3-5 bullets of specific goals.

DO NOT include a "Summary" section or rating language at the end. The Summary will be appended after ratings are assigned.

Output ONLY the letter text. No preamble. Start with the DATE line.

WRITING STYLE:
- No em-dashes. No banned AI words (delve, leverage, foster, robust as adjective for "increase", etc.).
- Concrete numbers and named people.
- Warm but evidence-based.`;

  const user = `RESEARCH BRIEF:\n\n${researchBrief}\n\nWRITER'S PERSONAL OBSERVATIONS AND NOTES:\n\n${writerNotes || '(none provided)'}`;
  return { system, user };
}

function buildSummarySection({ recipientFirstName, hasResearchEvaluation, teachingRating, researchRating, serviceRating, overallRating }) {
  const ratingLine = hasResearchEvaluation
    ? `Teaching: ${teachingRating}; Research and Publication: ${researchRating || 'N/A'}; Service: ${serviceRating || 'N/A'}`
    : `Teaching: ${teachingRating}; Service: ${serviceRating || 'N/A'}`;
  const lead = {
    Excellent: `${recipientFirstName}, this was an excellent year, and your contributions have been outstanding across the dimensions described above.`,
    Effective: `${recipientFirstName}, you had a productive year, and your contributions across the dimensions described above met the expectations of your role.`,
  };
  const leadSentence = lead[overallRating] || `${recipientFirstName}, here is the formal summary of my evaluation.`;
  return `**Summary**\n\n${leadSentence} My evaluation of your performance is as follows: ${ratingLine}. Overall, my evaluation is that you have demonstrated ${overallRating} performance.\n\nPlease return a signed copy of this annual performance review for our personnel files. Thank you.`;
}

async function callClaude({ model, system, user, max_tokens = 4000 }) {
  const res = await client.messages.create({
    model,
    max_tokens,
    system,
    messages: [{ role: 'user', content: user }],
  });
  return res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
}

(async () => {
  console.log('Extracting PDFs locally...');
  const files = await extractAll(C.files);
  fs.writeFileSync(path.join(OUT, '01-extracted.json'), JSON.stringify({ files }, null, 2));
  const sourceDocuments = files.map((f) => `===== ${f.filename} =====\n${f.text}`).join('\n\n');
  fs.writeFileSync(path.join(OUT, '01-source.txt'), sourceDocuments);

  const evaluationYear = 2025;
  const recipientName = 'Antonio Arreola-Risa';
  const recipientFirstName = 'Antonio';
  const recipientTitle = 'Associate Professor';
  const recipientDepartment = 'Department of Information and Operations Management';
  const roleCategoryId = 'tt-associate-professor';
  const hasResearchEvaluation = true;

  fs.writeFileSync(
    path.join(OUT, '02-setup.json'),
    JSON.stringify({
      writerId: 'metters',
      evaluationYear,
      recipientName,
      recipientTitle,
      recipientDepartment,
      roleCategoryId,
      ...C.ratings,
    }, null, 2),
  );

  console.log(`Research (Haiku, evaluationYear=${evaluationYear})...`);
  const rp = researchPrompt({ sourceDocuments, evaluationYear });
  const brief = await callClaude({
    model: CHEAP_MODEL,
    system: rp.system,
    user: rp.user,
    max_tokens: 4000,
  });
  fs.writeFileSync(path.join(OUT, '03-research-brief.md'), brief);

  console.log('Drafting (Sonnet)...');
  const dp = draftPrompt({
    recipientName,
    recipientFirstName,
    recipientTitle,
    recipientDepartment,
    evaluationYear,
    researchBrief: brief,
    writerNotes: C.notes,
    hasResearchEvaluation,
  });
  const letter = await callClaude({
    model: SONNET_MODEL,
    system: dp.system,
    user: dp.user,
    max_tokens: 4000,
  });
  fs.writeFileSync(path.join(OUT, '04-letter.md'), letter);

  // Append summary block locally (mirrors append-summary route).
  console.log('Appending Summary section...');
  const summary = buildSummarySection({
    recipientFirstName,
    hasResearchEvaluation,
    teachingRating: C.ratings.teachingRating,
    researchRating: C.ratings.researchRating,
    serviceRating: C.ratings.serviceRating,
    overallRating: C.ratings.overallRating,
  });
  const finalText = `${letter.trimEnd()}\n\n${summary}\n`;
  fs.writeFileSync(path.join(OUT, '06-final.md'), finalText);

  console.log('\nDone. Output in ' + OUT);
  console.log('\n--- HEADER PREVIEW ---');
  console.log(finalText.split('\n').slice(0, 12).join('\n'));
})().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
