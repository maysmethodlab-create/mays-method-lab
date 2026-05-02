# PowerPoint Reformatter, User Test as Sara Chen

Date: 2026-05-02
Tester persona: Sara Chen, associate professor of marketing, prepping a research talk
Input: 7-slide deliberately amateur deck (Comic Sans, magenta, Papyrus, hype slide, bullet hell)
Output: `tmp/sara-output.pptx`, `tmp/sara-output-accessibility.txt`
Round-trip: 21.7 seconds end-to-end through production at https://mays-method-lab.onrender.com

## 1. Overall verdict

Yes, Sara would use this again on a deck that arrived looking trashy. The output looks like a real Mays research talk, not a costume.

## 2. What worked

- Slide 1 went from "RESEARCH FINDINGS!!!" Comic Sans yellow on magenta to "Research findings on activist brands" in maroon Oswald with a quiet eyebrow line for the author. That alone justifies the tool.
- The 200-word wall on slide 2 became four readable bullets that captured the actual claim (warmth mediates, competence moderates) instead of dropping it.
- Slide 3 squeezed 12 nested bullets at three indent levels down to three flat bullets ("Consumer surveys", "Controlled experiments", "Social media analysis"). Right call on the count.
- Slide 7's all-caps Papyrus "THANK YOU / QUESTIONS???" became sentence-case "Thank you / Questions and discussion".
- Footers ("Mays Business School", page X / 7) appear consistently on slides 2 to 6. Body sizes hit 18pt where they should.
- Round-trip in 22 seconds. Sara would not put down her coffee.

## 3. What broke or annoyed

- Slide 4 duplicates itself. The H1 reads "Warmth is the primary driver" and the very first bullet reads "Warmth is the key driver". Two lines of the same sentence stacked. As a presenter Sara would have to fix this before opening the deck in a seminar.
- Slide 3 is too austere. The reformatter dropped the specifics that make a research talk ("N = 1,847 from Prolific", "ICC = 0.88", "2 by 2 between-subjects"). The hierarchy was real and the numbers were the substance. Three nouns in a vacuum is not enough for an academic audience.
- Slide 6 collapsed Sara's four image placeholders into one image area. Defensible, but it should have flagged the choice to her, not silently dropped three slots.
- The image alt text is filler: "Image: Visual representation related to Aggies" on the slide and "Visual representation showing Aggies imagery related to activist brands research" in the report. A screen-reader user gets nothing useful, and the two strings do not even match.
- The accessibility report claims body text is at least 18pt, but the eyebrow labels render at 12pt and footers at 11pt. Score 100 / 100 with zero items needing review on a deck this rough is itself the problem. The bar is set too low.

## 4. The hype slide test

Pass. Slide 5 read "REVENUE GROWTH: UP! CUSTOMERS: HAPPIER! NPS: SOLID!". The output kept it directional ("Revenue growth increased", "Customer satisfaction rose", "NPS improved", "Brand love strengthened") and did not invent a single percentage, dollar, or sample size. The new title "Activist brands drive business results" is mildly editorial but does not fabricate data. This was the v3 failure mode and it did not happen.

## 5. The accessibility report

Mixed. It correctly tags reading order, contrast ratios for the maroon-on-white palette, and screen-reader titles. But scoring 24 / 24 passed and zero needs-review on a deck where the alt text is hollow and the eyebrow is below the stated size threshold makes the score feel like a participation trophy. Useful as a sanity check, not as a real audit.

## 6. Recommendation

SHIP WITH FOOTNOTES.

The output is good enough for a real research talk after a five-minute Sara pass. The brand work is solid. The fabrication test passed. The headline rewrites are tasteful.

## 7. Single biggest fix

Stop the headline-bullet duplication. Slide 4 ("Warmth is the primary driver" / "Warmth is the key driver") is the kind of repeat that makes a presenter lose trust in the tool. Add a deduplication pass that compares each H1 against the first bullet on the same slide and rewrites or drops the duplicate before render.

Runner-up: tighten the accessibility score so a deck with stub alt text and missing image bytes cannot land at 100 / 100.
