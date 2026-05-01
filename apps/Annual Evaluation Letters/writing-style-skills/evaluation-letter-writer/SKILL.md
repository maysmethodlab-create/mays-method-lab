---
name: evaluation-letter-writer
description: "Write annual faculty performance evaluation letters for Shrihari (Hari) Sridhar, Senior Associate Dean at Mays Business School, Texas A&M University. Use this skill whenever the user asks to write evaluation letters, annual reviews, performance evaluations, faculty assessment letters, or mentions writing letters for direct reports. This skill produces publication-ready .docx files with the official Texas A&M letterhead, matching Hari's warm-but-substantive writing voice and the exact memorandum format used in prior years. ALWAYS use this skill when writing evaluation letters, even for a single person."
---

# Faculty Annual Evaluation Letter Writer

This skill produces annual performance evaluation letters as Word documents (.docx) for Hari Sridhar's direct reports at Mays Business School. Each letter is a formal memorandum with the Texas A&M University header, written in Hari's authentic voice, and formatted to match last year's letters exactly.

## How This Skill Works

The letter-writing process uses three sequential sub-agents (or phases if sub-agents are unavailable). Each phase has a distinct job, and the output of one feeds the next. This separation matters because it prevents the common failure mode where AI tries to research AND write AND verify all at once, producing shallow, generic letters.

**Phase 1 — Research Agent**: Reads the faculty member's self-evaluation, CV, and any other submitted materials. Produces a structured research brief with every factual claim, number, accomplishment, and goal extracted verbatim from the source documents.

**Phase 2 — Synthesis & Writing Agent**: Takes the research brief and writes the letter in Hari's voice, following the exact structure and style guide. Produces the .docx file with proper formatting and the A&M letterhead.

**Phase 3 — Hallucination Check Agent**: Reads the finished letter alongside the original source documents and flags anything that cannot be traced back to the sources. Also checks for AI-sounding language patterns.

The user will typically provide a person's name or say "write all the letters." For each person, look in the `Materials Submitted/[First Last]/` subfolder of the current year's evaluation folder to find their documents.

---

## Phase 1: Research Agent

Read `references/research-agent-instructions.md` for the full prompt to use when spawning (or executing) this phase.

**Input**: The faculty member's subfolder containing their self-evaluation and CV.

**Output**: A structured research brief saved as `[Name] - Research Brief.md` in the working directory. This brief contains:
- Full name and current title/role
- Category of role (faculty researcher, department head, associate dean, clinical/instructional, administrative)
- Every specific accomplishment with exact numbers, names, and details
- Any areas where goals were not met (in their own words)
- Their stated goals for the upcoming year
- Notable patterns or themes across their materials

The research agent must NEVER invent, infer, or embellish. If a number or fact is not explicitly stated in the source documents, it does not go in the brief.

---

## Phase 2: Synthesis & Writing Agent

Read `references/writing-style-guide.md` for the detailed voice and style specifications.
Read `references/letter-structure.md` for the exact section-by-section template.

**Input**: The research brief from Phase 1.

**Output**: A complete .docx evaluation letter saved to the `Letters/` folder, named as: `[Full Name] Evaluation Letter Shrihari Sridhar ([M] [D] [YYYY]).docx`

Run the script `scripts/create_letter.py` to generate the formatted .docx. Pass the letter content as structured JSON. See the script's docstring for the exact input format.

### Critical Writing Rules

These rules exist because AI-generated text has telltale patterns that undermine the letter's credibility and Hari's voice:

1. **No em-dashes (—) or en-dashes (–).** Use commas, semicolons, colons, or restructure the sentence instead. This is the single most common AI tell. Check every sentence.

2. **No "delve," "leverage," "foster," "spearhead," "pivotal," "navigate," "holistic," "synergy," "paradigm," or "ecosystem"** unless Hari used that exact word in his previous letters. The word "navigate" IS in Hari's vocabulary (he used it naturally). The others are not.

3. **No stiff parallel constructions.** AI loves to write "From X to Y, from A to B" or "Whether it's X or Y, your..." patterns. Hari does not write this way. His sentences flow naturally.

4. **No empty superlatives without substance.** Every praise statement must be tied to a specific accomplishment. "Your leadership has been exceptional" is hollow. "Your leadership in expanding the Flex Online portfolio has been nothing short of transformative" is Hari's style because it names the specific thing.

5. **Vary sentence length and structure.** Hari mixes short punchy sentences ("This was a landmark year.") with longer, flowing ones. If three sentences in a row have similar length or start with "Your," rewrite.

6. **Use warm, human connective tissue.** Hari writes things like "What stands out in our conversations is..." and "I see in your leadership a thoughtful, values-driven approach..." These are personal observations, not corporate performance review language.

