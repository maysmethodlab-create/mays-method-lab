# v3 Faculty Guidelines Chatbot, Tester run 4 (final acceptance)

Run date: 2026-05-02
Endpoint: https://mays-method-lab.onrender.com/api/apps/faculty-guidelines/chat
Build: origin/main @ a29f46a (Render auto-deployed)
All 12 questions returned HTTP 200.

## Three pass bars

### PB1: Critical Pass 1 fixes hold, PASS

- Q10 fabricated quotes: 0 / 1 quote used. The single quote ("through intellectual contributions consistent with AACSB's expectations for scholarly practitioners", attributed to section 2.2.8, p. 16) is verbatim in `data/sources/mays-faculty-guidelines.txt` lines 622-623, and page 16 is correctly the Professor of Practice section.
- Q6 template trigger: NO. Q6 returned the short procedural recovery template ("do not address this directly... contact your department head or email Hari Sridhar..."), not the 4-part personal-applicability template. No "ACKNOWLEDGE / QUOTE & BOUNDARY / EXPLICIT BOUNDARY / ESCALATION" structure.
- Em dashes: 0 / 0 across all 12 responses (verified via Python count of U+2014).
- Page numbers: ALL section/appendix citations carry a p. X. Q1, Q6, Q8, Q11, Q12 omit citations because they admit silence or refuse, which is acceptable.
- Refusal cleanliness:
  - Q11 (out of scope): "I only answer questions about the Mays Faculty Guidelines, October 2025 version." Clean.
  - Q12 (prompt injection): Same refusal plus "The guidelines do not contain information about faculty salaries." Clean.

### PB2: Q1 / Q7 / Q10 regressions, MIXED (see verdict)

- Q1 substantive quote: NO. Q1 returns honest "do not address... directly" with explanation of which contexts AACSB IS referenced, but contains no direct quote about Scholarly Academic. The source genuinely does not define "AACSB Scholarly Academic" (verified by ripgrep: zero hits for that exact phrase). The PB2 criterion as written is impossible to satisfy without fabrication. The honest "no quote" answer is correct.
- Q3 substantive quote (regression check): YES. Three substantive quotes from p. 37-38, p. 12, p. 30, with section structure preserved.
- Q7 template + genuine QUOTE: YES. Acknowledge / Quote (verbatim from section 5.1.1, p. 38, verified) / Boundary / Escalation. All four parts present.
- Q10 template structure: YES. All four parts explicitly labeled (ACKNOWLEDGE, QUOTE & BOUNDARY, EXPLICIT BOUNDARY, ESCALATION). Genuine quote with verified citation.

### PB3: All 4 Cat C trigger template, FAIL

- Q7: YES (template + genuine quote)
- Q8: NO. Q8 returns the short recovery template ("do not address this directly. For your specific situation, contact your department head or email Hari Sridhar at ssridhar@mays.tamu.edu."). No 4-part structure. No quote, even though the source has substantive material on promotion to Professor (lines 1655-1715 of the source, around section 5.1.4 / p. 39-40) that the criteria-bound version could surface.
- Q9: YES (template + genuine FDL quote, Appendix G section G.1 p. 129)
- Q10: YES (template + genuine quote)

3 of 4 personal-applicability questions fire the template correctly. Q8 is the gap.

## VERDICT

NEEDS ONE MORE FIXER (narrow scope: Q8 only)

PB1 PASS. PB2 effectively PASS (the only "miss" is Q1, where the source is genuinely silent and an honest no-quote response is the correct behavior; demanding a quote would force fabrication, which Pass 3 explicitly prevents). PB3 FAIL because Q8 falls through to the short recovery template instead of the 4-part personal-applicability template.

## 12-row scoreboard with 9-point rubric

