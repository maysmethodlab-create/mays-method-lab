# Prompt 2: Build the Evaluation Letter Writer App

## What This Prompt Does

This prompt builds the **Evaluation Letter Writer**, the first app inside the Mays Method Lab platform. The platform shell (website, nav, auth, design system) was built by Prompt 1. This prompt adds the app that lives at `/admin/evaluation-letters/`.

The Evaluation Letter Writer helps department heads and academic leaders at Mays Business School produce high-quality, human-sounding annual evaluation letters for their direct reports. It uses a three-phase AI pipeline: Research, Draft, Verify.

**Prerequisites**: The platform shell from Prompt 1 must be built and running before you start this prompt. The shell provides the layout, auth middleware, design system, and the Admin Tools container page.

---

## App Location in the Codebase

This app lives at:
```
src/app/admin/evaluation-letters/
```

All app-specific components go in:
```
src/components/evaluation-letters/
```

All app-specific lib files go in:
```
src/lib/evaluation-letters/
```

This keeps the app self-contained so future apps (e.g., Staff Evaluation Writer, Course Assignment Planner) follow the same pattern in their own subfolders.

---

## Reference Materials

This app folder contains critical reference materials that inform how letters are written. Claude Code should read these before generating any letter content:

- **`letter-skills/`**: Per-category skill files that document the exact structure, tone, and language patterns for each faculty type. These were derived from 14+ actual department head letters.
  - `assistant-professor-tenure-track.md`
  - `associate-professor.md`
  - `full-professor.md`
  - `lecturer-and-senior-lecturer.md`
  - `executive-professor-and-professor-of-practice.md`
  - `LETTER-PATTERNS-ANALYSIS.md` (master cross-department analysis)

- **`writing-style-skills/`**: Writing style guides including human-writing rules and evaluation letter conventions.

- **`Template Letters/`**: The actual department head letters these skills were derived from. Use for validation and tone-matching.

---

## The Four-Step Workflow

The user interface presents a clean four-step workflow. Each step builds on the previous one.

### Step 1: Setup

The writer identifies themselves and the person being evaluated.

**Writer identification** via a dropdown of hardcoded department heads and leaders. When they select their name, title and department auto-fill:

```javascript
const WRITERS = [
  { name: "Keith Wilcox, Ph.D.", title: "Department Head, Department of Marketing", department: "Department of Marketing" },
  { name: "Rich Metters, Ph.D.", title: "Department Head, Department of Information and Operations Management", department: "Department of Information and Operations Management" },
  { name: "Sean McGuire, Ph.D.", title: "Department Head, James Benjamin Department of Accounting", department: "James Benjamin Department of Accounting" },
  { name: "James (Jamie) Brown, Ph.D.", title: "Department Head, Adam C. Sinn '00 Department of Finance", department: "Adam C. Sinn '00 Department of Finance" },
  { name: "Srikanth Paruchuri, Ph.D.", title: "Department Head, Department of Management", department: "Department of Management" },
  // Add more as needed
];
```

**After selecting themselves, the form shows:**

- **Evaluation year** (text input, pre-filled with previous calendar year)
- **Evaluation period** (auto-calculated display): "Evaluation Year: 2025. Overall evaluation period: FY2025. Research evaluation window: FY2023-FY2025."
- **Recipient's full name** (text input)
- **Recipient's title/role** (text input)
- **Recipient's role category** (dropdown, determines which performance areas apply and how the letter is structured):

  - **Tenured/Tenure-Track Faculty: Professor** -- evaluated on Research & Publication, Teaching, and Service. Expected to demonstrate leadership and excellence in at least one area.
  - **Tenured/Tenure-Track Faculty: Associate Professor** -- evaluated on Research & Publication, Teaching, and Service. Expected to demonstrate effectiveness in all three, with excellence in research/publication or teaching.
  - **Tenured/Tenure-Track Faculty: Assistant Professor** -- evaluated on Research & Publication, Teaching, and Service. Focus is progress toward tenure. Effectiveness in teaching and excellence in research expected.
  - **APT Faculty: Lecturer / Senior Lecturer / Principal Lecturer** -- evaluated primarily on Teaching, with secondary consideration of Service. Research is NOT evaluated and its absence must NOT be noted negatively.
  - **APT Faculty: Clinical Assistant / Associate / Professor** -- evaluated on Teaching and Service. May satisfy service expectations through research publications with Department Head approval.
  - **APT Faculty: Professor of Practice (Assistant / Associate / Full)** -- evaluated on Teaching and Service. Individuals without terminal degrees who had distinguished private-sector careers.
  - **Department Head** -- evaluated on departmental leadership, faculty development, strategic direction, budget stewardship, plus their own continued research if applicable.
  - **Associate Dean / Other Administrative Leadership** -- evaluated on cross-functional impact, strategic initiatives, institutional leadership, program building.

