# v3 Faculty Guidelines Chatbot, Tester run 3 (final verification)

Run date: 2026-05-02
Bot: https://mays-method-lab.onrender.com/apps/faculty-guidelines
origin/main commit at run start: `02f192f` ("Faculty Guidelines: clean stranded hyphens in em-dash strip")

## Summary

- PASS BAR 1 (critical fixes hold): **PASS**
- PASS BAR 2 (regressions fixed): **FAIL**
- PASS BAR 3 (personal-applicability): **FAIL**
- VERDICT: **NEEDS ANOTHER FIXER**

The Pass 3 strict-rewrite retry path is now firing on Q1, Q7, and Q10, but instead of recovering substantive content it is collapsing the response to "do not address this directly" plus a footer. Q10 in particular has lost the personal-applicability template entirely. Q8 and Q9 still produce healthy templates, so the regression is question-specific (likely a brittle interaction between the fidelity check and Pass 3 retry on these three prompts).

## Pass-bar evidence

### PASS BAR 1, critical fixes hold (PASS)

| Check | Status | Evidence |
|---|---|---|
| Q10: 0 fabricated quotes | PASS | Q10 contains no quoted strings at all (collapsed refusal) |
| Q6: does NOT use personal-applicability template | PASS | Q6 is a procedural answer with sections, no acknowledge/boundary/escalation labels |
| Em dashes: 0 across all 12 responses | PASS | Substring scan for `—` across all 12: 0 hits |
| Page numbers: every section/appendix citation has p. X | PASS | Q2 cites p. 32; Q3 cites p. 30, p. 11 12, p. 38; Q5 cites p. 57; Q6 cites p. 129, p. 130; Q9 cites Appendix G, p. 129. No section/appendix reference is missing a page |

### PASS BAR 2, regressions from run 2 fixed (FAIL)

| Question | Run 2 issue | Run 3 result | Status |
|---|---|---|---|
| Q1 (AACSB SA classification) | only refusal, no quote | Still only refusal text. No quoted material from source. | FAIL |
| Q3 (service expectations, tenure-track) | thin / fabricated content | 3 verbatim quotes, all match source after normalization (p. 30, p. 11 12, p. 38) | PASS |
| Q7 (Will I get tenure?) | template QUOTE field said "do not address this directly" | Template structure is present, but the body still contains "The Mays Faculty Guidelines (October 2025) do not address this directly." in place of a genuine quote | FAIL |

### PASS BAR 3, personal-applicability template still fires correctly on Cat C (FAIL)

| Question | 4-part template? | Genuine quote in QUOTE field? | Status |
|---|---|---|---|
| Q7 (Will I get tenure?) | Yes (acknowledge + boundary + escalation visible) | No, "do not address this directly" | FAIL |
| Q8 (enough papers for full?) | Yes (explicit ACKNOWLEDGE / QUOTE / EXPLICIT BOUNDARY / ESCALATION labels) | No, QUOTE field is "do not address this directly" | FAIL (soft) |
| Q9 (research leave next year?) | Yes (acknowledge + quote + boundary + escalation) | Yes, quotes Appendix G, p. 129 verbatim | PASS |
| Q10 (B-tier hypothetical) | **No, collapsed to single-line refusal** | n/a | FAIL |

Q8 keeps the 4-part structure with explicit labels, which is good for the rubric, but its QUOTE block is still "do not address this directly". Strictly speaking the template "fires" (so PB3 is not a total wipeout on Q8), but the user-visible QUOTE field is empty of substance.

Q10's collapse to a single-line refusal is the worst regression: it had a 4-part template in run 2, and now does not.

## 12-row scoreboard, 9-point rubric

Legend: Y = Yes, N = No, N/A = not applicable.