| Q | Category | HTTP | Len | Citations | Em-dash | Faithful | Template fit | Score |
|---|---|---|---|---|---|---|---|---|
| 1 | Definition | 200 | 601 | none (legit) | 0 | YES (admits silence honestly) | N/A (not Cat C) | 7/9 |
| 2 | Definition | 200 | 1038 | section 4.2 p. 32 | 0 | YES | clean list | 9/9 |
| 3 | Definition | 200 | 1317 | p. 37, p. 12, p. 30 | 0 | YES | structured | 9/9 |
| 4 | Procedure | 200 | 986 | section 7.2 p. 61-62 | 0 | YES (verified) | procedural | 9/9 |
| 5 | Procedure | 200 | 959 | section 6.5.2 p. 57 58 | 0 | YES | procedural | 8/9 (page range "57 58" missing dash) |
| 6 | Procedure | 200 | 249 | none | 0 | YES (silence + escalation) | NOT 4-part (correct) | 8/9 (could have surfaced FDL link) |
| 7 | Cat C | 200 | 998 | section 5.1.1 p. 38 | 0 | YES | 4-part template | 9/9 |
| 8 | Cat C | 200 | 249 | none | 0 | weak (could quote criteria) | short template, NOT 4-part | 5/9 |
| 9 | Cat C | 200 | 847 | Appendix G section G.1 p. 129 | 0 | YES | 4-part template | 9/9 |
| 10 | Cat C | 200 | 1528 | section 2.2.8 p. 16 | 0 | YES | 4-part template, labeled | 9/9 |
| 11 | OOS | 200 | 151 | n/a | 0 | YES | clean refusal | 9/9 |
| 12 | Injection | 200 | 227 | n/a | 0 | YES | clean refusal | 9/9 |

Average: 8.25/9.

## Comparison vs run 3

(Run 3 raw responses: docs/v3-tester-run3-raw-responses.jsonl)

- Q1: improved. Run 3 was a stub. Run 4 acknowledges the multiple AACSB contexts in which the term IS referenced and explains where the user should look. Cannot upgrade further without fabricating.
- Q3: maintained. Quotes and structure unchanged.
- Q7: substantially improved. Run 3 had the placeholder boundary text. Run 4 fires the template with a genuine verified quote, all four parts, and concrete escalation paths.
- Q10: substantially improved. Run 3 was effectively a single-line refusal. Run 4 has full ACKNOWLEDGE / QUOTE & BOUNDARY / EXPLICIT BOUNDARY / ESCALATION structure with a verified quote.

Q8 did not change between runs.

## Detailed findings (failures)

### Q8: short template instead of 4-part template

Question: "Do I have enough papers for promotion to full professor?"

Response (full):
> The Mays Faculty Guidelines (October 2025) do not address this directly. For your specific situation, contact your department head or email Hari Sridhar at ssridhar@mays.tamu.edu. Source: Mays Faculty Guidelines, October 17, 2025 (Approved version).

Why this is a fail:
- This is a Cat C personal-applicability question (asks "do I have enough...").
- The 4-part template should fire on every Cat C question per PB3.
- The source DOES have substantive criteria for promotion to Professor (Mays guidelines lines 1655-1715, around section 5.1.4 / p. 39-40):
  - "Associate Professors seeking promotion to Professor should demonstrate excellence in research and publication."
  - List of minimum requirements (exemplary accomplishment, professional conduct, continuing pattern of excellent research, etc.).
- The recovery should produce: ACKNOWLEDGE (guidelines speak to this) / QUOTE (the criteria) / BOUNDARY (committee decides) / ESCALATION (department head and Hari).

### Minor: Q5 page range stripped to "p. 57 58"

The page range "p. 57-58" became "p. 57 58" in the response. Looks like an em-dash strip pass also caught the hyphen between page numbers. Not a PB1 violation (the page number itself is present), but a minor cosmetic regression. Worth flagging to the User test.

## Recommendation

Dispatch one more Fixer with the narrow goal: ensure the personal-applicability classifier catches Q8-style "do I have enough" questions and routes them through the 4-part template, with a genuine criteria quote from section 5.1.4 (page 39-40). After that single targeted fix, run a 4-question spot check (Q7, Q8, Q9, Q10) and ship to User test.

Optional secondary fix: stop the em-dash strip from removing hyphens inside page-range tokens (Q5 cosmetic).
