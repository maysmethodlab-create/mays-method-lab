# Faculty Guidelines Chatbot — Q8 Spot Check (after Fixer pass 4)

- **Date**: 2026-05-02
- **Commit under test**: `76009e1`
- **Question (Q8)**: "Do I have enough papers for promotion to full professor?"

## Raw response

```text
That's a question the guidelines speak to. Here's what they say.

**The Mays Faculty Guidelines state:**

"At a minimum, Associate Professors should produce an effective performance in terms of research and publication, teaching, and service. Additionally, Associate Professors seeking promotion to Professor should demonstrate excellence in research and publication" (§ 5.1.2, p. 38).

"An exemplary level of accomplishment as measured against the contributions of others in his or her field" (§ 5.1.2, p. 38).

"In terms of research and publication, Mays expects that Associate Professors will continue producing research at a rate that is close to commensurate with the productivity research and publication productivity required for an Assistant Professor to receive a promotion to an Associate Professor position" (§ 5.1.2, p. 39).

Additionally, the guidelines establish specific performance criteria:

"A tenured associate or full professor without an endowed position who publishes at least two peer-reviewed studies in A-level journals over the most recent 5-year window will maintain a 3-course teaching load and two months of summer research support. A faculty member who does not publish at least two peer-reviewed studies in A-level journals over the most recent 5-year window may experience an increase in teaching load and a reduction in summer research support" (Appendix B, § B.3.1, p. 93).

**The guidelines do not specify a minimum number of publications for promotion to full professor. I can describe the criteria. The determination for your specific case rests with the departmental promotion and tenure committee, Department Head, Mays Promotion and Tenure Committee, and Dean. I do not and cannot make that determination.**

Two paths to discuss your case: (1) Email Hari Sridhar at ssridhar@mays.tamu.edu with your CV and a specific question. (2) Reach out to your department head.

Source: Mays Faculty Guidelines, October 17, 2025 (Approved version).
```

## Rubric

| Item | Result |
|---|---|
| 4-part template fires (Acknowledge / Quote / Boundary / Escalation) | Yes |
| Quote field has substantive content (not "do not address" stub) | Yes |
| Quotes verified against `data/sources/mays-faculty-guidelines.txt` (line 1657 onward, line 4102 onward) | Yes |
| Covers promotion-to-Professor criteria specifically | Yes |
| Section reference accurate | Yes (§ 5.1.2, pp. 38-40 — see note below) |
| No em dashes | Yes |
| Source citation footer present | Yes |

### Note on the rubric's "5.1.4 (p. 39-40)" reference

Section **5.1.4 does not exist** in `data/sources/mays-faculty-guidelines.txt`. The section that actually covers Associate Professor promotion to full Professor is **§ 5.1.2 "Performance Expectations for Associate Professors Seeking Promotion to a Professor Position"** spanning pp. 38-40. The chatbot correctly cites § 5.1.2 with the right page numbers. The rubric prompt's "5.1.4" appears to be a typo for 5.1.2.

## Verdict: PASS

The 4-part template fires cleanly, all three primary quotes are verbatim from the source, the page numbers and section IDs are accurate, the boundary statement explicitly disclaims authority on the personal-applicability question, the escalation paths are present, no em dashes appear, and the source footer is intact. Quote field is substantive and on-topic for promotion to full Professor.

Stage 3A is ready for User agent dispatch.