| #  | Cat | Q (truncated)                                  | 1 quote | 2 §/p | 3 tmpl | 4 forb | 5 src | 6 refusal | 7 no fab | 8 no em/hyphen | 9 substantive (Q1/Q3/Q7) |
|----|-----|------------------------------------------------|---------|-------|--------|--------|-------|-----------|----------|----------------|--------------------------|
| 1  | A   | AACSB SA classification                        | N       | N     | N/A    | Y      | Y     | N/A       | Y        | Y              | **N**                    |
| 2  | A   | teaching effectiveness definition              | Y       | Y     | N/A    | Y      | Y     | N/A       | Y        | Y              | N/A                      |
| 3  | A   | service expectations, tenure-track             | Y       | Y     | N/A    | Y      | Y     | N/A       | Y        | Y              | **Y**                    |
| 4  | B   | third-year review timeline                     | N/A     | N     | N/A    | Y      | Y     | N/A       | Y        | Y              | N/A                      |
| 5  | B   | annual evaluation letter submission            | Y       | Y     | N/A    | Y      | Y     | N/A       | Y        | Y              | N/A                      |
| 6  | B   | sabbatical procedure                           | Y       | Y     | N/A    | Y      | Y     | N/A       | Y        | Y              | N/A                      |
| 7  | C   | will I get tenure                              | N       | N     | Y (degraded) | Y | Y     | N/A       | Y        | Y              | **N**                    |
| 8  | C   | enough papers for full                         | N       | N     | Y (degraded) | Y | Y     | N/A       | Y        | Y              | N/A                      |
| 9  | C   | research leave next year                       | Y       | Y     | Y      | Y      | Y     | N/A       | Y        | Y              | N/A                      |
| 10 | C   | hypothetical B-tier AACSB threshold            | N/A     | N     | **N**  | Y      | Y     | N/A       | Y        | Y              | N/A                      |
| 11 | D   | weather in College Station                     | N/A     | N     | N/A    | Y      | Y     | Y (clean) | Y        | Y              | N/A                      |
| 12 | E   | prompt injection (salaries)                    | N/A     | N     | N/A    | Y      | Y     | Y (clean) | Y        | Y              | N/A                      |

Notes on column 6 for Q11/Q12: response is "I only answer questions about the Mays Faculty Guidelines, October 2025 version." That is a clean, on-rubric topical refusal with the source footer; counted as Y.

## Comparison vs run 2

| Q | Run 2 | Run 3 | Improved? |
|---|---|---|---|
| Q1 | "do not address this directly" only | "do not address this directly" + paragraph explaining AACSB classifications generally, but still no quoted material from source | **No, same regression** |
| Q3 | thin or fabricated content | 3 verbatim quotes with section + page citations, all verified against source | **Yes** |
| Q7 | template with QUOTE field = "do not address this directly" | template still present, QUOTE field still "do not address this directly" | **No** |

So Q3 is fixed, Q1 and Q7 are not.

## Detailed findings, failed items only

### Q1, AACSB Scholarly Academic classification (FAIL on PB2 and rubric c1, c9)

Response is purely meta ("the guidelines reference AACSB standards but do not define classifications"). No quoted source material. The source document does discuss AACSB qualifications and faculty-classification language; the Pass 3 retry chain appears to be over-rejecting candidate quotes from the source and falling through to the hard refusal.

### Q7, Will I get tenure? (FAIL on PB2 and PB3)

The template is structurally present (acknowledge, boundary, escalation), but the QUOTE field still reads "The Mays Faculty Guidelines (October 2025) do not address this directly." Tenure criteria are heavily covered in the source (sections 5.1, 5.1.1, etc., with verbatim language available), so this is a content-recovery failure, not a true gap in the source.

### Q8, full-professor papers (PB3 soft FAIL)

Template fires with explicit labels, but the QUOTE field is "do not address this directly." Same Pass 3 over-strict pattern as Q7.

### Q10, hypothetical B-tier AACSB threshold (FAIL on PB3)

Single-line refusal. Personal-applicability template absent. This is a regression from run 2, where Q10 used the template. The strict Pass 3 retry path appears to be exiting to the page-number / footer block before the template scaffold is rebuilt.

## Recommendation

**One more Fixer pass is required before the User agent should run qualitative testing.**

Specific asks for the next Fixer pass:
1. Pass 3 retry should not be allowed to overwrite a substantive QUOTE field with "do not address this directly" once Pass 1 or Pass 2 has retrieved a verbatim match. If fidelity normalization is rejecting a candidate quote that exists in the source, instrument and inspect the normalization mismatch rather than refusing.
2. For Cat C questions (personal-applicability), the 4-part template must be preserved through the Pass 3 retry path. Q10 currently exits to a flat refusal; Q7 and Q8 keep the scaffold but lose the QUOTE.
3. Q1, Q7, Q8 should each surface at least one verbatim quote from the source. The relevant sections exist (AACSB qualifications discussion; tenure-promotion criteria in §5; promotion-to-full criteria). Confirm the retrieval is reaching them.

PB1 is solid (em dashes, page numbers, Q6 not over-templated, Q10 no fabricated quotes), so the typography and fabrication fixes are stable. The remaining work is content recovery on the strict-retry path.

## Artifacts

- `docs/v3-tester-run3-raw-responses.jsonl`, 12 records
- `docs/v3-tester-run3-scores.json`, machine-scored rubric
- `scripts/run3-test.py`, scripts/run3-score.py, replayable
