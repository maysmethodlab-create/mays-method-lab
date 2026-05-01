---
name: hari-promotion-tenure-letter
description: Draft Shrihari (Hari) Sridhar's external evaluation letters for promotion and tenure cases. Use when the user mentions writing a P&T letter, an external review letter, an external evaluator letter, a tenure letter, an associate professor promotion letter, a full professor promotion letter, a promotion-to-full letter, an outside reviewer assessment, or refers to a candidate's portfolio for promotion review. Triggers on candidate names accompanied by phrases like "promotion letter", "tenure letter", "external review", "external evaluator", "outside review", or "P&T case". Enforces Hari's exact letter architecture (opening, independence statement, quantity paragraph, quality framing, three-to-four numbered differentiators, service and leadership paragraph, closing recommendation, sign-off block), embeds his admin and research writing rules inline (no em dashes, no banned words, no AI cheerleader tone, "Sincerely," sign-off, full title block), and runs a multi-agent workflow with hallucination check and writing-skill check before output.
---

# Hari's Promotion and Tenure Letter Skill

## Purpose

Draft an external evaluation letter for a promotion and tenure case in Shrihari (Hari) Sridhar's voice. The letter follows the architecture of every P&T letter Hari has written since 2017, integrates the rules from his administrative and research writing-style skills, and passes through hallucination and writing-skill checks before the user sees it.

The skill is built for both ranks Hari most often evaluates: promotion to Associate Professor with tenure, and promotion to Full Professor. The architecture is the same; the emphasis differs (post-tenure momentum, leadership, and recognition take more weight in full-prof letters).

## Invocation

The user says something like:
- "Write the full professor letter for [Name] from [School]."
- "I have a P&T letter to write for [Name]."
- "Draft my external review letter for [Name]'s tenure case."

The candidate's materials usually live in a folder named for the candidate (e.g., `Tenure Letters/Sri Venkataraman/`). The folder typically contains:
- The instruction or invitation letter from the requesting school (PDF or DOCX)
- The school's promotion guidelines or "key performance dimensions" (PDF or DOCX)
- The candidate's CV
- The candidate's research/teaching/service statement
- A folder of selected publications (PDFs)
- Sometimes: teaching evaluations, position responsibility statement, dossier summary

Materials may be OneDrive online-only files. If the shell sandbox cannot read them ("Invalid argument" error), ask the user to upload the specific files into the chat.

---

## Multi-Agent Workflow

This skill runs five distinct passes. Use the Agent / Task tool when a pass benefits from independent judgment (especially passes 4 and 5).

### Pass 1: Read Candidate Materials
Read every accessible document in the candidate's folder. Extract:
- **Identity**: full name, preferred first name (check the CV for nicknames or transliterations the candidate uses), pronouns (infer carefully from CV or statement)
- **Position sought**: tenured Associate, tenured Full, untenured (rare for Hari). The invitation letter or KPI document usually says.
- **Recipient**: who Hari is writing to. The invitation letter has the recipient's name, title, school, and address.
- **Publication record**: total count, top-tier (UT-Dallas / Premier-AMA-3) count, post-tenure count if a full case, current pipeline (under review, R&R), conferences, grants
- **Substantive domain**: the candidate's research focus in two or three concrete nouns (e.g., "online advertising and user-generated content," "B2B referrals and inter-organizational relationships," "marketing budget allocation and brand portfolio strategy")
- **Three to four anchor papers**: pick the papers Hari can most credibly describe. Prefer ones from journals Hari has edited or reviewed for, ones with substantively interesting questions, ones that exemplify the candidate's signature method
- **Awards, editorial roles, SIG roles**: from the CV
- **Teaching and service**: scan the statement and CV; note awards, directorships, mentoring
- **The school's specific criteria**: from the KPI or guidelines document. Quote-worthy phrases ("sustained record of high-quality scholarship," "evidence of national or international reputation") become the recommendation paragraph hook.

### Pass 2: Read Past P&T Letters (Pattern Anchoring)
If the user has not already provided exemplars, identify the closest match by rank and field:
- **Tenure case (Associate)**: closest match is Shijie Lu, Kristopher Keller, Wei Zhang, Zhi Lu, Xin Wang (2019)
- **Full professor case**: closest match is Mahima Hada (Full), Xin Wang (2022), Kim Whitler, Vishal Narayan
- **Quant/methods-heavy candidate**: lean on Shijie Lu, Xin Wang
- **B2B/strategy candidate**: lean on Mahima Hada, Kim Whitler

