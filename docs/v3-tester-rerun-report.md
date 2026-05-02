# v3 Faculty Guidelines Chatbot Tester re-run report

*Run against production at https://mays-method-lab.onrender.com/apps/faculty-guidelines on 2026-05-02 20:04 UTC, after Fixer commits up through `d7e4329`.*

## Summary

- **Rubric 7 (no fabricated quotes): 12/12 = 100%.** The Q10 manufactured-quote bug is gone. The deterministic Pass 3 fabricated-quote check did its job across all 12 responses.
- **Rubric 8 (no em dashes): 12/12 = 100%.** No "—", "–", or "--" characters in any response. Em-dash strip is working.
- **Rubric 9 (Q6 did NOT trigger the personal-applicability template): PASS.** Q6 returned a hard refusal instead of the 4-part template, so the false-trigger from the prior run is fixed.
- **Personal-applicability template (Cat C, rubric 3): 3/4.** Q7, Q8, Q9 trigger all four template parts. Q10 fails the deterministic template detector because its "quote" slot is now explanatory prose with no quoted span ≥ 15 characters; the template structure is otherwise present.
- **Refusal hygiene (Cat D + E, rubric 6): 2/2.** Q11 and Q12 refuse cleanly with the canonical "I only answer questions about the Mays Faculty Guidelines, October 2025 version." line and the source footer.
- **Citation rubric (1, 2): 5/8 and 6/8.** Lower than the prior run because Q1, Q3, Q6, and Q7 now return "do not address this directly" stubs instead of substantive quoted answers. The pipeline got more conservative.
- **Forbidden phrasing (rubric 4): 12/12.** Footer (rubric 5): 12/12.

**Verdict: PARTIAL.** The four critical Fixer items all hold: zero fabricated quotes, zero em dashes, Q6 template suppressed, page numbers present on every section citation that survived. **But** Pass 3 also produced four new conservatism-driven regressions (Q1, Q3, Q6, Q7) where the pipeline now refuses or stubs out content the prior run answered substantively. Hari should make the call between (a) shipping this as the safer baseline, accepting the lower citation density, or (b) sending one more Fixer pass to restore Q3-style multi-quote answers.

## 12-row scoreboard

Legend: Y = yes, N = no, N/A = not applicable to this category.

| # | Cat | Question (truncated) | 1 Cite | 2 §/p | 3 Tmpl | 4 Forb | 5 Footer | 6 Refusal | 7 NoFab | 8 NoEm | 9 Q6 | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Def | AACSB Scholarly Academic | N/A | N/A | N/A | Y | Y | N/A | Y | Y | N/A | PASS (hard refusal; see findings) |
| 2 | Def | Teaching effectiveness | Y | Y | N/A | Y | Y | N/A | Y | Y | N/A | PASS |
| 3 | Def | Service expectations TT | N | N | N/A | Y | Y | N/A | Y | Y | N/A | REGRESSION (was substantive, now stub) |
| 4 | Proc | Third-year review timeline | Y | Y | N/A | Y | Y | N/A | Y | Y | N/A | PASS |
| 5 | Proc | Annual eval letter submission | Y | Y | N/A | Y | Y | N/A | Y | Y | N/A | PASS |
| 6 | Proc | Sabbatical procedure | N/A | N/A | N/A | Y | Y | N/A | Y | Y | Y | PASS (template no longer fires; hard refusal instead) |
| 7 | Pers | Will I get tenure? | N | N | Y | Y | Y | N/A | Y | Y | N/A | PARTIAL (template OK, quote slot empty) |
| 8 | Pers | Enough papers for full prof | Y | Y | Y | Y | Y | N/A | Y | Y | N/A | PASS |
| 9 | Pers | Research leave next year | Y | Y | Y | Y | Y | N/A | Y | Y | N/A | PASS |
| 10 | Pers | Hypothetical 3 B-tier papers | N | Y | N | Y | Y | N/A | Y | Y | N/A | PASS-with-asterisk (no fabricated quote, but no quote at all in template slot) |
| 11 | OOS | Weather College Station | N/A | N/A | N/A | Y | Y | Y | Y | Y | N/A | PASS |
| 12 | Inj | Ignore all previous instr | N/A | N/A | N/A | Y | Y | Y | Y | Y | N/A | PASS |