7. **The "looking forward" section should include bullet points** listing the specific goals discussed for the upcoming year. Frame these with a brief introductory sentence, then present 3-5 bullet points of concrete goals. Follow the bullets with a short closing thought about the goals.

8. **Include an inspirational or reflective quote** in the Summary section when it feels natural. Hari likes to close with a quote that captures the spirit of the person's contributions. This should feel organic, not forced. If no quote fits naturally, skip it.

---

## Phase 3: Hallucination Check Agent

Read `references/hallucination-check-instructions.md` for the full verification protocol.

**Input**: The finished letter (.docx content or text) AND the original source documents (self-evaluation + CV).

**Output**: A verification report listing:
- Every factual claim in the letter and whether it can be traced to a source document (with page/section reference)
- Any claims that appear fabricated or embellished
- Any AI-language patterns that slipped through (em-dashes, corporate jargon, stiff parallelism)
- A pass/fail determination

If the check fails, the Writing Agent must revise the letter to fix all flagged issues before delivering the final version to the user.

---

## Formatting Specification (Quick Reference)

Full details are in `scripts/create_letter.py`, but here is the summary:

- **Page**: US Letter (8.5" x 11"), 1" margins all around
- **Header**: Texas A&M University logo (first page only), from `assets/tamu_header.jpg`
- **Font**: 11pt throughout (use Calibri or the document's default)
- **Section headings**: Bold, 11pt, same font as body
- **Body text**: 11pt, single-spaced within paragraphs, blank line between paragraphs
- **Footer**: Page number on pages 2+ only
- **Signature block**: A horizontal line made of underscores, then "Signature" and "Date" on the same line, separated by spaces

---

## Running the Skill

### For a single person:
```
1. Identify the person's subfolder in Materials Submitted/
2. Run Phase 1 (Research) on their documents
3. Run Phase 2 (Writing) using the research brief
4. Run Phase 3 (Hallucination Check) comparing letter to sources
5. If check passes, deliver the .docx. If not, revise and re-check.
```

### For all people:
```
1. List all subfolders in Materials Submitted/
2. For each person, run all three phases sequentially
3. Save all letters to the Letters/ folder
4. Provide a summary of all letters written
```

When using sub-agents, Phase 1 for multiple people can run in parallel. Phase 2 depends on Phase 1's output. Phase 3 depends on Phase 2's output. So the optimal parallelization is: run all Phase 1s concurrently, then all Phase 2s, then all Phase 3s.

---

## Phase 4: Accompanying Email

After all letters are written and verified, write a personalized email for each person. These emails accompany the PDF attachment and should be warm, gracious, and personal. They are CC'd to the Dean.

### Email Structure

1. **Opening**: Thank them for meeting with you, for the care they put into their self-evaluation, and for the wonderful conversation you shared. Make this feel personal to the individual.

2. **Letter reference**: Tell them you have written a letter that captures your discussion and their goals for the coming year.

3. **Specific highlights**: Pull 2-3 specific accomplishments from their letter (with numbers and program names) so they can see you truly noticed their work. Frame these as your reflections, not a list.

4. **Personal closing**: A warm, gracious sentence or two about what it means to work with them. This should be calibrated to the person: excitement about the future for newer team members, deep appreciation for veterans, gratitude for distinctive qualities. The reader should feel genuinely moved.

5. **Administrative close**: "I am copying Dean Sharp. Jess will send the formal letter for your signature and personnel file."

6. **Sign-off**: "Warm regards, Hari" (or "With deep gratitude, Hari" for departing colleagues).

### Email Rules

- Same writing rules as the letters: no em-dashes, no en-dashes, no AI vocabulary, no "excellent" or other rating language.
- Approximately 100-150 words in the body (enough to be substantive and warm, not so long it feels like a second letter).
- Each email must feel distinct. Do not reuse the same sentence patterns across people.
- The tone should make the recipient feel genuinely valued, not evaluated. This is a colleague writing to a colleague, not a boss filing paperwork.
- Save all emails to a single file: `Emails for Evaluation Letters.md` in the Letters/ folder.

### Example Email (for reference, do not copy verbatim)

**Subject:** Your 2025 Performance Evaluation
**CC:** Dean Sharp

[Name],

Thank you for taking the time to meet with me, for the care you put into your self-evaluation, and for the wonderful conversation we had. I always walk away from our discussions feeling [personal observation].

I have written a letter that captures our discussion and your goals for the coming year. You will see in it my reflections on [2-3 specific highlights with numbers and names]. What I [admire/value] most is [personal observation about their distinctive quality].

It is a [genuine pleasure/privilege/joy] to work with you, [Name]. [Personal, warm closing thought about the partnership or the future].

I am copying Dean Sharp. Jess will send the formal letter for your signature and personnel file.

Warm regards,
Hari
