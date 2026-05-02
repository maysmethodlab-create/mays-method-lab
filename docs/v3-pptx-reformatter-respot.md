# PowerPoint Reformatter Respot After Fixer

**Date:** 2026-05-02
**Tester:** Claude (final spot check)
**Live commit:** `3f79dda`
**Endpoint:** https://mays-method-lab.onrender.com/apps/pptx-reformatter
**Test deck:** `data/test-decks/sara-messy-deck.pptx`
**Process job id:** `1777761663564-9a138b11bf78`

## What was tested

Re-uploaded Sara's exact messy deck through production after Fixer shipped two
precise fixes (headline/bullet dedup + accessibility scoring honesty). Pulled
both outputs and checked them against the two pass bars.

API response summary:

```
{ ok: true, slideCount: 7, sourceSlideCount: 7,
  accessibilityScore: 100, passedCount: 24,
  autoFixedCount: 0, needsReviewCount: 0 }
```

## PASS BAR A — Slide 4 deduplication: FAIL

Slide 4 text runs (in order, from `ppt/slides/slide4.xml`):

1. Warmth drives identification with activist brands  *(headline)*
2. Warmth is the dominant factor                       *(first bullet)*
3. Competence enhances warmth impact
4. Competence alone insufficient without warmth
5. Combined effect strongest for identification
6. Key finding slide
7. Mays Business School
8. 4 / 7

The headline "Warmth drives identification with activist brands" and the first
bullet "Warmth is the dominant factor" are semantically equivalent. This is the
exact failure pattern called out in the pass bar: headline "Warmth is the
primary driver" / bullet "Warmth is the key driver". Dedup did not catch it.

## PASS BAR B — Accessibility scoring honesty: FAIL

From `/api/apps/pptx-reformatter/download/.../report`:

- Score: **100/100** (required: 70 to 85)
- Passed: 24
- Auto-fixed: 0
- Needs human review: **0** (required: non-empty)
- No finding mentions "Synthesized alt text" or "Image not transferred from
  source"

Slide 6 has an image alt-text finding, but it is in the *Passed* bucket with
the synthesized planner annotation accepted at face value:

```
[slide 6] alt-text: Image alt text set: "Four images demonstrating brand
activism efforts and consumer response patterns ".
```

The Notes section asks the user to "Verify it describes the image accurately"
but does not subtract from the score and does not move the finding into the
needs-review bucket. The honesty fix has not landed.

## Verdict

**STAGE 3A PPTX REFORMATTER NEEDS ANOTHER FIX.**

Both fixes Fixer claimed to ship are not visible in production at commit
`3f79dda`:

1. Slide 4 still has a near-paraphrase first bullet under the headline.
2. Accessibility report still returns 100/100 with zero needs-review items and
   no honest flag for the synthesized alt text on slide 6.

Re-open both bugs for Fixer.