- **Recipient's department** (text input, pre-filled from writer's department, editable)
- **Dean or supervisor name to CC** (optional, pre-filled with "Dean Sharp", editable)

**Performance Ratings** (per Mays Business School Guidelines, Section 6.4). The department head assigns a separate rating for EACH applicable performance area using the official Mays four-level scale:

For **Tenured/Tenure-Track Faculty and Department Heads**, three separate dropdowns:
- Teaching rating: Excellent / Effective / Needs Improvement / Unsatisfactory
- Research and Publication rating: Excellent / Effective / Needs Improvement / Unsatisfactory
- Service rating: Excellent / Effective / Needs Improvement / Unsatisfactory

For **APT Faculty (Lecturers)**, two dropdowns:
- Teaching rating: Excellent / Effective / Needs Improvement / Unsatisfactory
- Service rating (if applicable): Excellent / Effective / Needs Improvement / Unsatisfactory

For **APT Faculty (Clinical, Professor of Practice)**, two or three dropdowns:
- Teaching rating: Excellent / Effective / Needs Improvement / Unsatisfactory
- Service rating: Excellent / Effective / Needs Improvement / Unsatisfactory
- Research and Publication rating (optional, only if they have research expectations): Excellent / Effective / Needs Improvement / Unsatisfactory

**Overall rating dropdown** (auto-suggested based on per-area ratings, but editable):
- Excellent / Effective / Needs Improvement / Unsatisfactory

*Rating definitions (from Mays Guidelines Section 3):*
- *Excellent*: a high level of performance that meets and exceeds norms and expectations, reflected by substantive indicators of excellence
- *Effective*: performance that meets norms and expectations, reflected by substantive indicators of effective performance
- *Needs Improvement*: performance that falls below norms and expectations of effective performance
- *Unsatisfactory*: performance that falls below norms and expectations of excellent, effective, and needs improvement performance

### Step 2: Upload Documents and Add Notes

- **File upload area** (drag and drop) for the recipient's self-evaluation (.docx or .pdf)
- **File upload area** for the recipient's CV (.docx or .pdf)
- **Optional**: additional supporting documents
- **File size limit**: 10MB per file. Show clear error if exceeded.

- **Free-text area: "Your observations and notes"** (large text box where the writer types rough notes, bullet points, or thoughts they want reflected in the letter). Examples:
  - "She was amazing in the classroom this year, students loved her"
  - "He struggled with the committee work but his research was top-notch"
  - "I want to emphasize the mentoring she did with junior faculty"
  - "Growth area: needs to be more proactive about grant submissions"
  - "Goals we discussed: improve PhD placements, launch new certificate program, write 2 papers"

These notes are passed to the Writing Agent as additional context alongside the research brief. The AI weaves these observations naturally into the letter's "My Observations" and "Your Plan" sections.

### Step 3: Generate (Three-Phase AI Pipeline)