Re-read at least one exemplar before drafting to lock the rhythm.

### Pass 3: Draft the Letter
Follow the architecture in the next section. Draft straight through, in Hari's voice, applying the writing-style rules embedded in this skill.

### Pass 4: Hallucination Check (separate agent recommended)
Spawn a verification agent (Task tool) with this prompt template:

> Read this draft P&T letter. For every factual claim about the candidate (paper titles, journal names, years, methods, data sources, awards, editorial appointments, grant amounts, mentoring roles, teaching awards), verify it against the candidate's CV and statement at [paths]. Flag any claim that cannot be traced to source material. Flag any paper described in a way that misrepresents what the paper actually does. Flag any award or appointment that does not appear in the CV. Report a punch list of specific edits. Under 400 words.

Apply every flagged correction before proceeding.

### Pass 5: Writing-Skill Check (separate agent recommended)
Spawn a second verification agent with this prompt template:

> Audit this draft letter against the writing-style rules embedded in `hari-promotion-tenure-letter/SKILL.md`. Specifically check: (1) zero em dashes, (2) no banned words (delve, leverage, transformative, robust [non-technical], pivotal, ensure, underscore, testament, tapestry, comprehensive, multifaceted, cutting-edge, world-class, paradigm-shifting, journey, exciting, thrilled, excited), (3) sign-off is exactly "Sincerely," followed by the correct title block for Hari's current role, (4) opening paragraph follows the canonical "Thank you for your recent request asking for my evaluation..." form, (5) acquaintance paragraph asserts independence, (6) three-to-four numbered differentiators with specific paper anchors, (7) quantity paragraph names specific journals, (8) closing line includes the contact email and "Should you require further information," construction. Report a punch list under 250 words.

Apply every flagged correction before output.

---

## Letter Architecture (Mandatory)

Every letter has these blocks in this order. Brackets show what varies.

### Block 1: Letterhead
- **Office of the Dean** (current default since Hari became Senior Associate Dean) OR **Department of Marketing** (used in older letters)
- The letter is generated as a Word file that drops onto Mays letterhead. Do not add the letterhead text in the body; the .docx template handles it.

### Block 2: Date and Recipient
```
[Month Day, Year]

[Recipient's Name]
[Title]
[Department]
[School]
[University]
[Address, optional]
```

### Block 3: Salutation
- "Dear Professor [Last Name]," when the recipient holds a faculty title
- "Dear Dean [Last Name]," when the recipient is a dean
- "Dear Ms./Mr./Dr. [Last Name]," when the recipient is an administrator (e.g., a Director of Faculty Administration)
- Use the salutation that matches the recipient's signature on the invitation letter

### Block 4: Opening Paragraph (Thank You + Headline Judgment)

Two acceptable forms.

**Form A (default for tenure cases and most full cases):**
> Thank you for your recent request asking for my evaluation of Dr. [Full Name]'s research and publications as part of [his/her/their] evaluation for promotion to [Associate Professor / Full Professor / the rank of Professor] in the Department of [Marketing / X] at the [School Name], [University]. [I am very impressed by Dr. [Last Name]'s body of work / Dr. [Last Name] has a very good body of work]. I think [he/she/they] [has/have] a [terrific / wonderful / very strong / excellent] research record, and the future should be even brighter. Thus, I am happy to have the opportunity to write in support of [first name]'s scholarship.

**Form B (use when the case is unambiguously strong and the recipient is a senior leader; mirrors the Mahima Hada full-professor letter):**
> Thank you for inviting me to provide an assessment of Dr. [Full Name]'s scholarly contributions in connection with [his/her/their] case for promotion to the rank of Full Professor. It is an honor to evaluate a scholar whose work I have followed with great interest for [many years / since [his/her] tenure case]. As [Hari's relevant credential, e.g., a former Editor-in-Chief of the Journal of Marketing and a researcher in marketing strategy and B2B markets], I have read and cited Dr. [Last Name]'s articles, and several dozen reviews of [hers/his]. Our interactions have been entirely professional; we have not co-authored any papers nor worked at the same institution. Accordingly, I can offer an independent and well-informed assessment of the quality, significance and impact of [his/her] research.

