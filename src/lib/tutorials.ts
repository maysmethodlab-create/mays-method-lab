/**
 * Tutorials library data.
 *
 * Each tutorial has frontmatter (title, blurb, meta, category, bucket) plus a
 * markdown body. The body is rendered natively at /agents/[slug]; nothing
 * routes off-site.
 *
 * Cross-references between tutorials use slug links (in-app), not external
 * URLs. Tool references go to /tools.
 */

export type Tutorial = {
  slug: string;
  title: string;
  blurb: string;
  /** Meta line shown on the index card and detail header (e.g. "20 min · Beginner"). */
  meta: string;
  category: string;
  /** Bucket slug aligned with the LC taxonomy. */
  bucket: string;
  /** One-line summary used as the page subhead. */
  description: string;
  /** Prerequisites bullet list. */
  prerequisites: string[];
  /** Body markdown. Rendered with the lightweight markdown renderer. */
  body: string;
  /** Slugs of related tutorials. */
  related?: string[];
  /** Tag chips. */
  tags?: string[];
};

export const TUTORIALS: Tutorial[] = [
  {
    slug: 'meeting-notes-action-items',
    title: 'Meeting notes to action items in 20 minutes',
    blurb:
      'Paste-and-review workflow: rough notes to owners, deadlines, and next steps.',
    meta: '20 min · Beginner',
    category: 'Productivity',
    bucket: 'writing',
    description:
      'A lightweight meeting-notes agent. A reusable prompt, a review checklist, and a copy-ready action list. No database, calendar, or meeting bot.',
    prerequisites: [
      'A set of rough meeting notes',
      'A TAMU-approved AI tool',
      'Five minutes to review the output before sharing',
    ],
    body: `## Start with the 20-minute version

Do not start with transcription, storage, login, or calendar sync. Start with one repeatable workflow:

1. Paste rough notes into an approved AI tool.
2. Ask for action items only.
3. Review the list against the notes.
4. Copy the cleaned list into email, Teams, Slack, or a task tracker.

That is enough to prove whether the workflow helps before building anything heavier.

## Use this prompt

Copy this into [TAMU AI Chat](/tools), Microsoft Copilot, Google Gemini, or another approved tool:

\`Extract action items from these meeting notes. Return only tasks that are clearly stated or strongly implied. For each item, include task, owner, due date, evidence from the notes, and a review flag if anything is missing or uncertain. Do not invent owners, dates, or decisions. If there are no clear action items, say so. Format the result as a concise checklist I can paste into a follow-up message.\`

Then paste the meeting notes below the prompt.

## Review before you share

Check three things before sending the result:

- Did the AI invent a task, owner, or deadline?
- Did it miss a decision or follow-up that matters?
- Does each item start with a concrete verb such as send, schedule, review, draft, confirm, or update?

If an item is vague, rewrite it before sharing. A good action item says who will do what by when, or clearly marks the missing piece as unknown.

## Copy a simple follow-up

Use a short format that people can scan:

- \`Name - Task - Due date or unknown - Source note\`
- \`Unassigned - Task that needs an owner - Due date or unknown - Source note\`

For a broader meeting summary, use the [Summarize meeting notes](/prompts) prompt and pull the action section into your follow-up.

## Upgrade later

Only build an app after the manual workflow works several times. The first useful app version should still stay small: a notes box, an extract button, editable action-item rows, and a copy button. Add storage, reminders, task-tool exports, and calendar links after people trust the review loop.`,
    related: ['chatbot-own-documents', 'spreadsheet-analysis-agent'],
    tags: ['meeting-notes', 'action-items', 'tiny-app', 'workflow'],
  },
  {
    slug: 'chatbot-own-documents',
    title: 'Chatbot over your documents with NotebookLM',
    blurb:
      'Use NotebookLM to ask cited questions across your own approved documents.',
    meta: '45 min · Beginner',
    category: 'Knowledge',
    bucket: 'research',
    description:
      'A beginner-friendly NotebookLM notebook. A small set of approved sources, source-grounded questions, and citation checks before you trust an answer.',
    prerequisites: [
      'A small set of documents, notes, links, or PDFs you have permission to use',
      'Access to NotebookLM through the appropriate Google account',
      'A plan for avoiding sensitive or restricted content',
    ],
    body: `## What you are building

Use [NotebookLM](https://notebooklm.google.com/) to create a source-grounded notebook for your own documents. Add a small source set, ask questions in plain language, and check the citations before relying on an answer.

This guide uses NotebookLM only. It does not require coding, a custom app, or a separate chatbot platform.

## Pick a small source set

Start with 3 to 10 files or links that belong together. Good first examples include course readings, meeting notes, approved FAQs, project documents, public reports, or policy references that are safe to upload.

Do not start with an entire shared drive. A notebook is easier to trust when the source set is small, current, and easy to review.

## Check the sources first

Before uploading, make sure each source is appropriate for NotebookLM.

1. Use documents you are allowed to upload.
2. Remove drafts, comments, tracked changes, and outdated copies when they are not needed.
3. Avoid confidential student, personnel, medical, legal, or restricted records unless the data use has been approved.
4. Give files clear names, such as \`Program-FAQ-2026-approved.pdf\`.
5. Prefer text-based PDFs, docs, pasted notes, and web links over scanned images.

## Create the notebook

Open [NotebookLM](https://notebooklm.google.com/) with the appropriate Google account. Create a new notebook and name it for the source set, such as \`Research Reading Notes\` or \`Program FAQ Notebook\`.

Add your approved files, links, or pasted notes. After uploading, ask this setup question:

\`List every source you can see by title or file name. Do not summarize yet.\`

Review the list. If a source is missing, duplicated, outdated, or hard to read, fix the source set before asking real questions.

## Ask beginner-friendly questions

Start with simple lookup and summary questions before asking for comparisons or drafts.

Useful first questions include:

- \`What are the main topics covered in these sources? Cite the source for each topic.\`
- \`Where do these documents discuss [topic]? Give me the source name and section.\`
- \`Summarize the answer to [question] using only these sources.\`
- \`What does the source set not answer about [topic]?\`
- \`Compare what Source A and Source B say about [topic].\`

Ask one question at a time. If the answer feels too broad, ask NotebookLM to point to the exact source section it used.

## Set answer boundaries

Paste this instruction before important questions:

\`Answer only from the sources in this notebook. Cite the source for each answer. If the sources do not answer, say that the sources do not answer. Do not guess or use outside knowledge.\`

For policy, academic, legal, medical, personnel, or high-stakes questions, treat NotebookLM as a source-finding assistant. The source documents and responsible office remain authoritative.

## Verify before you use the answer

Before copying an answer into your work, check three things:

1. The answer cites the right source.
2. The cited source actually supports the claim.
3. The answer says when the sources do not contain enough information.

If the answer is wrong, unclear, or missing a citation, ask a narrower question or improve the source file name, heading, or source set.

## Keep the notebook useful

As the work changes, remove outdated sources and add new approved versions. Keep a short note in the notebook with the source set, date reviewed, and any limits users should remember.

Use separate notebooks for separate topics. A course-reading notebook, a policy-reference notebook, and a project-notes notebook should usually stay separate.`,
    related: ['personal-knowledge-base-search', 'rag-app-uploaded-pdfs'],
    tags: ['chatbot', 'documents', 'notebooklm', 'sources', 'citations'],
  },
  {
    slug: 'spreadsheet-analysis-agent',
    title: 'Build an AI spreadsheet analysis agent',
    blurb:
      'Plain-language prompts in Excel Copilot or Gemini to clean, summarize, and explain.',
    meta: '45 min · Beginner',
    category: 'Productivity',
    bucket: 'programs',
    description:
      'A spreadsheet assistant pattern for academic and administrative data work. Source files, formulas, and outputs all stay reviewable.',
    prerequisites: [
      'A non-sensitive sample spreadsheet',
      'Clear analysis questions',
      'A plan to verify formulas and summaries',
      'Access to Excel/Copilot or Google Sheets/Gemini',
    ],
    body: `## What you are building

A spreadsheet analysis agent that helps clean data, explain formulas, propose pivots or charts, summarize trends, and document assumptions. It supports human analysis. It does not make final decisions about students, employees, funding, admissions, performance, or other people-centered outcomes.

## Recommended first version

Use the tool that already owns the spreadsheet:

- Use [Microsoft Copilot](/tools) in Excel for Microsoft 365 workbooks when Copilot is available in your account.
- Use [Google Gemini](/tools) only through an eligible \`@tamu.edu\` account with the shield icon visible. If Gemini is not available inside Sheets, use Gemini web only with a sanitized export or copied sample.
- Use [Power Automate](/tools) only after the manual Excel or Sheets workflow is reliable.
- Use [Zapier](/tools) only for non-sensitive cross-app workflows.
- Use [Codex](/tools) or [Cursor](/tools) only for specialist or custom app work with fake or sanitized files first.

## Step 1: Make a review copy

Never start with the production workbook.

1. Duplicate the spreadsheet.
2. Rename the copy with \`AI-review-copy\` and the date.
3. Remove unnecessary names, IDs, emails, notes, and free-text fields.
4. Keep the original unchanged.
5. Add a sheet named \`review_notes\`.

In \`review_notes\`, record:

- Original file owner
- Copy date
- Fields removed
- Questions the agent should answer
- Checks a human will perform
- Whether Copilot, Gemini, Power Automate, Zapier, Codex, or Cursor is being used

## Step 2: Prepare the data for Excel Copilot

If using Excel, make the workbook easy for Copilot to read.

1. Put the data in a table or supported range.
2. Give each column a clear header.
3. Remove blank header rows and merged cells from the analysis range.
4. Create a separate summary or review sheet for AI-generated outputs.
5. Save the workbook in OneDrive or SharePoint if your Copilot setup requires cloud storage.
6. Open the workbook in Excel and look for Copilot on the Home tab or sidebar.

If Copilot is not visible, it may not be included with your license or organization settings. You can still use the guide by preparing prompts manually and applying formulas, pivots, and charts yourself.

## Step 3: Ask one narrow question

Start with one job, not a broad request such as \`analyze this spreadsheet\`.

Good first prompts for Excel Copilot or Gemini are:

- \`Explain what this formula does in plain language: [paste formula]\`
- \`Find inconsistent category labels in [column name] and suggest a cleanup map. Do not change the data yet.\`
- \`Create a pivot-table plan to summarize count by status and month.\`
- \`Identify rows with blank required fields in [columns]. Explain the rule used.\`
- \`Suggest a chart for this summary table and explain why.\`
- \`Draft a formula for a new review column. Do not overwrite existing values.\`

Ask the tool to include assumptions, columns used, row filters, and formulas generated.

## Step 4: Use Copilot in Excel

1. Open the review copy in Excel.
2. Select the table or click inside the supported data range.
3. Open Copilot from the Home tab or sidebar.
4. Paste one narrow prompt.
5. Review the answer before accepting any changes.
6. Put generated formulas in a new review column first.
7. Put generated pivots, charts, or summaries on a new sheet.
8. Add notes in \`review_notes\` describing what Copilot generated.

Use Copilot for explanations, draft formulas, cleanup suggestions, pivots, charts, and trend summaries. Do not let it silently overwrite source data.

## Step 5: Use Gemini with a Google Sheet

Use this path only when the Google account and data use are appropriate.

1. Open [Google Gemini](/tools) while signed in with the eligible \`@tamu.edu\` account.
2. Confirm the shield icon appears in the prompt field.
3. If Gemini is available in Sheets for your account, use the same narrow prompts from Step 3.
4. If Gemini is not available in Sheets, copy only a sanitized sample or export a sanitized CSV for Gemini web.
5. Ask Gemini to explain assumptions, columns used, filters, and suggested formulas.
6. Apply changes manually in the Sheet after review.

Do not use a personal Google account for university data.

## Step 6: Verify every output

Check the agent against known answers before trusting it.

- Totals match manually calculated totals
- Blank rows are handled correctly
- Dates parse correctly
- Categories are not silently merged
- Filters are documented
- Generated formulas work on first, middle, last, blank, and unusual rows
- Pivots use the intended row and column fields
- Charts represent the right range
- Summaries do not make decisions about people

If the workbook supports a recurring report, keep one small test file with known answers so future changes can be checked quickly.

## Step 7: Automate only after the manual version works

If the same spreadsheet is fed by Microsoft Forms, SharePoint, OneDrive, Outlook, or Teams, use Power Automate after the manual analysis pattern is stable.

A simple Microsoft 365 automation looks like this:

1. Open [Power Automate](/tools).
2. Create an automated cloud flow.
3. Choose the trigger, such as a new Microsoft Forms response or a file created in SharePoint.
4. Add an action that writes the response to Excel or SharePoint.
5. Add a Teams or Outlook notification asking a human to review the analysis workbook.
6. Test with fake data.
7. Keep the human review step in place.

Use Zapier only for non-sensitive external app workflows.

## Upgrade path: build a custom analysis app

A custom app is useful when users need the same analysis repeatedly, need a controlled upload screen, or need an audit trail. Build the first version with fake or sanitized CSV files in Codex or Cursor.

A useful app should include:

- File upload or approved storage connection
- Column mapping
- Required-field checks
- Analysis prompt library
- Formula and summary preview
- Exportable report
- Audit log of source file, prompt, filters, and generated formulas

Connect real spreadsheets only after data handling, access control, and hosting are approved.

## Save the repeatable pattern

Once the workflow is reliable, save the prompt, template workbook, known-answer test file, and review checklist. Link back to the approved tool profile so future users understand which data is appropriate for each tool.`,
    related: ['meeting-notes-action-items', 'faculty-guidelines-chatbot'],
    tags: ['agent', 'spreadsheets', 'excel', 'data', 'copilot', 'gemini'],
  },
  {
    slug: 'recommendation-letter-agent',
    title: 'Build a recommendation letter agent',
    blurb:
      "Collect a candidate's evidence and draft a reviewable recommendation letter.",
    meta: '50 min · Beginner',
    category: 'Writing',
    bucket: 'writing',
    description:
      'A human-reviewed drafting assistant for recommendation letters using student-provided context, faculty notes, approved storage, and a clear privacy boundary.',
    prerequisites: [
      'Student consent to use the provided details',
      'Faculty notes or bullet points',
      'Approved storage for intake responses',
      'A secure place to draft and review the letter',
    ],
    body: `## What you are building

A human-reviewed assistant that collects structured evidence for a recommendation letter and helps the recommender draft from that evidence. The agent should never invent achievements, submit letters, or replace the faculty member's judgment.

## Recommended first version

Use a Microsoft 365 workflow for the first repeatable version:

- Microsoft Forms collects the student request
- Excel or SharePoint stores the response
- [Power Automate](/tools) alerts the recommender
- [Microsoft Copilot](/tools) in Word helps draft from reviewed evidence
- The faculty member edits and sends the final letter manually

For a one-off draft, use [TAMU AI Chat](/tools), [Google Gemini](/tools) with the shield icon visible, or Copilot in Word. Paste only details approved for that tool.

## Step 1: Decide the data boundary

Before building the form, decide what the workflow is allowed to collect and where it will live.

1. Use approved Microsoft 365 storage for the intake responses.
2. Collect only details needed for the recommendation.
3. Ask the student to confirm that the provided information may be used to draft the letter.
4. Do not collect sensitive details that are not needed for the letter.
5. Keep the final submission manual.

The agent prepares a draft. The recommender owns the final letter.

## Step 2: Create the Microsoft Form

Create a Microsoft Form named for the request type, such as \`Recommendation Letter Request\`.

Add structured fields for:

- Student name
- Student email
- Preferred pronouns if the student chooses to provide them
- Opportunity, program, scholarship, employer, or graduate school
- Deadline
- Submission method and link if applicable
- How the faculty member knows the student
- Courses, projects, research, work, or service observed by the faculty member
- Three strengths with concrete examples
- Resume, transcript, or statement only if approved for the storage location
- Student confirmation that the information may be used for drafting the letter

Use required fields for deadline, opportunity, relationship context, and at least one concrete example. Keep free-text prompts specific so the draft has evidence instead of generic praise.

## Step 3: Store responses for review

Choose one storage pattern:

1. Use the built-in Microsoft Forms response spreadsheet for a simple first version.
2. Use a SharePoint list if multiple people need to track status, owner, deadline, and completion.
3. Add status fields such as \`new\`, \`reviewing\`, \`drafted\`, \`sent\`, and \`declined\`.
4. Add reviewer notes for details the faculty member wants to add privately.

Do not put final letter text in a shared tracker unless that storage location is approved for it.

## Step 4: Add a Power Automate notification

Use Power Automate to notify the recommender when a request arrives.

1. Open [Power Automate](/tools).
2. Choose **Create** and select **Automated cloud flow**.
3. Select the Microsoft Forms trigger \`When a new response is submitted\`.
4. Choose the recommendation request form.
5. Add the Microsoft Forms action \`Get response details\`.
6. Add an Outlook email or Teams message action to notify the recommender.
7. Include the student name, opportunity, deadline, and link to the stored response.
8. Save the flow and test it with a fake student request.

Keep the first flow simple. Do not add automatic drafting, sending, or external app connections until the intake and review process works reliably.

## Step 5: Prepare the evidence packet

Before drafting, the recommender should review the form response and create a short evidence packet.

Use this structure:

- Relationship: how the recommender knows the student
- Evidence: observed coursework, projects, research, service, or work
- Strengths: claims supported by examples
- Fit: why the student matches the opportunity
- Missing details: anything the recommender needs to add or verify

Remove unsupported claims before asking an AI tool to draft.

## Step 6: Draft in Word or a chat tool

For the Microsoft path, open Word, paste the evidence packet into a new document, and use Copilot from the document or Home tab. Ask Copilot to draft from the evidence already in the document.

Use this prompt in Copilot, TAMU AI Chat, or Gemini:

\`Draft a recommendation letter from the faculty member's perspective using only the evidence below. Do not invent achievements, grades, relationship details, rankings, personal circumstances, or outcomes. Use a professional, specific tone. Leave [NEEDS FACULTY DETAIL] wherever evidence is missing. Organize the letter as relationship, evidence, fit for the opportunity, and closing endorsement.\`

If the first draft is too generic, ask for a revision with:

\`Make the draft more specific by using only the concrete examples in the evidence packet. If a paragraph has no evidence, replace it with [NEEDS FACULTY DETAIL].\`

## Step 7: Faculty review before sending

The recommender should review every sentence before sending.

Check that the final letter:

- Contains only claims the recommender can personally support
- Removes unsupported praise and invented details
- Matches the opportunity and deadline
- Uses the recommender's own voice
- Does not disclose information the student did not consent to include
- Is submitted manually by the recommender

Do not auto-send recommendation letters from this workflow.

## Upgrade path: build an intake-and-draft app

Build an app only if request volume justifies it. The app should include an intake screen, a faculty review screen, a draft-generation action, an export-to-Word option, status tracking, and an audit trail showing which source fields were used.

Use [Codex](/tools) or [Cursor](/tools) with fake records such as \`Sample Student A\`. Add tests that confirm the app does not generate a draft until required evidence fields are present. Connect real data only after the privacy, storage, and access-control model is approved.`,
    related: ['student-facing-syllabus-chatbot', 'meeting-notes-action-items'],
    tags: ['agent', 'recommendation-letter', 'drafting', 'microsoft-365'],
  },
  {
    slug: 'research-paper-tracker',
    title: 'Research paper tracker',
    blurb:
      'Lightweight app for tracking papers, reading status, tags, notes, and summaries.',
    meta: '50 min · Intermediate',
    category: 'Research',
    bucket: 'research',
    description:
      'A simple research paper tracker with a clean data model. Grow it only after the reading workflow is actually useful.',
    prerequisites: [
      'A small set of papers to test with',
      'A preferred storage option such as Supabase, Airtable, Notion, or a local database',
      'A plan for how summaries will be reviewed',
    ],
    body: `## Define the reading workflow

Start with the decisions you make about each paper.

Useful statuses:

- To read
- Skimmed
- Reading
- Read
- Cited
- Parked

A tracker should help you decide what to read next and why a paper matters.

## Create the core records

Start with one \`papers\` table or collection.

Fields to include:

- Title
- Authors
- Year
- Venue
- DOI or URL
- Status
- Tags
- Summary
- Notes
- Key quotes or findings
- Follow-up questions

Keep files and PDFs separate unless you know your storage and copyright workflow.

## Build the first screens

Make three screens first:

1. Paper list with search, status, and tag filters.
2. Paper detail page with notes and summary.
3. Add or edit paper form.

Do not build recommendations or citation export until the basic reading loop works.

## Use AI carefully

AI summaries are useful for triage, but they should not replace reading. Label generated summaries, keep your own notes separate, and verify claims before citing.

A good prompt is: \`Summarize this abstract and notes for my personal reading tracker. Include methods, main claim, limitations, and why it may matter. Do not invent details not present in the text.\`

## Add useful next features

After the first tracker is being used, add saved searches, BibTeX import, duplicate detection, weekly reading queue, or connections to a research digest.`,
    related: ['personal-knowledge-base-search', 'chatbot-own-documents'],
    tags: ['research', 'papers', 'tracker', 'summaries', 'tags'],
  },
  {
    slug: 'personal-knowledge-base-search',
    title: 'Personal knowledge base search',
    blurb:
      'Searchable knowledge base for notes, links, snippets, and research materials.',
    meta: '60 min · Intermediate',
    category: 'Knowledge',
    bucket: 'research',
    description:
      'A personal knowledge base that prioritizes capture, tags, search, and retrieval before adding more complex AI features.',
    prerequisites: [
      'A small set of notes or links to import',
      'A storage option such as files, SQLite, Supabase, or another database',
      'A clear tagging habit',
    ],
    body: `## Choose what belongs inside

A personal knowledge base should start with one or two content types.

Good first choices:

- Notes
- Links
- Research snippets
- Reusable prompts
- Project decisions

Avoid importing every file you own. A smaller trusted collection is easier to search and maintain.

## Define the records

Use a \`notes\` table or folder with fields like:

- Title
- Body
- Source URL
- Tags
- Created date
- Updated date
- Collection or project

Add attachments only after the note workflow works.

## Add search

Start with keyword search over title, body, and tags. Add filters for tags and collection. If your database supports full-text search, use it before adding embeddings or vector search.

## Build the core screens

Create:

1. Notes list with search and filters.
2. Note detail page.
3. Add or edit note form.
4. Tag filter view.

## Add AI later

Once search is useful, add AI features such as summaries, suggested tags, or question answering over selected notes. Keep the source note visible so generated answers can be checked.`,
    related: ['research-paper-tracker', 'chatbot-own-documents'],
    tags: ['knowledge-base', 'search', 'notes', 'research'],
  },
  {
    slug: 'faculty-guidelines-chatbot',
    title: 'Faculty guidelines chatbot',
    blurb: 'NotebookLM assistant with cited answers from approved guidelines.',
    meta: '75 min · Beginner',
    category: 'Chatbots',
    bucket: 'faculty-support',
    description:
      'A narrow faculty-facing NotebookLM notebook for approved guidelines, committee procedures, internal FAQs, or policy summaries with citations and a clear escalation path.',
    prerequisites: [
      'Approved faculty guideline documents',
      'Access to NotebookLM through the appropriate TAMU Google account',
      'A named content owner',
      'A review plan for policy-sensitive answers',
    ],
    body: `## What you are building

A faculty-facing NotebookLM assistant that helps users find answers in approved guideline documents. The notebook should cite the source document, route policy-sensitive questions to a named owner, and avoid making HR, legal, employment, promotion, tenure, or exception decisions.

Use [NotebookLM](/tools) for this case because the work is source-grounded: faculty and staff need to ask questions across guidelines, compare sections, generate summaries, and verify answers against citations.

## Recommended first version

Start with a content-owner pilot in NotebookLM. Create one notebook, add the approved guideline sources, ask setup questions that confirm the visible source set, and test whether answers cite the right material before sharing it with a small reviewer group.

Use [TAMU AI Chat](/tools) instead when this needs to become an official institution-scoped chatbot with group-based access control, a reusable custom model, or student/staff access through TAMU AI Chat. Use [Codex](/tools) or [Cursor](/tools) only after the source set, hosting path, and data handling plan are approved.

The finished NotebookLM pilot should have:

- One notebook with only approved sources
- A source index that names the owner and review date for each document
- A saved reviewer note or launch note explaining the notebook's limits
- A test sheet with expected sources and escalation behavior
- Owner approval before broader sharing

## Step 1: Create the approved source folder

Create one source folder in SharePoint, OneDrive, Google Drive, or another reviewed location. Keep it plain, current, and easy to audit.

1. Add only current approved documents.
2. Remove drafts, informal notes, email advice, and outdated copies.
3. Rename files clearly, such as \`Faculty-Guidelines-2026-approved.pdf\`.
4. Create an index file named \`source-index.md\` or \`source-index.docx\`.
5. In the index, list each document title, owner, effective date, review date, and source URL or file name.
6. Name the person or office that owns final interpretation for each source.

If a draft must be tested, put it in a separate folder and label it as draft in both the file name and notebook instructions.

## Step 2: Prepare the documents

Before uploading anything to NotebookLM, make each document easy for the model to read.

1. Check that headings are descriptive.
2. Convert scanned PDFs to readable text before upload.
3. Save preferred versions as text-based PDFs, DOCX, or plain text.
4. Replace tables of contents that no longer match the document.
5. Note in the source index whether a file uses headings, sections, or paragraph numbers, so users can request the right citation format.

## Step 3: Create the NotebookLM notebook

Open [NotebookLM](https://notebooklm.google.com/) in the appropriate Google account.

1. Create a new notebook.
2. Name it for the audience and topic, such as \`Faculty Guidelines Q&A 2026\`.
3. Add only the approved files from the source folder.
4. Paste the source index list as a note inside the notebook for traceability.
5. Confirm every source uploaded correctly.

After uploading, ask this setup question:

\`List every source you can see by title or file name. Do not summarize yet.\`

If anything is missing or duplicated, fix the source set before continuing.

## Step 4: Set the answer rules

Paste this instruction at the top of the notebook before testing real questions:

\`Answer only from the sources in this notebook. For each answer, cite the source name and section or heading. If the sources do not answer the question, say that the sources do not answer and direct the user to [named owner or office]. Do not interpret HR, legal, promotion, tenure, exception, accommodation, or compensation decisions. Do not invent policy or deadlines.\`

Replace \`[named owner or office]\` with the real escalation contact before sharing.

## Step 5: Build the test sheet

Build a test sheet with these columns: \`question\`, \`expected source\`, \`chatbot answer\`, \`source cited\`, \`correct\`, \`notes\`.

Use at least these question groups:

- 5 routine policy questions where the answer is clearly in the source
- 5 procedural how-do-I questions
- 5 missing-information questions where the chatbot should say the source does not answer
- 5 escalation questions that should redirect to the named owner

Run the questions one at a time and record the answers. Fix the source files, the answer rules, or the prompt phrasing until the chatbot meets the bar.

## Step 6: Pilot with a small reviewer group

Share the notebook only with a few faculty or staff first. Ask them to:

- Check whether answers cite the correct section
- Flag answers that feel confident but lack a clear source
- Note any policy questions that should escalate but didn't

Address feedback before broader sharing. Keep a short launch note inside the notebook with the source set, last review date, owner, and escalation path.

## Upgrade path: move to TAMU AI Chat

Move to [TAMU AI Chat](/tools) when the chatbot needs:

- Group-based access control through Microsoft Entra
- A reusable custom model for institution-wide sharing
- A stable owner-controlled source set
- Logging or audit features beyond what NotebookLM provides

Use the [Create and share a TAMU AI chatbot](/agents/create-and-share-tamu-ai-chatbot) guide for the platform mechanics. Bring the same source files, answer rules, and test sheet from the NotebookLM pilot.`,
    related: [
      'create-and-share-tamu-ai-chatbot',
      'student-facing-syllabus-chatbot',
      'chatbot-own-documents',
    ],
    tags: ['chatbot', 'notebooklm', 'faculty', 'policy', 'citations'],
  },
  {
    slug: 'create-and-share-tamu-ai-chatbot',
    title: 'Create and share a TAMU AI chatbot',
    blurb:
      'TAMU AI Chat knowledge collection, custom model, and Microsoft Entra group.',
    meta: '75 min · Intermediate',
    category: 'Chatbots',
    bucket: 'teaching',
    description:
      "Use TAMU AI Chat's knowledge and models workspace to turn approved files and instructions into a shareable chatbot with group-based access control.",
    prerequisites: [
      'Access to TAMU AI Chat',
      'Approved files or text for the chatbot to use',
      'A short purpose statement for the chatbot',
      'Names of the people or group who should be able to use it',
    ],
    body: `## What you are building

A TAMU AI Chat chatbot that answers from a controlled knowledge collection. The first version should be narrow: one topic, one source set, one audience, and one owner who can review answers.

Use this guide when you already have approved source material and need to build inside [TAMU AI Chat](/tools) instead of coding a custom app.

## Before you choose TAMU AI Chat

If you only need quick source-grounded Q&A over your own documents, try [NotebookLM](/tools) first. For many personal, course-prep, research, or small-team workflows, NotebookLM is the easier path: create a notebook, add the files or links, and ask questions with source citations.

Choose TAMU AI Chat when you need a TAMU-controlled chatbot that appears as a reusable custom model, uses a knowledge collection, and can be shared with eligible users through Microsoft Entra groups. It is more involved than NotebookLM, but it gives you a better path for institution-scoped sharing and access control.

Use only approved source material in either tool. If the chatbot will answer policy, student, HR, legal, advising, or other sensitive questions, get the source owner to approve both the files and the instructions before sharing.

## Before you start

Prepare the source files before opening the builder.

1. Use approved, current files only.
2. Remove drafts, comments, tracked changes, and outdated copies.
3. Give files clear names that include the topic and date when helpful.
4. Keep each uploaded file within the platform's 25 MB file-size limit.
5. Use text-based PDFs, DOCX files, TXT files, or pasted text. Scanned PDFs and screenshots may not work because OCR is not currently supported.
6. Write down the chatbot owner and the audience that should receive access.

TAMU AI Chat sharing is for eligible users inside the same institution's TAMUS AI Chat environment. Students can use a shared chatbot when they have access to that environment and are included in the correct group, but this is not a public chatbot link.

## Step 1: Create a knowledge collection

1. Open [TAMU AI Chat](/tools).
2. From the left navigation, select **Workspace**.
3. Select **Knowledge** from the top menu.
4. Select the **+** icon in the top-right corner.
5. Enter a short name and a clear description for the knowledge collection.
6. Select **Create Knowledge**.
7. Open the collection and use the **+** icon to upload files, upload a directory, sync a directory, or add text content.
8. Confirm the uploaded files are within the file-size limit and represent the intended source set.

Use one knowledge collection per coherent chatbot. A syllabus chatbot, faculty-guidelines chatbot, and lab-procedures chatbot should usually be separate collections.

Be careful with **Sync directory**. The TAMUS docs warn that syncing a directory resets the knowledge base and overwrites previously added files.

## Step 2: Create the custom model

1. In TAMU AI Chat, go to **Workspace**.
2. Select **Models** from the top menu.
3. Select **+ New Model**.
4. Enter the model name users should see in the model list.
5. Select the base model from the available large language models.
6. Add a description that explains the chatbot's purpose and intended audience.
7. Edit the system prompt so the chatbot knows its boundaries.
8. Attach the knowledge collection from Step 1 under **Knowledge & Files**.
9. Select **Save & Create**.

A practical first system prompt is:

\`You answer only from the attached knowledge collection. Cite the source document or section when possible. If the knowledge collection does not answer, say that it does not answer and direct the user to [named owner or office]. Do not invent policy, deadlines, exceptions, approvals, or personal advice. Keep answers clear, concise, and grounded in the provided sources.\`

Replace \`[named owner or office]\` before saving.

A custom model does not train a new model on your documents. It packages the selected base model, system prompt, settings, and attached knowledge so users get consistent behavior.

## Step 3: Test before sharing

Test the chatbot while access is still limited.

Ask at least three types of questions:

- Easy lookup questions where the answer is clearly in the source files
- Missing-information questions where the chatbot should say the source does not answer
- Sensitive or exception questions where the chatbot should redirect to the owner

If the chatbot gives confident answers without a source, cites the wrong file, or makes decisions it should not make, revise the source files or system prompt before sharing.

## Step 4: Create the Microsoft Entra group

TAMU AI Chat sharing uses Microsoft Entra security groups. The current TAMUS docs say all sharing except individual chats requires a group, and groups only support sharing within your institution.

1. Open the TAMUS AI Chat Groups & Sharing guide.
2. Use the institution table to identify the correct chat endpoint.
3. In the group-name form, enter part of your custom chatbot name.
4. Select the correct chat endpoint for your affiliation.
5. Generate the complete group name and copy it.
6. Open the Microsoft Entra admin group creation link.
7. Set **Group type** to **Security**.
8. Paste the generated group name into **Group name**.
9. Add an optional description for future reference.
10. Set **Membership type** to **Assigned**.
11. Add yourself as an owner so you can manage membership.
12. Add yourself and the first test users as members.
13. Create the group.

For a pilot, start with a small reviewer group. Add broader access only after the owner has reviewed test answers.

## Step 5: Refresh group access

After creating the group, sign out of TAMU AI Chat and sign back in before trying to select the group. Signing out helps the new group become available immediately; otherwise it may take up to 24 hours. Group details can still take several minutes to sync.

If the group does not appear after about five minutes, refresh the browser and try again.

## Step 6: Connect the group to the chatbot

Attach the group to both the model and the knowledge collection. Users need access to the visible chatbot and the underlying knowledge.

1. In TAMU AI Chat, go to **Workspace**, then **Models**.
2. Open the custom model you created.
3. In **Access Control**, go to **Groups**.
4. Select the Microsoft Entra group you created.
5. Leave the permission at **READ** for normal users. Use **WRITE** only for people who should be able to edit or delete the shared item.
6. Save the model.
7. Go to **Workspace**, then **Knowledge**.
8. Open the knowledge collection used by the chatbot.
9. In **Access Control**, go to **Groups**.
10. Select the same Microsoft Entra group.
11. Leave the permission at **READ** for normal users.
12. Save the knowledge collection.

If users can see the model but answers fail or appear disconnected from the documents, check that the group was added to the knowledge collection as well as the model.

## Step 7: Verify access

1. Log out of TAMU AI Chat and log back in.
2. Open the model dropdown near the top-left of the chat screen.
3. Search or scroll for the custom chatbot and select it.
4. Ask one known test question and confirm the chatbot uses the intended source collection.
5. Ask a test user in the Entra group to repeat the same check.
6. Use **Keep in Sidebar** if the model should stay visible for regular use.

If a user still cannot see the model after a hard logout, verify their email and group membership, then check that the group has **READ** access to both the model and the knowledge collection.

Keep a short launch note with the chatbot name, owner, source collection, intended audience, review date, and feedback path.

## When to build a custom app instead

Stay in NotebookLM when the need is fast source-grounded Q&A for yourself or a small working group. Stay in TAMU AI Chat when the need is a trusted, institution-scoped, group-shared chatbot over approved documents.

Move toward a custom app only when you need a custom interface, structured feedback button, analytics, workflow handoffs, public access, complex permissions, or source-management features that NotebookLM and TAMU AI Chat do not provide.`,
    related: [
      'faculty-guidelines-chatbot',
      'student-facing-syllabus-chatbot',
      'rag-app-uploaded-pdfs',
    ],
    tags: ['tamu-ai-chat', 'chatbot', 'knowledge', 'access-control'],
  },
  {
    slug: 'rag-app-uploaded-pdfs',
    title: 'Simple RAG app over uploaded PDFs',
    blurb:
      'Retrieval-augmented app that lets users upload PDFs, index them, and ask questions.',
    meta: '75 min · Intermediate',
    category: 'Knowledge',
    bucket: 'research',
    description:
      'A simple PDF-based RAG app: upload handling, text extraction, chunking, source metadata, retrieval, and answer review.',
    prerequisites: [
      'Comfort building a web app',
      'A storage location for PDFs and extracted text',
      'A model and embedding provider selected for the prototype',
    ],
    body: `## Keep the first version narrow

Start with user-uploaded PDFs in one workspace or project. Limit file size, file count, and supported document types until the pipeline is stable.

Do not use restricted or copyrighted materials unless you have permission and a reviewed storage plan.

If this is an internal TAMU document chatbot, consider a TAMU AI Chat pilot first. If you are building a shared or production app, do not use the TAMU AI Chat API as the app backend; choose an approved cloud AI platform, hosting plan, access-control model, and logging/retention plan.

## Build the pipeline

A simple RAG pipeline has six steps:

1. Upload the PDF.
2. Store the original file if allowed.
3. Extract text from the PDF.
4. Split the text into chunks.
5. Store chunks with document title, page, and source metadata.
6. Retrieve relevant chunks when the user asks a question.

## Generate grounded answers

Prompt the model to answer only from retrieved chunks and cite the source document or page metadata. If the retrieved chunks do not answer the question, the model should say that.

## Add review and debugging

Show the retrieved chunks near the answer during development. This makes it easier to see whether a bad answer came from poor retrieval, missing text extraction, or model overreach.

## Test failure cases

Test scanned PDFs, tables, footnotes, empty pages, missing answers, and contradictory documents. Decide which cases version 1 will support before opening it to more users.`,
    related: [
      'chatbot-own-documents',
      'create-and-share-tamu-ai-chatbot',
      'personal-knowledge-base-search',
    ],
    tags: ['rag', 'pdf', 'uploads', 'retrieval', 'ai-app'],
  },
  {
    slug: 'student-facing-syllabus-chatbot',
    title: 'Student-facing syllabus chatbot',
    blurb:
      'Student Q&A in TAMU AI Chat from instructor-approved source material.',
    meta: '90 min · Intermediate',
    category: 'Teaching',
    bucket: 'teaching',
    description:
      'A TAMU AI Chat syllabus chatbot. Answers from the approved syllabus, gives citations, and sends judgment calls back to the instructor.',
    prerequisites: [
      'An approved syllabus',
      'Instructor permission',
      'Access to TAMU AI Chat chatbot-building and sharing features',
      'A test question list',
      'A plan for reviewing student-facing answers before release',
    ],
    body: `## What you are building

A narrow student-facing chatbot in TAMU AI Chat that answers questions from one approved syllabus. It should help students find course expectations faster, cite the syllabus section it used, and send judgment calls back to the instructor.

Use [TAMU AI Chat](/tools) for this case because it is the university-supported environment for eligible students and employees, supports knowledge-backed custom models, and provides a clearer path for controlled sharing than a personal notebook.

Use [Codex](/tools) or [Cursor](/tools) later only if the course needs a reviewed custom app with a stable interface, feedback workflow, or features beyond TAMU AI Chat.

## Recommended first version

Build the first version as a TAMU AI Chat custom model attached to a syllabus knowledge collection. Keep the pilot limited to the instructor and a small reviewer group until the answers pass the test sheet.

Use the [Create and share a TAMU AI chatbot](/agents/create-and-share-tamu-ai-chatbot) guide for the platform mechanics: knowledge collection, custom model, Microsoft Entra group, model access control, and knowledge access control. This guide focuses on the syllabus file, student-facing prompt, test set, and release decision.

The finished pilot should have:

- One clean syllabus source file
- One saved instruction prompt
- A test sheet with expected answers
- Instructor approval before any student-facing release
- A clear note that the syllabus and instructor remain authoritative

## Step 1: Prepare the syllabus file

Create a clean \`.docx\`, \`.pdf\`, or \`.txt\` version of the approved syllabus before opening TAMU AI Chat.

1. Start from the current approved syllabus, not an old course shell or draft.
2. Remove comments, hidden notes, and tracked changes.
3. Preserve headings for grading, attendance, late work, AI use, office hours, materials, schedule, and accommodations.
4. Check that tables, dates, point totals, grade weights, and percentages survived the conversion.
5. Add a version line at the top: \`Course code, semester, instructor, syllabus date, last reviewed date\`.
6. Save the file with a clear name such as \`MGMT-000-Fall-2026-approved-syllabus.pdf\`.

Use [Microsoft Copilot](/tools) in Word only for preparation tasks such as cleaning wording, finding policy sections, or drafting a student FAQ. Do not let Copilot change policy language unless the instructor reviews the change.

## Step 2: Build the TAMU AI chatbot

Follow [Create and share a TAMU AI chatbot](/agents/create-and-share-tamu-ai-chatbot) through the knowledge collection and custom model steps.

For the knowledge collection, upload only the approved syllabus file. If students will also ask about Canvas modules, assignment sheets, lab rules, or weekly schedules, add only instructor-approved source material and test those sources before release.

For the custom model, use the starting prompt below as the system prompt and attach the syllabus knowledge collection.

## Step 3: Add the starting prompt

Use this instruction as the custom model system prompt before testing student questions:

\`You are a syllabus assistant for this course. Answer only from the attached syllabus knowledge collection. Cite the heading or section used. If the syllabus does not answer, say that the syllabus does not say and tell the student to contact the instructor. Do not approve exceptions, predict grades, interpret accommodations, change course policy, or answer from outside knowledge. Format every answer as Short answer, Source section, and Contact the instructor if needed.\`

Then ask one setup question:

\`List the syllabus sections you can see. Do not summarize yet.\`

Review the section list. If important sections are missing or garbled, fix the syllabus file before continuing.

## Step 4: Run the student test set

Create a test sheet with columns for \`question\`, \`expected source\`, \`chatbot answer\`, \`source cited\`, \`correct\`, and \`notes\`. Ask each question one at a time and copy the answer into the sheet.

Use at least these test groups:

- 5 easy lookup questions such as office hours, materials, exam dates, or instructor contact
- 5 schedule or deadline questions such as due dates, makeups, and course calendar items
- 5 grading questions such as grade weights, late work, extra credit, and participation
- 5 redirect questions that should send the student to the instructor

Good redirect tests include:

- Can you calculate my final grade?
- Can you approve an extension?
- Can you make an exception for my absence?
- Can you tell me whether my accommodation applies?
- What should I do if the syllabus and Canvas disagree?

## Step 5: Fix the source or prompt

If an answer is wrong, first decide whether the problem is the syllabus, the prompt, or the model behavior.

- If the answer cites the wrong section, make the syllabus headings clearer.
- If the answer invents missing policy, strengthen the prompt with \`If the syllabus does not say, say so\`.
- If the answer gives exceptions, add the exact exception type to the do-not-do list.
- If students will ask about Canvas, assignments, or email, add only instructor-approved source material before testing again.

Run the full test set again after each meaningful change.

## Step 6: Decide whether students can use it

Do not share the chatbot until the instructor has reviewed the prompt and test answers.

A student-facing version is ready only when it:

- Cites the correct syllabus heading for normal questions
- Says \`the syllabus does not say\` when the answer is missing
- Redirects exceptions, accommodations, grade disputes, and sensitive situations
- Does not invent dates, grade weights, attendance rules, or policy exceptions
- Includes clear wording that the syllabus and instructor remain authoritative

After approval, use the sharing steps in [Create and share a TAMU AI chatbot](/agents/create-and-share-tamu-ai-chatbot) to create the Microsoft Entra group, attach it to both the custom model and the knowledge collection, and verify access with a test student or reviewer.

## Upgrade path: build a controlled app

If the course needs a stable link, consistent interface, or feedback button beyond TAMU AI Chat, use the [Chatbot over your documents](/agents/chatbot-own-documents) or [RAG app](/agents/rag-app-uploaded-pdfs) guide. Build first with a sample syllabus in Codex or Cursor. Connect the real syllabus only after the hosting, access, logging, and review path are approved.

For feedback, use Microsoft Forms or the app's own form to collect \`wrong answer\`, \`missing policy\`, and \`unclear wording\` reports. If the course uses Microsoft 365, route those reports with [Power Automate](/tools) to the instructor or course team.`,
    related: [
      'create-and-share-tamu-ai-chatbot',
      'faculty-guidelines-chatbot',
      'rag-app-uploaded-pdfs',
    ],
    tags: ['agent', 'syllabus', 'students', 'chatbot', 'teaching'],
  },
];

export function tutorialBySlug(slug: string): Tutorial | undefined {
  return TUTORIALS.find((t) => t.slug === slug);
}

export function relatedTutorials(slug: string): Tutorial[] {
  const t = tutorialBySlug(slug);
  if (!t || !t.related) return [];
  return t.related
    .map((s) => tutorialBySlug(s))
    .filter((x): x is Tutorial => Boolean(x));
}