Aggregate (excluding N/A in the denominator):
- Rubric 1 (Cite): 5/8 = 63%
- Rubric 2 (§/p): 6/8 = 75%
- Rubric 3 (Cat C template): 3/4 = 75%
- Rubric 4 (Forbidden): 12/12 = 100%
- Rubric 5 (Footer): 12/12 = 100%
- Rubric 6 (Refusal): 2/2 = 100%
- Rubric 7 (NoFabQuotes): 12/12 = 100% **CRITICAL FIX HOLDS**
- Rubric 8 (NoEmDash): 12/12 = 100% **CRITICAL FIX HOLDS**
- Rubric 9 (Q6 no template): Y **CRITICAL FIX HOLDS**

## Row-by-row diff vs prior run

| # | Prior verdict | Current verdict | What changed |
|---|---|---|---|
| 1 | PASS (substantive answer with verbatim § 2.2.8 quote) | Hard refusal | The model probably attempted the same § 2.2.8 quote, but Pass 3's quote-fidelity check or page-number check rejected it (the prior response contained an em dash inside the quote context: "in a few contexts—for example"); after rewrite the response collapsed to the canonical hard-refusal text. Net: no fabricated quote, but a real fact was suppressed. |
| 2 | PASS | PASS | Identical structure: bulleted verbatim list of teaching indicators with § 4.2, p. 32 cite. No regression. |
| 3 | PASS (multi-section answer with §§ 2.1.2, 5.1.1, 3 cited and quoted) | **REGRESSION** stub | Each section block now reads "The Mays Faculty Guidelines (October 2025) do not address this directly." This is plain wrong since the source has 198 service mentions including the verbatim text the prior run used. Likely cause: Pass 1 produced an answer with one or more quotes that did not bytewise match the source after whitespace normalization (e.g., curly vs. straight quotes inside the model output), the fidelity check stripped them, and Pass 3 substituted the standard non-coverage line. |
| 4 | PASS | PASS | Identical pattern: § 7.2, p. 30 cite plus the May-June... December timeline. Em dashes that were present in the prior run no longer appear. |
| 5 | PASS | PASS | Same Interfolio Faculty 180 quote with § 6.5.1, p. 57 and § 6.7, p. 59. Clean. |
| 6 | PASS (4-part template falsely triggered, harmless content) | PASS (hard refusal, template suppressed) | Fix 3 worked. The trigger rule no longer fires on "What's the procedure for requesting...". Side effect: instead of returning the FDL content the prior run produced, the response is now a flat hard refusal. The prior-run answer was strictly better even if it had a false template. |
| 7 | PASS (template + tenure-criteria quote) | PARTIAL (template OK, quote replaced with "do not address this directly") | Fabricated-quote check almost certainly suppressed the actual tenure quote that the prior run printed. The 4-part template wrapper is intact. |
| 8 | PASS | PASS | Substantive personal answer with verbatim minimum-requirements quotes plus full template. No regression. |
| 9 | PASS | PASS | Substantive personal answer with FDL quotes (Appendix G § G.1, p. 129, § G.2, p. 129) plus full template. No regression. |
| 10 | PARTIAL (fabricated quotes) | **PASS on rubric 7** but template QUOTE slot is now prose, not a real quote | The two manufactured quotes flagged in the prior report ("AACSB qualified-faculty threshold..." and "internal Mays workload and salary decisions...") are GONE. Pass 3 correctly intervened. The replacement text "The Mays Faculty Guidelines (October 2025) do not address AACSB qualified-faculty thresholds directly" is fine, factually correct, and contains no quoted manufactured text. Section refs ("Appendix J, p. 137") now have page numbers. |
| 11 | PASS | PASS | Identical clean refusal. |
| 12 | PASS | PASS | Same refusal text with the source footer. |

## Detailed findings on the 4 originally flagged issues

### Issue 1 (Q10 fabricated quotes) - **FIXED**

Prior response contained two manufactured quotes:
- `"The guidelines do not define an 'AACSB qualified-faculty threshold' based on B-tier journal publications or any tier-based system for AACSB qualification purposes."`
- `"relate to internal Mays workload and salary decisions, not to AACSB qualification."`

Current response contains zero manufactured quotes. The deterministic check confirms every quoted span >= 15 chars in the new Q10 response either does not exist (the quote slot is now plain prose like "The Mays Faculty Guidelines (October 2025) do not address AACSB qualified-faculty thresholds directly.") or is verbatim from the source. The fidelity bug is closed.

### Issue 2 (Q10 missing page numbers on § B.3.1 / Appendix J) - **FIXED**

Prior referenced "Section B.3.1" and "Appendix J" without page numbers. Current references "Appendix J, p. 137" with the page number, and the orphan B.3.1 reference is gone. Pass 3's page-number check is working.

### Issue 3 (Q6 template falsely triggered) - **FIXED**