Form B folds the independence statement into the opening. Form A keeps it separate (Block 5).

### Block 5: Acquaintance and Independence Paragraph (only if Form A used)

> I am acquainted with [first name] but do not know [him/her/them] well. Our paths have crossed [a few times / multiple times] at professional meetings. I am [aware of / familiar with] [his/her] published research and expertise in [substantive domain in one phrase], and I know some of [his/her] co-authors. I believe that [first name]'s research record is excellent in terms of both quality and quantity of research.

If the candidate's domain is something Hari has personally published in, add a sentence later: "Having published in the area of [X], I can assess this topic well."

### Block 6: Quantity / Productivity Paragraph

Open with: "In terms of [research productivity / quantity of research], [first name] has already published [N] papers..."

Name the specific top journals. The canonical list Hari uses:
- *Journal of Marketing*
- *Journal of Consumer Research*
- *Journal of Marketing Research*
- *Marketing Science*
- *Management Science*

If the candidate has published in others (JAMS, IJRM, JCP, ISR), name them too. Always italicize journal names.

Add the pipeline sentence: "Moreover, [first name] has several works in progress, including papers beyond the first round of review at [Journal X], and [Journal Y]."

Add the conference cadence sentence: "Notwithstanding this already impressive body of work, [first name] has a few working papers, presents [his/her] work regularly at top business schools around the world, and shares [his/her] research regularly at our major conferences."

Close with the standard slam-dunk line, varied by case strength:
- Strong tenure case: "...his research profile would make a compelling case for promotion and tenure at peer institutions."
- Strong full case: "...this research record should be a 'slam dunk' case for full professor at peer marketing departments."
- Very strong full case (Mahima Hada level): "Importantly for this review, [N] of these A-level publications have appeared post-tenure, demonstrating momentum rather than tapering off."

### Block 7: Quality Framing Paragraph

Open with the rhetorical question: "What about the quality of [first name]'s work?"

Then state the core: "I am pleased to say that [first name]'s work demonstrates great care and focus in establishing and 'owning' a domain. Through [his/her] body of published work and works in progress, it is clear that [first name] is an expert in [domain phrase], and has become one by not just leveraging well-known techniques but using [his/her] skills in [method or theoretical lens] to build new tools that address this evolving area's needs."

Then signal that specifics will follow: "After perusing through [his/her] published work and resume, it is clear that [first name]'s research in the domains is also of high quality. Since this can often seem like a subjective assessment, I will elaborate."

If Hari is a published expert in the candidate's area, add: "Having published in the area of [X], I can assess this topic well."

### Block 8: Numbered Differentiators (Three to Four)

Open with: "There appear to be [three / four] clear differentiators in [first name]'s contribution to the body of knowledge in [domain phrase]."

**Each differentiator is one paragraph (or at most two). Each follows this micro-pattern:**
1. **Headline claim** (e.g., "First, it is clear that [first name] has a penchant for substantively interesting problems and simple yet rigorous explanations.")
2. **Anchor paper**: name the paper (in italicized journal title), state the question
3. **What it does**: data sources, method, key finding stated in ordinary language
4. **Why it is impressive**: identification cleverness, methodological boldness, substantive boundary-pushing
5. **Optional personal touch**: "I had not read this paper prior to receiving a request to write this letter for [first name] and I found myself quite engaged..."

**The default differentiator slate (use what fits, in this order):**

1. **Owning a substantive domain** — pioneering or programmatic contributions in the candidate's home area. Anchor with the candidate's most cited or most field-defining paper.
2. **Substantively interesting problems and clever identification** — anchor with a paper whose research question is striking and whose causal identification is creative (instrumental variables, natural experiments, quasi-experimental design, behavioral experiments in B2B).
3. **Methodological breadth and interdisciplinary work** — anchor with a paper that blends marketing with computer science, statistics, economics, or psychology. Use Hari's standard line: "You will be hard pressed to find a professor who has achieved the rare feat of publishing in [list]. We will agree that interdisciplinary work is difficult to publish as it faces a 'heterogeneous reviewer' hurdle."
4. **Field recognition and trajectory** (full-prof letters especially) — best paper awards, grants, mentorship gravity, field's adoption of the candidate's frameworks. Use Hari's standard close: "Thus what I see is i) [he/she] maintains a consistent 'brand' of [X], and ii) [he/she] feels the need to tackle [Y] and iii) [he/she] will continue to thrive into the future."

