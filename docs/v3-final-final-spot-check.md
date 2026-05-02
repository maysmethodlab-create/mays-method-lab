# Stage 3A Final-Final Spot Check — Faculty Guidelines Chatbot (after Fixer 6)

**Date**: 2026-05-02
**Endpoint**: `https://mays-method-lab.onrender.com/apps/faculty-guidelines`
**Commit on origin/main at test time**: `81daa77`
**Method**: Single 3-turn conversation, full history threaded each request, 3-second sleep between requests.

## Conversation

### Turn 1
**User**: What's the timeline for promotion to full professor at Mays?

**Bot**:
> The Mays Faculty Guidelines (October 2025) do not address this directly. For your specific situation, contact your department head or email Hari Sridhar at ssridhar@mays.tamu.edu. Source: Mays Faculty Guidelines, October 17, 2025 (Approved version).

### Turn 2
**User**: I'm an associate professor prepping for promotion to full.

**Bot**:
> Thank you for sharing that you're preparing for promotion to full professor. I want to be clear about what I can and cannot do: I can share what the Faculty Guidelines state about promotion to full professor, but I cannot evaluate whether the timing is right for you personally or advise on your specific case. **What the Guidelines Say:** The guidelines note: "Experience at Mays suggests that typically, but not always, Associate Professors require five years of service in rank to compile a record necessary for promotion to Professor" (§ 5.1.2, p. 39). Regarding the preparation process, the guidelines do not address this point directly. **What I Cannot Do:** I cannot assess whether your individual record meets promotion standards, advise on timing for your case, or predict the outcome of your promotion review. **Your Next Step:** Please consult with your Department Head, senior faculty in your department, and the Office of the Dean to discuss your specific situation and readiness for promotion. Source: Mays Faculty Guidelines, October 17, 2025 (Approved version).

### Turn 3 (the scored turn)
**User**: What's the difference between the annual review and the third-year review?

## Verification — three pass bars

### PASS BAR A — No stitching artifacts: PASS

Programmatic counts on Turn 3 message body:

- `:**,` (bold-colon-comma) count: **0** PASS
- `**, ` (closing-bold-comma-space) count: **0** PASS
- `"The guidelines do not specify the section here."` count: **0** PASS
- doubled periods `..` count: **0** PASS
- stranded `,` (mid-paragraph ` , `) count: **0** PASS

All five Pass-A checks clean. Major improvement vs prior spot check, where the same Turn 3 produced two `:**,` artifacts and one wedged "do not specify the section here." fallback.

### PASS BAR B — Citation specificity: PASS

Citations in Turn 3: `§ 7, p. 60` (twice), `§ 7.1, p. 60`, `§ 6.1, p. 54` (twice).

- Page numbers: all single page, no ranges. PASS.
- `§ 6.1, p. 54` correctly cites the subsection (prior run cited `Section 6, p. 53`, which was both shallow and wrong page). FIXED.
- `§ 7, p. 60` is used for the preamble paragraph that sits between header "7. Mid-Term Review" and subsection "7.1 Purpose". I verified the source text: the quote `"mandatory for tenure-track faculty subject to a probationary period of five years or more"` lives in that preamble (positions 167140 to 167615 in `data/sources/mays-faculty-guidelines.txt`, with the next subsection 7.1 starting after). Citing `§ 7` for preamble content is therefore genuinely correct, not a parent-of-subsection lazy citation.
- `§ 7.1, p. 60` correctly used for the Purpose quote.

### PASS BAR C — Multi-turn awareness: FAIL

Turn 3 does not acknowledge Sara's established context. There is no `you`, `your`, `since you`, `as you mentioned`, `in your situation`, or any equivalent phrasing tying the answer to her stated rank. The response is a generic textbook comparison.

Key absent statement: the response does not say the third-year review does not apply to Sara because she is past the assistant-professor stage. Instead the closing summary is generic: "the third-year review is a one-time formative evaluation specifically for assistant professors near their probationary midpoint, while the annual review recurs every year for all faculty."

The response does mention the third-year review applies to "Assistant Professors" and is "for tenure-track faculty subject to a probationary period of five years or more", which gives Sara enough information to deduce non-applicability, but the multi-turn-awareness rule asks for an explicit contextual application, not a deduction-by-implication. None of the three rubric interpretations from prior runs (a/b/c) are satisfied.

This is the same failure mode the prior spot check flagged. Fixer 6's "multi-turn awareness for ALL questions" change did not steer this answer.

## Turn 3 raw response

```
The **third-year review (formally called the mid-term review)** applies to tenure-accruing Assistant Professors (§ 7, p. 60). According to § 7.1, p. 60: "The purpose of a mid-term review is to provide a formative review of tenure-track faculty members near the mid mid-point of their probationary period." It is "mandatory for tenure-track faculty subject to a probationary period of five years or more" (§ 7, p. 60). The **annual review** applies to all faculty members. According to § 6.1, p. 54: "All faculty members, regardless of rank, receive an annual evaluation of their performance." The stated purposes include "Creating a sound and logical basis for merit compensation recommendations" and "Providing evaluative feedback regarding how well the individual is performing currently relative to the norms and expectations for her or his faculty position" (§ 6.1, p. 54). The key differences are: (1) the third-year review is a one-time formative evaluation specifically for assistant professors near their probationary midpoint, while the annual review recurs every year for all faculty; and (2) the third-year review focuses on progress toward tenure, while the annual review addresses current performance relative to rank-specific expectations and informs merit compensation. Source: Mays Faculty Guidelines, October 17, 2025 (Approved version).
```

## Comparison to prior spot check (commit 160a1bb)

| Pass Bar | Prior | This run |
|---|---|---|
| A — Stitching | PARTIAL FAIL (two `:**,`, one wedged fallback) | PASS (all five checks clean) |
| B — Citations | FAIL (bare `Section 6, p. 53` instead of `§ 6.1, p. 54`) | PASS (proper subsection use, correct pages, no ranges) |
| C — Multi-turn awareness | FAIL (no contextualization to Sara) | FAIL (still no contextualization to Sara) |

Two of three bars fixed. One remains.

## Verdict

**STAGE 3A NEEDS ANOTHER FIX**

Fixer 6 successfully landed the header-stitching cleanup and the CHECK 6 rewrite enforcement. The bot now produces clean prose with correct subsection citations on the third turn of a threaded conversation.

The multi-turn-awareness piece did not engage on this run. Turn 3 still reads as a generic textbook comparison with no second-person contextualization to Sara's stated rank. The bot has all the facts to say "since you are an associate professor preparing for promotion to full, the third-year review does not apply to you", but it does not connect the dots in the answer. The "multi-turn awareness for ALL questions" instruction is in the prompt, but the model is not honoring it for definitional/comparison questions when the personal-applicability template is not triggered (Turn 3 has no first-person applicability framing, so the template does not fire).

Recommended next fix targets the Pass-1 system prompt's multi-turn section: when prior turns established a rank or career stage, definitional/comparison questions on rank-scoped topics (annual review vs third-year review, mid-term review, tenure clock, etc.) must include an explicit one-sentence applicability call-out tied to the established context, even when no first-person framing appears in the current turn.
