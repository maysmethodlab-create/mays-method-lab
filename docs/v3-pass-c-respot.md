# Pass Bar C Re-Spot Check — Faculty Guidelines Chatbot (after Fixer 7)

**Date**: 2026-05-02
**Endpoint**: `https://mays-method-lab.onrender.com/apps/faculty-guidelines`
**Commit on origin/main at test time**: `bae5f5c`
**Method**: Single 3-turn conversation, full history threaded each request, 3-second sleep between requests. Three full runs were executed because Run 1 returned an unexpected hard-refusal on Turn 3, and a single observation seemed insufficient for a decisive verdict on a stochastic pipeline.

## Turns
1. "What's the timeline for promotion to full professor at Mays?"
2. "I'm an associate professor prepping for promotion to full."
3. "What's the difference between the annual review and the third-year review?"

## Run 3 (saved raw — most recent)

### Turn 3 raw response

```
The Mays Faculty Guidelines (October 2025) do not address this directly. For your specific situation, contact your department head or email Hari Sridhar at ssridhar@mays.tamu.edu. Source: Mays Faculty Guidelines, October 17, 2025 (Approved version).
```

This is the literal `HARD_REFUSAL` constant in `route.ts`.

## Three-run summary (Pass Bar C is what matters)

| Run | Turn 3 outcome | Pass C |
|-----|---------------|--------|
| 1 | `HARD_REFUSAL` | FAIL (no second-person, no rank ack, no review distinction) |
| 2 | Real answer with second-person, but **misidentified Sara as "full professor"** | FAIL |
| 3 | `HARD_REFUSAL` | FAIL |

Across three runs the bot never produced a Turn 3 that satisfies Pass Bar C.

## Verdict

### Pass Bar C — FAIL

Run 3 Turn 3 (the saved raw) is the `HARD_REFUSAL` stub. It contains no second-person language, no acknowledgement of Sara's stated rank, and no statement that the third-year review does not apply to her current situation.

There is no second-person sentence to extract; the response has zero "you" / "your" tokens.

### Pass Bar A regression check — PASS

Run 3 Turn 3 is `HARD_REFUSAL`. Programmatic counts on the saved Turn 3 message body:
- `:**,` count: 0
- `**, ` count: 0
- `"do not specify the section here"` count: 0
- doubled periods: 0
- stranded `,` mid-paragraph: 0

Vacuously clean because the response has no quote scaffolding.

(Note: Run 2 Turn 3, by contrast, contained one `the guidelines do not specify the section here` stub mid-paragraph. Pass A is unstable across runs.)

### Pass Bar B regression check — PASS (vacuously)

Run 3 Turn 3 contains zero section citations. There is nothing to mis-cite.

(Run 2 Turn 3 had `Per the guidelines, p. 60:` and `Per the guidelines, p. 53:` style citations only — no section number. That is a regression from the prior fixer-6 spot check, but the assigned three pass bars do not score "section number is present", only "if a section is cited, it is the most specific subsection." So Run 2 also vacuously passes B by that strict reading.)

## CHECK 7 diagnosis (why it did not enforce on Run 3)

CHECK 7 runs in **Pass 2 (verifier)**. Pass 3 (deterministic quote-fidelity + page-number check) runs **after** Pass 2. When Pass 3's two retries cannot resolve fabricated quotes, it sets:

```ts
final = HARD_REFUSAL;
```

— overwriting whatever CHECK 7 produced. CHECK 7's context-aware rewrite is therefore destroyed by the Pass 3 fallback on Turn 3 in Runs 1 and 3.

Specifically:
1. Pass 1 generates a draft answer comparing annual and third-year reviews. The draft contains quoted passages (some fabricated, some real).
2. Pass 2 verifier sees `USER CONTEXT: Rank: Associate Professor; Career step: preparing for promotion to Full Professor` and applies CHECK 7. It rewrites with second-person framing and the correct review distinction.
3. Pass 3 runs `findFabricatedQuotes(final, sourceText)`. At least one quote in the rewritten response is not a verbatim source match. Two quote-fix retries fail to resolve all fabrications.
4. Pass 3 sets `final = HARD_REFUSAL`. CHECK 7's context awareness is gone.

Run 2 escaped because Pass 3 retries succeeded — but introduced a different failure: the verifier hallucinated Sara's rank as "full professor" instead of "associate professor preparing for promotion to full".

## What needs to change

CHECK 7 is correctly **specified** in the verifier and the deterministic context extractor `extractUserContext()` is producing the correct context block (`Rank: Associate Professor; Career step: preparing for promotion to Full Professor`). The issue is **layering**, not detection:

1. Pass 3 fallback to `HARD_REFUSAL` is destroying CHECK 7 work. Either Pass 3 should not nuke the entire response when fabricated quotes remain (it could surgically blank just the fabricated quote), or CHECK 7 should run **after** Pass 3 / Pass 3 fallback so the post-pass response always carries the user-context framing.
2. Run 2's "full professor" rank confusion suggests the verifier prompt for CHECK 7 needs a stronger anchor on the deterministically extracted rank string (rather than letting the model re-infer rank from ambiguous phrases like "preparing for promotion to full"). Quote `ctx.rank` directly into the verifier instructions for CHECK 7 and forbid the verifier from re-stating rank in any other form.

## Verdict

**Pass Bar C still FAILS.** Stage 3A is NOT done. Three independent runs all failed Pass C: two dropped to `HARD_REFUSAL` (CHECK 7 destroyed by Pass 3), one produced a wrong-rank answer (verifier hallucinated despite correct context block).

CHECK 7 is conceptually correct, but its output is being overwritten by the downstream Pass 3 hard-refusal fallback. Fixer 8 needs to either reorder passes or harden the fallback so CHECK 7's context framing survives.