**Tenure cases**: usually three differentiators.
**Full cases**: usually four; the fourth is recognition and trajectory.

### Block 9: Recognition, Editorial Service, and Leadership (full-prof letters; abbreviated for tenure)

For a **full professor** case, this is a substantive paragraph that names:
- Best paper awards (with year and award name)
- Grant funding (with rough amount or sponsor)
- Editorial roles (Associate Editor, Developmental Editor, Editorial Review Board memberships, by journal)
- AMA SIG or division leadership
- Invited talks, PhD course teaching at peer schools, dissertation external committee work

For a **tenure case**, fold this into a shorter paragraph that mentions one or two awards and the candidate's current ERB memberships.

If Hari has personally invited the candidate to an editorial role at *Journal of Marketing*, include the standard line: "Given the quality of [his/her] work as an ad-hoc reviewer, I have also invited [him/her] to serve as an Editorial Board Member of *Journal of Marketing*."

### Block 10: Service, Mentorship, and Teaching

Default opening when Hari has no direct knowledge: "Since I have no direct knowledge of [first name]'s teaching or service, I will restrict my primary evaluation to [his/her] body of research."

Then immediately add the corroboration line: "Having met [first name] a couple of times and seen [him/her] articulate [his/her] work, I am not at all surprised by [his/her] teaching awards, nor the fact that [he/she] is serving as [editorial role]."

For a **full case**, this paragraph is longer and includes:
- Program directorships (e.g., "Director of Marketing Analytics Programs (2015-2025)")
- Curriculum development work
- PhD dissertations chaired or co-chaired
- Mentorship of junior faculty
- International committee work
- A closing sentence framing this as "the service leadership and mentorship expected of a full professor"