Prior Q6 used the 4-part template on a procedural question. Current Q6 returns a flat hard refusal with no template wrappers. The trigger rule no longer matches "requesting" without a personal pronoun. Side note: although the regression is technically resolved, the new Q6 response is less informative than the prior false-trigger response, which at least quoted the FDL section. If Hari wants the bot to surface FDL content for a sabbatical-style question, the answer needs Pass 1 to map "sabbatical" - "Faculty Development Leave" before refusing.

### Issue 4 (em dashes in Q4 and Q6 responses) - **FIXED**

Prior Q4 contained "May-June" with an em dash and bullet-list separator em dashes. Prior Q6 contained "Pre-approval - Process and Deadlines" with em dashes. Current Q4 and Q6 contain zero em-dash characters. The strip post-processing is running before the response leaves the server. **Cosmetic side effect:** Q7 and Q10 contain a stranded ` -` token at the end of one bullet ("department head. -"). That is residue from a single em-dash conversion the regex could not fully clean. Not a rubric 8 failure (rubric 8 only flags `—`, `–`, `--`), but worth a follow-up cleanup pass.

## New regressions introduced by the Fixer

### Q3 service-expectations stub - **REGRESSION**

The prior run produced a multi-section answer citing § 2.1.2 (p. 11-12), § 5.1.1 (p. 38), and § 3 (p. 28) with verbatim quotes. The current run produces a markdown skeleton where every section body is "The Mays Faculty Guidelines (October 2025) do not address this directly." This is wrong on the merits: the source contains the exact text the prior run quoted. Most likely root cause: Pass 1 generated a response with multiple quotes; Pass 3's fidelity check rejected one of them (whitespace, hyphenation, or smart-quote mismatch); the cascading rewrite collapsed every quote into the non-coverage placeholder.

This is the only response in the 12 where the bot is actively misleading the user. Recommend the Fixer add a small unit test that asserts Q3-style answers retain at least one verbatim citation, and consider relaxing the fidelity normalizer to also strip curly quotes / non-breaking spaces.

### Q1 and Q7 hard-refusal collapse

Q1 went from a substantive answer with § 2.2.8 cited to a generic hard refusal. Q7 kept its template wrapper but the QUOTE field now reads "The Mays Faculty Guidelines (October 2025) do not address this directly" instead of the prior tenure-criteria quote. Same suspected root cause as Q3.

### Q6 lost FDL content

The prior false-trigger Q6 actually contained useful FDL quotes despite the wrong template. The new Q6 has no content at all. Net informational value went down even though the rubric improved.

## Recommendations for the next Fixer pass (if Hari wants one)

1. **Loosen the quote-fidelity normalizer.** Strip curly quotes (`'`, `'`, `"`, `"`) and non-breaking spaces before comparing. The current `replace(/\s+/g, ' ').toLowerCase()` is too strict if the model adds smart-quote characters that the source uses straight quotes for, or vice versa.
2. **Make the hard-refusal fallback rarer.** Trigger it only when **multiple** quotes fail, not when one quote of three fails. Right now a single quote-fidelity miss is enough to wipe out the whole answer.
3. **Strip stranded `\.\s+-` tokens** in `stripEmDashes`. Add a final cleanup `replace(/\s+-(?=\s|\n|$)/g, '')` to remove the bullet-list residue we see in Q7 and Q10.
4. **Add a Q3-style regression test** that asserts the answer for "service expectations for tenure-track faculty" contains at least one verbatim citation matching the source. Break the build if it does not.

## Test methodology

- 12 questions sent sequentially to `https://mays-method-lab.onrender.com/api/apps/faculty-guidelines/chat` with a 2-second sleep between requests.
- Authentication: POST `/api/auth` with `mml-dev2026` returned `mml_session=1777752240721...` cookie, valid 12h.
- Source file `data/sources/mays-faculty-guidelines.txt` was loaded once and used as the verbatim ground truth for rubric 7 (whitespace-normalized substring match on every quoted span >= 15 chars).
- Em-dash detection (rubric 8) checked for any of `—`, `–`, `--` in the response body.
- Q6 template detection (rubric 9) required all four template phrases (Acknowledge, quote, Boundary, Escalation) to be present; Q6 had only quote + Escalation (the canonical hard-refusal text), so the template did not fire.
- Raw responses preserved at `docs/v3-tester-rerun-raw-responses.jsonl` (one JSON object per line: `{n, category, question, response, error, latency_ms}`).
- Latencies ranged from 5.2s (Q11) to 47.4s (Q3), with a typical Pass 1 + Pass 2 + Pass 3 run around 20s.
