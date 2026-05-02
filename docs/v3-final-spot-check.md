# Stage 3A Final Spot Check — Faculty Guidelines Chatbot

**Date**: 2026-05-02
**Endpoint**: `https://mays-method-lab.onrender.com/apps/faculty-guidelines`
**Commit on origin/main at test time**: `160a1bb`
**Method**: Single 3-turn conversation; full history threaded each request; 3-second sleep between requests.

## Conversation

### Turn 1
**User**: What's the timeline for promotion to full professor at Mays?

**Bot**:
> The Mays Faculty Guidelines (October 2025) do not address this directly. For your specific situation, contact your department head or email Hari Sridhar at ssridhar@mays.tamu.edu. Source: Mays Faculty Guidelines, October 17, 2025 (Approved version).

### Turn 2
**User**: I'm an associate professor prepping for promotion to full.

**Bot**:
> Thank you for that context. The Mays Faculty Guidelines address promotion from Associate to Full Professor. **Timeline:** The guidelines note: "Experience at Mays suggests that typically, but not always, Associate Professors require five years of service in rank to compile a record necessary for promotion to Professor" (§ 5.1.2, p. 39). The University Guidelines are quoted as stating: "Normal time in these ranks is determined by not only the ability to contribute significantly and continuously in the areas of scholarly research or creative work, teaching, and service, but by a period of service long enough to mount substantive evidence that their work in these areas is having an important impact locally and where applicable, nationally and internationally" (§ 5.1.2, p. 39). **Key recommendation:** The guidelines state: "Because of the expectations associated with a request by an Associate Professor to receive consideration for promotion to Professor, an individual should consult with her or his Department Head, senior members of the departmental faculty, and the Office of the Dean before making a formal request for consideration" (§ 5.1.2, p. 39-40). Source: Mays Faculty Guidelines, October 17, 2025 (Approved version).

(Note: Turn 2 contains a `p. 39-40` page range, which would fail the page-range rule, but Turn 2 is not the scored turn.)

### Turn 3 (the scored turn)
**User**: What's the difference between the annual review and the third-year review?

**Bot**:
> **Annual Review (Section 6, p. 53):**, "All faculty members, regardless of rank, receive an annual evaluation of their performance" (Section 6, p. 53). The guidelines do not specify the section here. The review period is "a previous twelve months of activities, from March 1 in year Y-1 to February 28/29 in year Y. In the case of research activities, the reviews focus on a rolling 36-month window" (Section 6.3, p. 55). **Third-Year Review / Mid-Term Review (Section 7, p. 60):**, This applies to "tenure-accruing Assistant Professor's third year as a member of the Mays faculty" (Section 7, p. 60). "The purpose of a mid-term review is to provide a formative review of tenure-track faculty members near the mid mid-point of their probationary period" (Section 7.1, p. 60). It "mimics the tenure and promotion review process as closely as possible" (Section 7.2, p. 60). The annual review applies to all faculty members and focuses on evaluating current performance for merit compensation. The third-year review applies only to tenure-track assistant professors in their third year and serves as a formative evaluation mimicking the tenure review process. Source: Mays Faculty Guidelines, October 17, 2025 (Approved version).

## Verification — three pass bars

### PASS BAR A — No stitching artifacts: PARTIAL FAIL

Listed forbidden patterns:
- `, The guidelines do not address this point directly.,` count: **0** PASS
- stranded `., ` mid-sentence count: **0** PASS
- `,.` count: **0** PASS
- doubled periods (excl. ellipses): **0** PASS

However, a different stitching artifact appears twice in Turn 3:
- `:**,` (header bold-close immediately followed by a stray comma) appears **2** times:
  1. `**Annual Review (Section 6, p. 53):**, "All faculty...`
  2. `**Third-Year Review / Mid-Term Review (Section 7, p. 60):**, This applies to...`

This is a stranded comma between a bolded header and the next sentence. The four explicit substring checks in PASS BAR A pass, but the response visibly contains stranded commas that look like stitching glue. Strict reading of PASS BAR A's literal substring tests: PASS. Spirit of PASS BAR A (no stitching artifacts of any kind): FAIL.

There is also one stranded sentence: `"The guidelines do not specify the section here."` appearing inline in the Annual Review paragraph. This is a verifier-injected fallback string from the page-fix prompt that was left wedged between the first quote and the next sentence. It is not in the listed PASS BAR A patterns, but is plainly an artifact.