If the candidate has a notable practitioner background (e.g., Kim Whitler's CMO experience), name it explicitly and tie it to teaching impact.

### Block 11: Closing Recommendation Paragraph

Standard structure:
1. **Sum-up framing**: "In sum, [first name] is [a star researcher / an outstanding scholar / an excellent scholar], a service-oriented professional, and [an emerging leader / a leader] in [his/her] field."
2. **Tie to the school's criteria** (full-prof letters): "The [School] guidelines for promotion to full professor emphasize [paraphrase the criteria, e.g., a sustained record of high-quality scholarship, evidence of national or international reputation, and leadership in service]. In my judgment, Dr. [Last Name] meets, and in several respects exceeds, these criteria."
3. **Strong recommendation line**:
   - **Tenure**: "He has my strongest recommendation."
   - **Full (default)**: "[He/She] has my strongest recommendation for promotion to Full Professor."
   - **Full (Mahima Hada level)**: "For these reasons, I strongly and unequivocally recommend Dr. [Full Name] for promotion to the rank of Full Professor."
4. **Forward-looking close** (full cases): "I am confident that [he/she] will continue to advance the field of [domain] and enhance [School]'s stature in research, teaching and service."

### Block 12: Contact Line and Sign-off

Contact line:
> Should you require further information, please do not hesitate to contact me at ssridhar@mays.tamu.edu.

(Mahima Hada variant: "Please feel free to contact me at ssridhar@mays.tamu.edu if you require any further information.")

Sign-off:
```
Sincerely,



Shrihari (Hari) Sridhar, Ph.D.
Senior Associate Dean, Mays Business School, Texas A&M University
Professor of Marketing and Joe Foster '56 Chair in Business Leadership
Presidential Impact Fellow
Former Editor-in-Chief, Journal of Marketing
Email: ssridhar@mays.tamu.edu
```

**Title block conventions** (current state, April 2026):
- Hari completed his EIC term at *Journal of Marketing*; the title block now reads **Former Editor-in-Chief, Journal of Marketing**
- The Joe Foster Chair is rendered with a leading apostrophe: **Joe Foster '56 Chair in Business Leadership**. Do not write "Joe B. Foster '56" (that older form appears in 2022 letters but Hari has shortened it).
- Always include **Senior Associate Dean** on the first line
- Always include **Presidential Impact Fellow**
- Three blank lines between "Sincerely," and the typed name leave space for the signature

---

## Embedded Writing-Style Rules

These rules are non-negotiable in every P&T letter. They are extracted from `hari-admin-writing-style` and `hari-research-writing-style` and customized for the P&T context.

### A. Banned words and phrases (zero tolerance)
Never use: **delve, leverage, transformative, utilize, comprehensive, robust** (when not a technical statistics term), **pivotal, ensure, underscore, testament, tapestry, multifaceted, cutting-edge, world-class, best-in-class, paradigm-shifting, game-changer, synergy, journey** (for academic work), **exciting, thrilled, excited, amazing, incredible**.

Never use AI cheerleader openers: "I'm thrilled to...", "I am excited to...", "It is my distinct pleasure to..." — Hari's openers begin "Thank you for your recent request..." or "Thank you for inviting me...".

Never use ornamental transitions: **Moreover, Furthermore, Additionally, In addition, It is worth noting that, Importantly, Notably** as sentence starters. (One **Notably** per letter is acceptable when introducing a publication count or award; more than one is too many.)

Never use these filler constructions: "I hope this letter finds you well," "It goes without saying," "Needless to say," "At the end of the day," "In today's fast-paced world," "Not only... but also."

### B. No em dashes. Ever.
Never use **—** (em dash) or **–** (en dash) in prose. Use commas, parentheses, colons, or split into two sentences. Older Hari letters do contain em dashes (artifacts of Word autocorrect); the current style explicitly prohibits them. If converting from an older exemplar, replace every em dash before output.

### C. Smart quotes
Use curly quotes for substantive concepts the candidate has popularized: "owning" a domain, "slam dunk", "heterogeneous reviewer" hurdle, "brand" of understudied problems. Word handles this automatically; do not write straight quotes in source.

### D. First person
Use **I** throughout. "I am very impressed," "I believe," "I have read and cited," "I recommend." Do not write "the writer believes" or "in this evaluator's opinion." Hari's evaluation has authority because it is named.

### E. No hedging
"I strongly recommend" not "I would recommend." "She has demonstrated" not "she may have demonstrated." "This research is impressive" not "this research could be considered impressive." Hedging in a recommendation letter reads as half-hearted endorsement.

### F. Active voice with concrete characters
The candidate **is the character** in most sentences. The candidate **publishes**, **investigates**, **builds**, **estimates**, **chairs**, **serves**. Avoid "the work was published," "the framework was developed."

### G. Italicize journal names
*Journal of Marketing*, *Journal of Marketing Research*, *Journal of Consumer Research*, *Marketing Science*, *Management Science*, *Journal of the Academy of Marketing Science*, *International Journal of Research in Marketing*, *Journal of Retailing*, *Journal of Consumer Psychology*, *Information Systems Research*, *Journal of International Business Studies*, *Strategic Management Journal*. Always italicize on first reference; the .docx generator handles the formatting.

### H. Paper titles in quotes (smart quotes)
"Horizontal Referrals in B2B Markets," "When and How Board Members with Marketing Experience Facilitate Firm Growth," "Two Steps: A Primer on B2B Experiments."

### I. Names and credentials
- Hari's full name on sign-off: **Shrihari (Hari) Sridhar, Ph.D.**
- Reference the candidate by **Dr. [Last Name]** in formal contexts and by **first name** when the prose flows naturally
- Use the candidate's **preferred first name** if it differs from the CV first name (e.g., "Xin (Shane) Wang" → use "Shane" in body)
- Texas A&M University on first reference; Texas A&M thereafter; never **TAMU** in prose
- Mays Business School on first reference; Mays thereafter

### J. Numbers
- Spell out one through nine; figures for 10 and above
- Always use figures for paper counts ("six articles in premier journals") because the count carries weight
- Use the inverted apostrophe for class years: **Joe Foster '56 Chair**

### K. Voice tests before output
Read every paragraph and ask:
1. Does it sound like a senior scholar talking to a peer at a conference?
2. Is there any sentence that reads as performative ("I am thrilled to recommend...")?
3. Is the candidate doing the verb in every sentence where they could be?
4. Is there a colon that should be a period? A semicolon that should be a period? A long compound sentence that should be split?
5. Does the paragraph end strongly?

---

## Output Format

**File type**: Microsoft Word (.docx) on the Mays letterhead template.

**Letterhead template**: `Tenure Letters/Mays Letterhead.docx` (already in the workspace folder). Open it with python-docx, append the letter content, and save as a new file.

**File name**: `[Candidate Full Name] Letter Hari Sridhar [M_D_YYYY].docx`
Example: `Sri Venkataraman Letter Hari Sridhar 4_25_2026.docx`

**Save location**: the candidate's folder inside `Tenure Letters/`. Example: `Tenure Letters/Sri Venkataraman/Sri Venkataraman Letter Hari Sridhar 4_25_2026.docx`.

**Formatting specifics**:
- Font: Calibri, 11 pt, black
- Margins: 1 inch all sides (the letterhead template enforces this)
- Line spacing: single (1.0)
- Spacing after paragraphs: 8 pt or 6 pt
- No bold body text
- Paper titles in smart quotes; journal names italicized
- No bulleted or numbered lists in the body — the differentiators use inline "First," "Second," "Third," "Fourth," not a numbered list
- Page numbers centered at bottom
- Three blank lines between "Sincerely," and the typed name

**Length target**: 3 to 4 pages (single-spaced, Calibri 11). Tenure letters lean shorter (3 pages); full-prof letters lean longer (3.5 to 4 pages).

---

## Example Calibration Letters

The following five letters are the calibration set. Re-read at least one before drafting:

| Letter | Year | Rank | Candidate domain | Use as anchor for |
|---|---|---|---|---|
| Mahima Hada (Full) | 2025 | Full | B2B referrals, multi-method | Strong full case; section subheaders style; explicit independence; school-criteria tie-in |
| Kim Whitler | 2024 | Full | Upper echelons; CMO research | Full case where teaching/practitioner is highlighted |
| Xin (Shane) Wang | 2022 | Full | ML / online reviews | Full case in quant; four-differentiator structure |
| Shijie Lu | 2022 | Tenure | Online advertising; UGC | Tenure case in quant; three-differentiator structure |
| Kristopher Keller | 2025 | Tenure | Marketing strategy / analytics | Tenure case with subheader-free flowing prose |

---

## Self-Check Before Output

Run this checklist on every draft. Any "no" answer means revise before output.

1. Is the opening paragraph an exact match (or near-exact) to one of the two canonical forms?
2. Is the recipient block correctly populated from the invitation letter?
3. Is the sign-off exactly "Sincerely," with the current title block?
4. Are there any em dashes in the body? (Find and remove.)
5. Are there any banned words (delve, leverage, transformative, robust [non-technical], comprehensive, etc.)?
6. Are there three or four numbered differentiators, each with a specific paper anchor?
7. Does each differentiator name the journal in italics, the question, the data, the method, and the finding?
8. Does the quantity paragraph name specific journal titles?
9. Is the recommendation phrased with the right strength for the case (strongest for slam-dunks, strong-and-positive for solid cases)?
10. Does the contact line use "Should you require further information"?
11. Is the candidate the grammatical subject of most sentences in the differentiator paragraphs?
12. Are there any sentences over 35 words that should be split?
13. Are journal names italicized? Paper titles in smart quotes?
14. Is the candidate's preferred first name used in body prose?
15. Is the file saved to the candidate's folder with the correct date in the filename?
16. Has the hallucination check (Pass 4) been run?
17. Has the writing-skill check (Pass 5) been run?

---

## Failure Modes to Avoid

1. **Composite-paper hallucination**: blending two of the candidate's papers into one description that misrepresents both. Hallucination check Pass 4 catches this.
2. **Wrong journal attribution**: claiming a paper is in *Journal of Marketing* when it is in *Journal of Marketing Research*. Always cross-check against the CV.
3. **Stale title block**: using "Editor-in-Chief, Journal of Marketing" when Hari is now **Former** EIC. The current sign-off block above is canonical.
4. **AI cheerleader leak**: the phrase "It is my distinct pleasure" is the single most common AI-leak in P&T letters. Use the canonical opening only.
5. **Em dash creep**: copy-pasting from the candidate's research statement can import em dashes. Strip them before output.
6. **Generic praise without anchor**: "Her work is groundbreaking and impactful" is empty. Every claim ties to a specific paper, award, or appointment.
7. **Wrong rank close**: a tenure recommendation accidentally written for full prof, or vice versa. The closing line must match the rank in the invitation letter.
8. **Pronoun drift**: using "he" mid-letter when the candidate is "she." Verify pronouns from the candidate's statement, photo (if available in the CV), or invitation letter.