When the user clicks "Generate Letter," the app runs three sequential AI phases. Show progress for each phase with animated maroon progress indicators (use the design system's shimmer animation).

**Phase 1 -- Research**: Extract every factual claim, number, accomplishment, and goal from the uploaded documents. Display the research brief to the user for review. The user can edit or add notes before proceeding.

**Phase 2 -- Draft Letter**: Generate the evaluation letter using the research brief + the writer's notes + the appropriate letter-skill file for the faculty category. Display the full draft letter in a rich text preview. The user can edit inline before proceeding. Use Claude's streaming API so the user sees the letter being written in real-time.

**Phase 3 -- Verification**: Check every factual claim against the source documents. Check for AI-sounding language. Display a verification report showing what was confirmed, flagged, or needs revision. Auto-fix any flagged AI language patterns.

### Step 4: Download

- Download button for the final .docx letter (formatted with proper headers, memorandum format, signature block)
- Download button for the accompanying email (.docx)
- Option to regenerate or revise

---

## Batch Upload Mode (Alternative Workflow)

In addition to the single-person workflow, the page offers a **Batch Mode** toggle at the top. When enabled:

**Batch Step 1: Upload All Materials**

The department head uploads all self-evaluations and CVs at once. The app accepts:
- **Drag-and-drop of multiple files**: Auto-match files to people based on filenames (e.g., "Jane Smith - CV.pdf" and "Jane Smith - Self Evaluation.docx" get paired). The department head reviews and corrects matching.
- **A ZIP file**: containing subfolders per person (each subfolder has that person's CV and self-evaluation)
- **Individual file uploads**: manually assigned to a person

**Optional: Batch notes upload.** Two formats:
- **A Word document** with section headers per person (e.g., "## Jane Smith" followed by notes). The app parses and associates notes with each person.
- **A spreadsheet (.xlsx)** with columns: Name, Role Category, Teaching Rating, Research Rating, Service Rating, Overall Rating, Notes. The app reads and pre-fills setup fields for each person.

**Batch Step 2: Review Queue**

A queue panel showing all detected people, with status indicators:
- Gray: Not started
- Yellow: In progress (research brief generated, awaiting review)
- Green: Complete (letter generated and verified)
- Red: Needs attention (verification flagged issues)

Click a person to enter their individual workflow. When done, return to the queue.

**Batch Step 3: Generate All / Generate One-by-One**

Two options:
- **Step through one at a time** (recommended for quality): Review each person's research brief, adjust notes, generate and review individually.
- **Generate all remaining**: Runs the pipeline for every unprocessed person. Review all letters afterward.

**Batch Step 4: Download All**

- "Download All Letters" packages completed letters as a ZIP with individual .docx files
- "Download All Emails" generates the email file
- Individual downloads also available from the queue panel

---

## The AI Pipeline: Detailed Prompts

### CRITICAL: Human-Sounding Writing Rules

Every piece of prose the AI generates MUST follow these rules. Embed them in every writing prompt. These are the difference between a letter that sounds like a human leader wrote it and one that sounds like ChatGPT.

#### Banned Words (never use these)

**Adjectives**: robust (non-statistical), comprehensive, nuanced, multifaceted, intricate, innovative, cutting-edge, seamless, pivotal, crucial, vital, vibrant, compelling, profound, notable, commendable, meticulous, versatile, holistic

**Verbs**: delve, harness, leverage, underscore, foster, enhance, streamline, optimize, embark, navigate (except literal), unpack, unravel, showcase, garner, spearhead, bolster, catalyze, revolutionize, transcend

**Nouns**: landscape (metaphorical), realm, ecosystem (non-biological), tapestry, trajectory (non-physical), paradigm, synergy, nexus, interplay, cornerstone, bedrock, underpinning, testament, beacon, hallmark, game-changer

**Adverbs**: fundamentally, significantly (without data), remarkably, notably, importantly, crucially, essentially, ultimately, inherently

#### Banned Phrases and Openers

Never start a sentence with: "In today's...", "In an era of...", "In the ever-evolving...", "As [X] continues to evolve...", "It is important to note that...", "It is worth noting that...", "Moreover,", "Furthermore,", "Additionally,", "Indeed,", "Notably,", "Importantly,", "Taken together,"

Never use: "In other words,...", "the fact that", "In order to", "Due to the fact that", "It is widely recognized that..."

#### Structural Rules

- No em-dashes or en-dashes. Use commas, semicolons, colons, or split into two sentences. This is the single most recognizable AI writing pattern.
- Paragraphs should vary in length naturally, not be artificially balanced
- Do not default to three items in every list; use however many actually exist
- Do not write every paragraph as: topic sentence, three points, summary
- No triple parallel structures ("AI changes how firms compete, how firms organize, and how firms learn")
- Maximum one "While X, Y" opener per page

#### Sentence-Level Rules

- Do not end sentences with "-ing" phrases that summarize significance ("...highlighting the importance of governance")
- Prefer verbs over nominalizations ("The system improved outcomes" not "The implementation led to an improvement")
- Use "is" freely; do not replace with "serves as," "stands as," "represents," "constitutes"
- Limit "not just X, but Y" to once per section
- Repeat the right word rather than cycling synonyms
- Match confidence to evidence; do not hedge when the data are strong

#### Tonal Rules

- Take positions; do not present false balance
- Show epistemic variation (certain about some things, uncertain about others)
- Do not end with vague optimism about "the field continuing to evolve"
- Leave appropriate loose ends; not everything resolves neatly

### Phase 1 Prompt: Research Agent

```
You are the Research Agent for an evaluation letter. Your job is to read the uploaded documents and produce a comprehensive, factual research brief. You are the foundation of the process: if you miss something, it won't appear in the letter. If you invent something, the letter will contain a fabrication.

Read ALL uploaded documents carefully. Produce a structured research brief with the following sections:

## Basic Information
- Full Name
- Title/Role
- Department
- Role Category (tenured-faculty, apt-faculty, staff, department-head, associate-dean, administrative)

## Research and Scholarly Accomplishments
Every publication, paper under review, grant, presentation, award, or scholarly activity. Include exact journal names, co-authors, status (published, accepted, under review, R&R), citation metrics, conference names, grant amounts. For staff or APT faculty without research expectations, note "N/A" or list any scholarly contributions if present.

## Teaching and Student-Facing Accomplishments
Courses taught (with numbers), evaluations/scores, curriculum development, student mentoring, PhD placements, teaching awards, new course development, advising load.

## Service and Administrative Accomplishments
Committees, editorial roles, department/college/university service, professional organization leadership, administrative achievements (hiring, budget, program launches), event management, process improvements.

## Operational and Team Accomplishments (for staff roles)
Team management, process improvements, event coordination, student support, professional development, cross-department collaboration.

## Areas Where Goals Were Not Fully Met
Quote or closely paraphrase what the person themselves said about shortcomings. Do not editorialize. If they didn't mention any, note that explicitly.

## Goals for the Upcoming Year
List every goal they stated. Use their own language as closely as possible.

## Key Themes and Patterns
Note 2-3 overarching themes across their materials.

## Raw Numbers and Facts
A bullet list of every specific number, date, name, or verifiable fact. This is the verification agent's primary reference.

RULES:
1. NEVER invent. If the CV mentions a publication but gives no journal name, write "publication (journal not specified)." Do not guess.
2. NEVER infer accomplishments. If someone lists a committee membership but doesn't describe what they did, just list the membership.
3. PRESERVE specificity. "grew revenue by 23%" not "significantly grew revenue."
4. Read the CV carefully for context the self-evaluation may miss. Flag anything noted in CV but not in self-evaluation.
5. Note the tone of their self-evaluation (confident, modest, defensive about certain areas).
```

### Phase 2 Prompt: Writing Agent

```
You are writing a formal annual performance evaluation letter. You are writing on behalf of {writer_name}, {writer_title} at {institution}.

The letter evaluates {recipient_name}, {recipient_title} for the year {eval_year}.

The recipient's role category is: {role_category}.

Performance ratings for this evaluation (per Mays Business School Guidelines, Section 6.4):
- Teaching: {teaching_rating}
- Research and Publication: {research_rating} (N/A if role category does not require research evaluation)
- Service: {service_rating}
- Overall: {overall_rating}

LETTER SKILL REFERENCE:
{letter_skill_content}

Use the letter skill reference above to match the expected structure, tone, and section ordering for this faculty category. Pay close attention to which sections are required, which are optional, and what language patterns are expected.

Use the research brief below to write the letter. Also incorporate the writer's personal observations and notes (provided separately below the research brief).

Follow this exact structure:

1. DATE LINE: "{month} {year}" (current month and year)

2. MEMORANDUM header

3. TO/FROM/SUBJECT block:
   TO: {recipient_name}
       {recipient_title}
   FROM: {writer_name}
         {writer_title}, {institution}
   SUBJECT: {eval_year} Performance Evaluation

4. SALUTATION: "Dear {first_name},"

5. OPENING PARAGRAPH: Thank them for serving in their role. Adapt the opening based on role category:
   - For faculty and department heads: reference their "Professional Activity and Accomplishment Report (January 1 to December 31, {eval_year})."
   - For staff: reference their "annual performance review" or "self-evaluation."
   - For APT faculty: acknowledge their teaching-focused appointment naturally.
   Note this is a follow-up to the review and the annual performance review meeting.

6. SUMMARY OF MAJOR ACCOMPLISHMENTS (heading, bold): 3-5 paragraphs of flowing narrative prose. NO bullet points. Each paragraph focuses on a coherent area. Weave specific accomplishments into a story about why they matter. Every praise statement must be tied to a specific accomplishment with names and numbers.

7. MY OBSERVATIONS AND OUR DISCUSSION (heading, bold): 2-3 paragraphs.
   - Paragraph 1: Personal observations about their performance. What makes their approach distinctive. IMPORTANT: Use the writer's personal notes heavily here.
   - Paragraph 2: Growth area, framed constructively as a natural next step. Acknowledge the strength first, then suggest evolution.
   - Paragraph 3 (optional): Additional nuance or context.

8. YOUR PLAN FOR THE UPCOMING YEAR (heading, bold):
   - Opening sentence connecting their goals to the institutional moment
   - 3-5 bullet points of specific goals from the self-evaluation and the writer's notes, each 1-2 sentences
   - Closing sentence affirming confidence in their direction

9. SUMMARY (heading, bold): 2-3 sentences.
   - Use their first name. Make a summary statement.
   - State the per-area ratings explicitly: "My evaluation of your performance is as follows: Teaching: {teaching_rating}; Research and Publication: {research_rating}; Service: {service_rating}. Overall, my evaluation is that you have demonstrated {overall_rating} performance."
   - For APT faculty without research expectations, omit the Research and Publication line entirely.
   - "Please return a signed copy of this annual performance review for our personnel files. Thank you."

10. SIGNATURE BLOCK: A line of underscores, then "Signature" and "Date"

CALIBRATE TONE TO RATINGS (using the official Mays four-level scale):

The letter must address each performance area with a tone calibrated to that area's individual rating. The overall tone reflects the overall rating.

- **Excellent**: "nothing short of remarkable," "this was a year that set a new standard," "I do not use the word excellent lightly." The section is expansive and celebratory. Growth areas framed as "taking your already excellent work to the next level." Per Mays Guidelines: performance that meets AND exceeds norms and expectations.
- **Effective**: "a strong and productive year," "consistent, valuable contributions," "you met the expectations for your role and in several areas exceeded them." Warm and substantive. Growth areas framed as natural next steps. Per Mays Guidelines: performance that meets norms and expectations.
- **Needs Improvement**: Handle with care but be direct. Acknowledge strengths first, then be specific about what needs to change. Growth areas are clear priorities with specific expectations and timelines. Per Mays Guidelines Section 6.6.2, the department head and faculty member must develop a plan for near-term improvement.
- **Unsatisfactory**: Handle with extra care. Be specific about what needs to change. Honest but respectful. Growth areas are requirements, not suggestions. Per Mays Guidelines Section 6.6.1, this requires a written improvement plan, and copies go to the Dean and Senior Associate Dean.

IMPORTANT: When a faculty member receives different ratings in different areas (e.g., Excellent in Research but Needs Improvement in Service), the letter must reflect both realities. Do not let praise in one area dilute the directness needed in another, and do not let criticism in one area overshadow genuine accomplishment in another.

ADAPT TO ROLE CATEGORY (per Mays Business School Guidelines, Sections 2 and 6):

- **Tenured/Tenure-Track Faculty: Professor**: Evaluate across all three areas. Professors should demonstrate leadership in pursuing excellence and gain national and international prominence. Emphasize continued productivity, mentoring of junior faculty, editorial leadership, PhD student development, and service contributions.

- **Tenured/Tenure-Track Faculty: Associate Professor**: Evaluate across all three areas. The School expects effectiveness in all three areas, with excellence in either research/publication or teaching. Emphasize progress since tenure, growth in service contributions, and whether they are building toward promotion to Professor.

- **Tenured/Tenure-Track Faculty: Assistant Professor**: Evaluate across all three areas. Focus is progress toward promotion to Associate Professor with tenure. Must demonstrate effectiveness in teaching and excellence in research and publication. Service focus is limited. Be attentive to the tenure clock.

- **APT Faculty: Lecturer / Senior Lecturer / Principal Lecturer**: Evaluate primarily on Teaching, with secondary consideration of Service. CRITICAL: Do NOT evaluate on Research and Publication. Do NOT reference the absence of research activity negatively. Per Mays Guidelines Section 6.2, a faculty member serving at the rank of Lecturer will not be evaluated on research, nor will the lack of such activities be viewed as a negative factor.

- **APT Faculty: Clinical Assistant / Associate / Professor**: Evaluate on Teaching and Service. With Department Head approval, clinical faculty may satisfy service expectations through research publications.

- **APT Faculty: Professor of Practice (Assistant / Associate / Full)**: Evaluate on Teaching and Service. These faculty do not hold terminal degrees but have distinguished private-sector careers. With Department Head approval, they may satisfy service expectations through additional teaching or intellectual contributions consistent with AACSB's scholarly practitioner classification.

- **Department Head**: Evaluate on departmental leadership, faculty development and hiring, strategic direction, departmental culture, budget stewardship, external relations, and their own continued research if applicable.

- **Associate Dean / Other Administrative Leadership**: Evaluate on cross-functional impact, strategic initiatives, institutional leadership, program building, and the scope of their portfolio.

VOICE GUIDELINES:
- Write like a senior academic leader who genuinely cares about the person's growth
- Reference specific conversations where possible (use the writer's notes for this)
- Connect individual contributions to the bigger institutional picture
- Be warm and personal but maintain collegial authority
- Vary sentence length: mix short punchy sentences with longer analytical ones
- If three sentences in a row start with the same word (especially "Your"), rewrite
- Use "I" when stating observations and "we" when speaking institutionally
- Frame growth areas as logical next steps, not deficiencies

CRITICAL WRITING RULES:
[Insert the complete banned words, phrases, structural rules, and sentence-level rules]

RESEARCH BRIEF:
{research_brief}

WRITER'S PERSONAL OBSERVATIONS AND NOTES:
{writer_notes}
```

### Phase 3 Prompt: Verification Agent

```
You are the verification agent. Check every factual claim in the letter against the source documents. Also check for AI-sounding language.

STEP 1: Go through the letter sentence by sentence. Identify every verifiable claim: numbers, names, dates, titles, accomplishments, awards, course names.

STEP 2: For each claim, find the corresponding passage in the source documents. Classify as:
- CONFIRMED: matches the source exactly or with minor rephrasing
- EMBELLISHED: source says something related but the letter adds unsupported detail
- FABRICATED: no corresponding information in any source document
- INFERRED: reasonable conclusion but not explicitly stated

STEP 3: Check for AI language patterns:
- Em-dashes or en-dashes: flag every instance
- Any word from the banned words list
- Three or more consecutive sentences starting with "Your" or "You"
- "From X to Y, from A to B" parallel constructions
- Generic praise without specific backing
- Sentences all approximately the same length (5+ in a row)
- Participial phrases at sentence ends summarizing significance ("...highlighting the importance of")

STEP 4: If any FABRICATED claims or AI language issues are found, rewrite those specific sentences to fix the problems. Return both the verification report and the corrected text.

LETTER TEXT:
{letter_text}

SOURCE DOCUMENTS:
{source_documents}
```

### Accompanying Email Prompt

```
Write a brief, warm email to accompany the evaluation letter. This email is from {writer_name} to {recipient_name}, CC'd to {cc_name}.

Structure:
1. Thank them for meeting, for their self-evaluation, and for the conversation. Make it personal.
2. Tell them you've written a letter capturing the discussion and their goals.
3. Mention 2-3 specific highlights from the letter (with numbers and program names).
4. A warm, personal closing about what it means to work with them.
5. "I am copying {cc_name}. The formal letter will be sent for your signature and personnel file."
6. Sign-off: "Warm regards, {writer_first_name}"

Rules:
- Same banned words and punctuation rules as the letter
- Approximately 100-150 words in the body
- The tone should make the recipient feel valued, not evaluated
- No rating language (don't mention "excellent" or "strong" performance)

LETTER CONTENT (for reference):
{letter_content}
```

---

## Letter Skill Integration

The Phase 2 Writing Agent receives the appropriate letter-skill file based on the recipient's role category. The mapping:

| Role Category | Letter Skill File |
|---|---|
| Assistant Professor (TT) | `letter-skills/assistant-professor-tenure-track.md` |
| Associate Professor (TT) | `letter-skills/associate-professor.md` |
| Professor (TT) | `letter-skills/full-professor.md` |
| Lecturer / Senior / Principal Lecturer | `letter-skills/lecturer-and-senior-lecturer.md` |
| Clinical Faculty (APT) | `letter-skills/executive-professor-and-professor-of-practice.md` |
| Professor of Practice (APT) | `letter-skills/executive-professor-and-professor-of-practice.md` |
| Department Head | Use associate-professor or full-professor skill as base, add leadership framing |
| Associate Dean / Admin | Custom framing (no template yet) |

The letter-skill file content is injected into the `{letter_skill_content}` variable in the Phase 2 prompt. This gives the AI the exact section ordering, required elements, tone guidance, and style patterns for that faculty category.

---

## Document Generation (.docx)

Use the `docx` npm package to generate the final Word document.

**Format specifications:**
- Page size: US Letter (8.5" x 11"), 1" margins
- Font: 11pt Calibri throughout
- Section headings: Bold, 11pt, same font
- Body text: single-spaced within paragraphs, blank line between paragraphs
- Header: Include the writer's institution name/logo on the first page only (make this configurable)
- Footer: Page number on pages 2+ only
- Signature block: horizontal line of underscores, then "Signature" left-aligned and "Date" right-aligned
- Bullet points in the goals section: proper Word list formatting, not Unicode bullet characters
- Use `LevelFormat.BULLET` with numbering config for any bulleted lists (never use `•` or `·`)

**Text extraction from uploads:**
- Use `mammoth` for .docx text extraction
- Use `pdf-parse` for PDF text extraction
- Both run server-side in API routes

---

## App-Specific File Structure

```
src/
  app/
    admin/
      evaluation-letters/
        page.tsx                    # Main evaluation letter writer page
        batch/
          page.tsx                  # Batch mode page (optional: could be same page with toggle)
  components/
    evaluation-letters/
      SetupForm.tsx                 # Step 1: Writer selection, recipient info, ratings
      WriterSelector.tsx            # Dropdown of hardcoded department heads
      RoleCategorySelector.tsx      # Role category dropdown with dynamic rating fields
      RatingSelector.tsx            # Per-area rating dropdowns
      FileUpload.tsx                # Drag-and-drop upload component
      WriterNotes.tsx               # Free-text area for writer observations
      ResearchBrief.tsx             # Editable research brief display (Phase 1 output)
      LetterPreview.tsx             # Rich text letter preview (Phase 2 output)
      VerificationReport.tsx        # Verification results display (Phase 3 output)
      ProgressTracker.tsx           # Three-phase animated progress indicator
      DownloadPanel.tsx             # Download buttons for letter and email
      BatchQueue.tsx                # Batch mode queue panel with status indicators
      BatchUpload.tsx               # Batch file upload and matching UI
  lib/
    evaluation-letters/
      claude.ts                     # Anthropic API client
      prompts.ts                    # All prompt templates (research, writing, verify, email)
      writers.ts                    # Hardcoded list of department heads/leaders
      letter-skills.ts              # Letter skill file loader (maps role category to skill file)
      docx-generator.ts             # .docx file generation using docx npm package
      extract-text.ts               # .docx (mammoth) and .pdf (pdf-parse) text extraction
      writing-rules.ts              # Banned words, patterns, validation functions
      batch-processor.ts            # Batch mode file matching and queue management
  app/
    api/
      evaluation-letters/
        research/
          route.ts                  # Phase 1 API endpoint
        draft/
          route.ts                  # Phase 2 API endpoint (with streaming)
        verify/
          route.ts                  # Phase 3 API endpoint
        email/
          route.ts                  # Email generation API endpoint
        download/
          route.ts                  # .docx generation and download endpoint
```

---

## Key Implementation Notes

1. **Streaming**: Use Claude's streaming API for Phase 2 (letter drafting) so the user sees the letter being written in real-time.

2. **Error handling**: If any phase fails, show a clear error and let the user retry that phase without losing previous work.

3. **Session state**: Keep all state in React (useState/useReducer). Research brief, draft letter, and verification report live in client state. No database for v1.

4. **Editable intermediate outputs**: The user MUST be able to edit the research brief before Phase 2, and edit the draft letter before Phase 3. This is not optional. Academic leaders need to add their own observations and correct any misreadings.

5. **Writer's notes are critical input**: The free-text area is a first-class input. These notes should heavily influence the "My Observations" and "Your Plan" sections. Without them, the letter reads like a document summary. With them, it reads like a letter written by someone who knows the person.

6. **Quote verification**: If the letter includes an inspirational quote, the verification agent must check the attribution. Misattributed quotes are embarrassing. If attribution cannot be verified with high confidence, remove the quote.

7. **Texas A&M naming conventions** (enforce in all generated text):
    - "Texas A&M University" on first reference, "Texas A&M" thereafter
    - "Mays Business School" on first reference, "Mays" thereafter
    - Serial comma only when needed for clarity (AP style)
    - Titles lowercase after name ("Nate Sharp, dean of Mays Business School")
    - Titles capitalized before name ("Dean Nate Sharp")

8. **Rate limiting**: Basic rate limiting on API routes (max 10 requests per minute per session).

9. **The writing rules are the secret sauce**: The banned words list, structural rules, and verification pipeline are what make this tool produce human-sounding output. Embed these rules deeply in every prompt. Do not skip or abbreviate them.

10. **Claude model**: Use `claude-sonnet-4-20250514` for all three phases.

---

## Admin Tools Card Registration

Register this app in the Admin Tools grid (from Prompt 1's container page) by adding it to the tools config array:

```typescript
const ADMIN_TOOLS = [
  {
    id: 'evaluation-letters',
    name: 'Evaluation Letter Writer',
    description: 'Generate AI-assisted annual evaluation letters for faculty and staff, with fact-checking and human-writing verification.',
    route: '/admin/evaluation-letters',
    icon: 'FileText', // or appropriate icon
    status: 'active',
  },
  // Future tools will be added here
];
```

---

## Testing the Pipeline

Before deploying, test with a sample self-evaluation and CV. Verify:
- The research brief captures every fact from the source documents
- The letter follows the correct section structure for the selected role category
- The writer's rough notes appear naturally in the Observations and Goals sections
- No banned words appear anywhere in the output
- No em-dashes or en-dashes appear
- No three consecutive sentences start with "Your"
- The verification report correctly identifies any fabricated claims
- The .docx downloads correctly with proper formatting
- The email is warm, specific, and under 150 words
- The performance rating calibrates the tone correctly (test with both "Excellent" and "Needs Improvement" to verify tonal difference)
- APT faculty letters do NOT include research evaluation
- The letter-skill file for the selected category is correctly loaded and its patterns are reflected in the output