### PASS BAR B — Citation specificity: FAIL

- Page ranges: **0** in Turn 3. PASS for that sub-rule.
- Bare `Section N` (parent-only when subsection exists): **2 distinct citations** that should have been deeper:
  - `Section 6, p. 53` cited twice. The quote `"All faculty members, regardless of rank, receive an annual evaluation of their performance"` lives in the Section 6 body that opens Section 6.1 (Purpose), which begins on p. 54. The citation should be `§ 6.1, p. 54` (or at minimum the correct page). The current citation gives the parent section number AND the wrong page.
  - `Section 7, p. 60` cited twice for the lead-in to Section 7. The lead-in paragraph is technically before 7.1, so `Section 7` is defensible; however, the response then re-cites the same `Section 7, p. 60` for content that paraphrases section content rather than the lead-in.

Subsections are correctly cited where the response uses them (`Section 6.3, p. 55`, `Section 7.1, p. 60`, `Section 7.2, p. 60`), so the model does know how to do this. The verifier did not push the lazy `Section 6` and `Section 7` citations down to their subsections.

### PASS BAR C — Multi-turn awareness: FAIL

Turn 3 does NOT acknowledge Sara's stated context (associate professor prepping for promotion to full). It gives a generic dictionary-style comparison and concludes:

> "The third-year review applies only to tenure-track assistant professors in their third year and serves as a formative evaluation mimicking the tenure review process."

This is correct factually, but it does not address that Sara is past that career stage. None of the three acceptable interpretations from the rubric are met:
- (a) does not note that Sara is past the third-year review
- (b) does not interpret as a third-year-as-associate-prof review
- (c) does not clarify which third-year review she means

The response uses no second-person language addressing Sara's situation at all (no `you`, `your`, `since you`, `as you mentioned`). This is exactly the failure mode PASS BAR C was designed to catch.

## Turn 3 raw response

```
**Annual Review (Section 6, p. 53):**, "All faculty members, regardless of rank, receive an annual evaluation of their performance" (Section 6, p. 53). The guidelines do not specify the section here. The review period is "a previous twelve months of activities, from March 1 in year Y-1 to February 28/29 in year Y. In the case of research activities, the reviews focus on a rolling 36-month window" (Section 6.3, p. 55). **Third-Year Review / Mid-Term Review (Section 7, p. 60):**, This applies to "tenure-accruing Assistant Professor's third year as a member of the Mays faculty" (Section 7, p. 60). "The purpose of a mid-term review is to provide a formative review of tenure-track faculty members near the mid mid-point of their probationary period" (Section 7.1, p. 60). It "mimics the tenure and promotion review process as closely as possible" (Section 7.2, p. 60). The annual review applies to all faculty members and focuses on evaluating current performance for merit compensation. The third-year review applies only to tenure-track assistant professors in their third year and serves as a formative evaluation mimicking the tenure review process. Source: Mays Faculty Guidelines, October 17, 2025 (Approved version).
```

## Verdict

**STAGE 3A NEEDS ONE MORE FIX**

Three issues remain on Turn 3:

1. **Stitching glue still visible** — a `:**,` pattern appears twice (bolded header followed by stray comma), and a verifier-injected `"The guidelines do not specify the section here."` is wedged inline. The Pass-3 page-fix and verifier passes are leaving stranded commas and orphaned fallback sentences in the rendered output. Pass-5's stitching cleanup did not catch this header pattern.

2. **Citation specificity not enforced for parent-section quotes** — the response cites `Section 6, p. 53` for a quote that should be `§ 6.1, p. 54`. The verifier (CHECK 6) correctly flags `Section 6` as too shallow when `6.1` exists, but the rewrite step is not pushing the citation down. Page number 53 is also wrong for the quoted material.

3. **Multi-turn awareness not engaging** — the bot did not apply Sara's stated context (associate prepping for full). The system prompt's "USE PRIOR TURNS TO DISAMBIGUATE" instruction did not steer the answer; the response is a generic comparison with no acknowledgement that the third-year review is irrelevant to Sara.

The single fix should target Pass-3 / verifier so that (a) the page-fix replacement does not leave stranded commas or orphaned fallback sentences, (b) CHECK 6's specificity rewrite actually rewrites, not just flags, and (c) the personal-context awareness fires for Turn-3-style follow-ups even when the personal-applicability template is not triggered (Sara's Turn 3 question has no first-person applicability framing, so the template does not fire, but her established context should still steer disambiguation).
