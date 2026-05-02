import 'server-only';
import { getClient, isApiKeyConfigured } from '@/lib/evaluation-letters/claude';
import { MAX_SLIDES, parsePptx, type ParsedDeck } from './parse-input';
import {
  MAYS_LAYOUTS,
  MAYS_LAYOUT_DESCRIPTIONS,
  MAYS_BRAND,
} from './brand';
import type {
  AccessibilityPlan,
  AccessibilityReport,
  BrandStudy,
  BrandedDeckPlan,
  BrandedSlide,
  PipelineResult,
  SynthesizedDeck,
  SynthesizedSlide,
} from './plan-types';
import { generatePptx, renderAccessibilityText } from './generate-output';

/**
 * Six-step LLM pipeline for the PowerPoint Reformatter.
 *
 *   1. Synthesize        -- Haiku turns parsed slide text into structured JSON
 *   2. Brand-study       -- Haiku picks a Mays layout per slide
 *   3. Plan              -- Haiku produces a BrandedDeckPlan
 *   4. Aesthetic review  -- Haiku critiques and revises the plan
 *   5. Accessibility pass -- Haiku produces alt text + reading order + flags
 *   6. Generate          -- deterministic generator from generate-output.ts
 *
 * EVERY Anthropic call uses claude-haiku-4-5-20251001. Cost matters; we
 * never call Sonnet or Opus from this pipeline. The model name is hard-
 * coded in HAIKU_MODEL and reused by every step.
 *
 * Each step has a focused, short system prompt to keep tokens low. We
 * also constrain max_tokens per step so a runaway response can't blow
 * the budget on a single slide.
 *
 * Failure handling: if any step throws or returns non-JSON, the
 * pipeline falls back to a deterministic plan derived from the parsed
 * input. The user still gets a Mays-branded deck, even if it's a
 * conservative one. The accessibility pass is a no-op fallback that
 * uses the headlines as screen-reader titles.
 */

export const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

/* ===========================================================================
 *  Helpers
 * ========================================================================= */

/**
 * Pull the JSON object out of a model response. Haiku usually wraps JSON
 * in ```json fences; we accept either. If parsing fails the caller is
 * responsible for falling back.
 */
function parseJson<T>(raw: string): T | null {
  if (!raw) return null;
  // Try fenced first.
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : raw;
  // Strip leading commentary by jumping to the first { or [.
  const start = candidate.search(/[{\[]/);
  if (start < 0) return null;
  const trimmed = candidate.slice(start).trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // One more attempt: cut to the last } or ] in case the model trailed
    // with prose.
    const lastBrace = Math.max(trimmed.lastIndexOf('}'), trimmed.lastIndexOf(']'));
    if (lastBrace > 0) {
      try {
        return JSON.parse(trimmed.slice(0, lastBrace + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/** Concatenate the assistant's text-block content. */
function joinText(content: Array<{ type: string; text?: string }>): string {
  return content
    .filter((b): b is { type: 'text'; text: string } => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('')
    .trim();
}

/**
 * Single Haiku call. Wraps the model name + max_tokens defaults so each
 * step doesn't have to repeat them. `system` is the focused per-step
 * instruction; `userPayload` is the JSON the model reads.
 */
async function callHaiku(args: {
  system: string;
  userPayload: string;
  maxTokens: number;
}): Promise<string> {
  const client = getClient();
  const reply = await client.messages.create({
    model: HAIKU_MODEL,
    max_tokens: args.maxTokens,
    system: args.system,
    messages: [{ role: 'user', content: args.userPayload }],
  });
  return joinText(reply.content);
}

/* ===========================================================================
 *  Step 1: Synthesize
 * ========================================================================= */

const STEP1_SYSTEM = `You are a slide-deck analyst. Read the parsed slides JSON the user supplies and return a SynthesizedDeck JSON. For each slide, identify:
- kind: one of "title" | "section" | "content" | "two-column" | "data" | "image" | "closing"
- keyMessage: one sentence summary of what the slide is meant to communicate
- imageDescriptions: short text descriptions (one per image) inferred from titles, captions, or notes when bytes are not available

Also produce a one-line deckSummary.

OUTPUT RULES:
- Output ONLY valid JSON, no commentary, no markdown fence.
- Schema:
  {
    "slideCount": number,
    "deckSummary": string,
    "slides": [
      { "index": number, "kind": "...", "keyMessage": string, "sourceTitle": string, "notes": string, "hasImage": boolean, "hasTable": boolean, "imageDescriptions": [string] }
    ]
  }
- Preserve the input "index", "sourceTitle", "notes", "hasImage", "hasTable" verbatim.
- Keep keyMessage under 25 words.
- Do not invent content not present in the input.`;

async function stepSynthesize(parsed: ParsedDeck): Promise<SynthesizedDeck> {
  // Build a compact input. Only fields the model needs.
  const slidesIn = parsed.slides.map((s) => ({
    index: s.index,
    title: s.title,
    body: s.body.slice(0, 1200),
    bullets: s.bullets.slice(0, 12),
    notes: s.notes.slice(0, 600),
    hasTable: s.hasTable,
    hasImage: s.hasImage,
    layoutHint: s.layoutHint,
  }));
  const payload = JSON.stringify({ slideCount: parsed.slideCount, slides: slidesIn });

  try {
    const raw = await callHaiku({ system: STEP1_SYSTEM, userPayload: payload, maxTokens: 4096 });
    const parsedOut = parseJson<SynthesizedDeck>(raw);
    if (parsedOut && Array.isArray(parsedOut.slides) && parsedOut.slides.length > 0) {
      return parsedOut;
    }
  } catch {
    // Fall through to deterministic fallback.
  }

  // Deterministic fallback. Map each parsed slide to a SynthesizedSlide
  // using simple heuristics so the rest of the pipeline still has work
  // to chew on.
  const slides: SynthesizedSlide[] = parsed.slides.map((s) => {
    let kind: SynthesizedSlide['kind'] = 'content';
    if (s.index === 1) kind = 'title';
    else if (s.bullets.length === 0 && s.body.length < 100) kind = 'section';
    else if (s.hasImage) kind = 'image';
    else if (s.hasTable) kind = 'data';
    return {
      index: s.index,
      kind,
      keyMessage: s.title || s.body.slice(0, 120) || `Slide ${s.index}`,
      sourceTitle: s.title,
      notes: s.notes,
      hasImage: s.hasImage,
      hasTable: s.hasTable,
      imageDescriptions: [],
    };
  });
  return {
    slideCount: slides.length,
    deckSummary: `Deck with ${slides.length} slides.`,
    slides,
  };
}

/* ===========================================================================
 *  Step 2: Brand-study (layout selection)
 * ========================================================================= */

const STEP2_SYSTEM = `You are a brand-aware deck designer. Given a list of slides (with kind + keyMessage) and a Mays layout catalog, pick the BEST Mays layout for each slide.

Mays layouts (allowed values):
${MAYS_LAYOUTS.map((l) => `- "${l}": ${MAYS_LAYOUT_DESCRIPTIONS[l]}`).join('\n')}

OUTPUT RULES:
- Output ONLY valid JSON: { "choices": [ { "index": number, "layout": "...", "reason": string } ] }
- "layout" MUST be one of the allowed values.
- "reason" MUST be one short sentence.
- Use "title" only for slide 1.
- Use "closing" only for the last slide if it reads like a thank-you / Q&A / contact.
- Use "section" for short divider slides.
- Use "two-column" only for compare/contrast or before/after content.
- Use "image-caption" when the slide is dominated by an image.
- Default everything else to "content".`;

async function stepBrandStudy(deck: SynthesizedDeck): Promise<BrandStudy> {
  const payload = JSON.stringify({
    slides: deck.slides.map((s) => ({ index: s.index, kind: s.kind, keyMessage: s.keyMessage })),
  });

  try {
    const raw = await callHaiku({ system: STEP2_SYSTEM, userPayload: payload, maxTokens: 2048 });
    const out = parseJson<BrandStudy>(raw);
    if (out && Array.isArray(out.choices) && out.choices.length > 0) {
      // Filter out any layout values that aren't in the approved set.
      out.choices = out.choices
        .filter((c) => typeof c.index === 'number' && (MAYS_LAYOUTS as readonly string[]).includes(c.layout))
        .map((c) => ({ index: c.index, layout: c.layout, reason: String(c.reason || '').slice(0, 200) }));
      if (out.choices.length === deck.slides.length) return out;
    }
  } catch {
    // fall through
  }

  // Deterministic fallback. Map kind directly to layout, slot title +
  // closing onto first/last positions.
  const choices = deck.slides.map((s, i) => {
    let layout: BrandStudy['choices'][number]['layout'] = 'content';
    if (i === 0 || s.kind === 'title') layout = 'title';
    else if (s.kind === 'section') layout = 'section';
    else if (s.kind === 'two-column') layout = 'two-column';
    else if (s.kind === 'image') layout = 'image-caption';
    else if (i === deck.slides.length - 1 && /thank|q[ &]a|questions|contact/i.test(s.keyMessage)) layout = 'closing';
    return { index: s.index, layout, reason: 'fallback heuristic' };
  });
  return { choices };
}

/* ===========================================================================
 *  Step 3: Plan -- BrandedDeckPlan v1
 * ========================================================================= */

const STEP3_SYSTEM = `You are a Mays-brand deck planner. Given a SynthesizedDeck and a BrandStudy (layout choices), produce a BrandedDeckPlan: one BrandedSlide per slide.

CONSTRAINTS (strict; the deterministic generator clamps if you over-shoot but you should respect these):
- headline: maximum 8 words, sentence case, no em dashes
- body: maximum 60 words
- bullets: maximum 5 bullets, each maximum 12 words, no em dashes
- twoColumn (only for layout="two-column"): { "leftHeading", "rightHeading", "left": [string], "right": [string] }, max 4 bullets per side, ~10 words each
- image (only for layout="image-caption"): { "caption": string, "altText": string, "placeholder": true }
- preserve "notes" verbatim from the input

VOICE:
- Anglo-Saxon, point-first, active voice
- No em dashes
- No AI cheerleader words ("delve", "leverage", "transformative", "dive into", "robust", etc.)
- Sentence case for headlines (capitalize first word and proper nouns; not Title Case)

OUTPUT:
- Output ONLY valid JSON. Schema:
  {
    "slideCount": number,
    "reviewed": false,
    "deckTitle": string,
    "slides": [
      { "index": number, "sourceIndex": number, "layout": "...", "headline": "...", "eyebrow": "...?",
        "body": "...?", "bullets": [string]?, "twoColumn": {...}?, "image": {...}?,
        "notes": "...?", "designerNote": "...?" }
    ]
  }
- "index" starts at 1 and is sequential.
- "sourceIndex" matches the original slide index.
- One BrandedSlide per source slide unless there is an obvious split.`;

async function stepPlan(deck: SynthesizedDeck, brandStudy: BrandStudy): Promise<BrandedDeckPlan> {
  // Compose layout map for the model.
  const layoutMap: Record<number, string> = {};
  for (const c of brandStudy.choices) layoutMap[c.index] = c.layout;

  const payload = JSON.stringify({
    deckSummary: deck.deckSummary,
    slides: deck.slides.map((s) => ({
      index: s.index,
      kind: s.kind,
      keyMessage: s.keyMessage,
      sourceTitle: s.sourceTitle,
      notes: s.notes,
      layout: layoutMap[s.index] || 'content',
      hasImage: s.hasImage,
      hasTable: s.hasTable,
    })),
  });

  try {
    const raw = await callHaiku({ system: STEP3_SYSTEM, userPayload: payload, maxTokens: 4096 });
    const out = parseJson<BrandedDeckPlan>(raw);
    if (out && Array.isArray(out.slides) && out.slides.length > 0) {
      // Sanitize layouts and indices.
      out.slides = out.slides.map((s, i) => ({
        ...s,
        index: i + 1,
        sourceIndex: typeof s.sourceIndex === 'number' ? s.sourceIndex : (deck.slides[i]?.index ?? i + 1),
        layout: (MAYS_LAYOUTS as readonly string[]).includes(s.layout) ? s.layout : 'content',
        // Image provenance: the parser does not currently extract source
        // alt text or image bytes, so any image block on a planner output
        // is by construction synthesized + a placeholder. Mark both
        // signals false explicitly so the accessibility scorer can flag
        // honestly. When real extraction lands, flip these per slide.
        image: s.image
          ? {
              ...s.image,
              placeholder: true as const,
              altTextFromSource: false,
              imageBytesFromSource: false,
            }
          : undefined,
      }));
      out.slideCount = out.slides.length;
      out.reviewed = false;
      return out;
    }
  } catch {
    // fall through
  }

  // Deterministic fallback plan.
  const slides: BrandedSlide[] = deck.slides.map((s, i) => {
    const layout = layoutMap[s.index] || 'content';
    return {
      index: i + 1,
      sourceIndex: s.index,
      layout: (MAYS_LAYOUTS as readonly string[]).includes(layout) ? (layout as BrandedSlide['layout']) : 'content',
      headline: (s.sourceTitle || s.keyMessage).slice(0, 80),
      body: s.keyMessage.slice(0, 240),
      notes: s.notes,
    };
  });
  return {
    slideCount: slides.length,
    reviewed: false,
    deckTitle: deck.deckSummary,
    slides,
  };
}

/* ===========================================================================
 *  Step 4: Aesthetic review (revised plan)
 * ========================================================================= */

const STEP4_SYSTEM = `You are an aesthetic reviewer for Mays-brand decks. You will receive a BrandedDeckPlan. Critique it ONLY on these axes and emit a REVISED plan in the same schema.

CHECKS:
1. Headlines are at most 8 words and sentence case. Rewrite anything over.
2. Body / bullets do not exceed the caps (60 words / 5 bullets / 12 words per bullet). Trim aggressively.
3. Slides with too much text get split if there is a natural break, OR get bullets condensed.
4. Weak headlines (vague verbs, jargon) get rewritten point-first.
5. Long stretches of content slides without a section break get a section divider inserted at the natural chapter boundary.
6. Tables that don't fit into the layout get flagged with "designerNote": "Table omitted; see source deck p. X".
7. Strip any em dashes, en dashes, or AI cheerleader words ("delve", "leverage", "transformative", "robust", "dive into", "embark", "navigate the landscape", etc.).

HEADLINE / BULLET DEDUPLICATION (mandatory):
The first bullet must NOT restate or paraphrase the headline. Bullets should ADD substance beyond the headline, not echo it.

If you find a bullet that restates the headline (semantic overlap > 70%), DROP that bullet. Add a different supporting point if you have one in the source content; otherwise leave the slide with N-1 bullets.

Example:
BAD:
  Headline: "Warmth is the primary driver"
  Bullet 1: "Warmth is the key driver"
  Bullet 2: "Outcomes vary by audience"

GOOD:
  Headline: "Warmth is the primary driver"
  Bullet 1: "Effect strongest in high-stakes contexts (beta = 0.42)"
  Bullet 2: "Outcomes vary by audience"

OUTPUT:
- Output ONLY valid JSON, the same BrandedDeckPlan shape, with "reviewed": true.
- Renumber "index" sequentially after any inserts.
- Preserve "sourceIndex" so the audit trail survives.
- Preserve "notes" verbatim.`;

async function stepReview(plan: BrandedDeckPlan): Promise<BrandedDeckPlan> {
  try {
    const raw = await callHaiku({
      system: STEP4_SYSTEM,
      userPayload: JSON.stringify(plan),
      maxTokens: 4096,
    });
    const out = parseJson<BrandedDeckPlan>(raw);
    if (out && Array.isArray(out.slides) && out.slides.length > 0) {
      out.slides = out.slides.map((s, i) => ({
        ...s,
        index: i + 1,
        layout: (MAYS_LAYOUTS as readonly string[]).includes(s.layout) ? s.layout : 'content',
        // Re-stamp image provenance after the review pass so the LLM
        // cannot accidentally promote synthesized alt to source-provided.
        image: s.image
          ? {
              ...s.image,
              placeholder: true as const,
              altTextFromSource: false,
              imageBytesFromSource: false,
            }
          : undefined,
      }));
      out.slideCount = out.slides.length;
      out.reviewed = true;
      return out;
    }
  } catch {
    // fall through to "as-is".
  }
  return { ...plan, reviewed: true };
}

/* ===========================================================================
 *  Step 5: Accessibility pass
 * ========================================================================= */

const STEP5_SYSTEM = `You are an accessibility reviewer for Mays-brand decks. You will receive a reviewed BrandedDeckPlan. Produce an AccessibilityPlan that the deterministic generator will apply.

For each slide produce an annotation:
- index: matches the BrandedSlide.index
- srTitle: a screen-reader-friendly slide title that conveys the slide's purpose in one sentence (8-15 words). This is the FIRST thing a screen reader announces.
- readingOrder: array of region names in the order they should be read. Allowed values: "title", "eyebrow", "body", "bullets", "image", "designer-note", "footer".
- imageAltText: REQUIRED when the slide has layout="image-caption". A 1-2 sentence description of what the image shows (infer from headline + body + notes if no bytes given).
- links: array of any hyperlinks on the slide with descriptive text (NEVER "click here" / "here" / "link" alone). Empty array if none.
- flaggedColor: true ONLY if the slide relies on color alone to convey meaning (red = bad, green = good with no text). Otherwise omit or set false.

OUTPUT:
- Output ONLY valid JSON: { "slides": [ AccessibilitySlideAnnotation, ... ] }
- One annotation per slide, indices match the input plan.
- Hyperlinks descriptions never use "click here", "here", or "link" alone.`;

async function stepAccessibility(plan: BrandedDeckPlan): Promise<AccessibilityPlan> {
  try {
    const raw = await callHaiku({
      system: STEP5_SYSTEM,
      userPayload: JSON.stringify({ slides: plan.slides }),
      maxTokens: 4096,
    });
    const out = parseJson<AccessibilityPlan>(raw);
    if (out && Array.isArray(out.slides) && out.slides.length > 0) {
      // Sanitize. Image provenance is fixed to "synthesized" because
      // Step 5 generates alt text from slide context (the parser does
      // not extract source alt or image bytes). The generator uses
      // these flags to score honestly.
      out.slides = out.slides.map((a) => ({
        index: typeof a.index === 'number' ? a.index : 0,
        srTitle: String(a.srTitle || '').slice(0, 200),
        readingOrder: Array.isArray(a.readingOrder) ? a.readingOrder.slice(0, 8) : ['title', 'body', 'footer'],
        imageAltText: a.imageAltText ? String(a.imageAltText).slice(0, 400) : undefined,
        imageAltFromSource: false,
        imageBytesFromSource: false,
        links: Array.isArray(a.links)
          ? a.links.map((l) => ({
              url: String(l.url || ''),
              description: String(l.description || ''),
            }))
          : [],
        flaggedColor: Boolean(a.flaggedColor),
      }));
      return out;
    }
  } catch {
    // fall through
  }

  // Deterministic fallback. Reuse the headline as the screen-reader
  // title and assume the standard reading order. Image provenance is
  // synthesized in this branch too (no source extraction yet).
  return {
    slides: plan.slides.map((s) => ({
      index: s.index,
      srTitle: s.headline || `Slide ${s.index}`,
      readingOrder:
        s.layout === 'image-caption'
          ? ['title', 'image', 'body', 'footer']
          : s.layout === 'two-column'
            ? ['title', 'body', 'footer']
            : ['title', 'body', 'footer'],
      imageAltText:
        s.layout === 'image-caption' ? s.image?.altText || s.image?.caption || s.headline : undefined,
      imageAltFromSource: false,
      imageBytesFromSource: false,
      links: [],
      flaggedColor: false,
    })),
  };
}

/* ===========================================================================
 *  Top-level runner
 * ========================================================================= */

export type RunOutput = {
  pipeline: PipelineResult;
  pptxBuffer: Buffer;
  accessibilityText: string;
};

/**
 * End-to-end runner. Parse the upload, walk steps 1..5 on Haiku, then
 * call the deterministic generator. Returns the final .pptx buffer plus
 * the accessibility text and the structured pipeline result.
 *
 * If the API key is not configured we throw so the caller can return a
 * clean 503; we do not generate a fake deck silently.
 */
export async function runPipeline(input: { fileBuffer: Buffer }): Promise<RunOutput> {
  if (!isApiKeyConfigured()) {
    throw new Error('ANTHROPIC_API_KEY is not configured.');
  }

  const parsed = await parsePptx(input.fileBuffer);
  if (parsed.slideCount === 0) {
    throw new Error('No slides could be parsed from the upload.');
  }
  if (parsed.slideCount > MAX_SLIDES) {
    throw new Error(`Deck exceeds the ${MAX_SLIDES}-slide cap.`);
  }

  const synthesized = await stepSynthesize(parsed);
  const brandStudy = await stepBrandStudy(synthesized);
  const initialPlan = await stepPlan(synthesized, brandStudy);
  const reviewedPlan = await stepReview(initialPlan);
  const accessibilityPlan = await stepAccessibility(reviewedPlan);

  const { buffer, report } = await generatePptx({
    plan: reviewedPlan,
    accessibility: accessibilityPlan,
  });
  const accessibilityText = renderAccessibilityText(report);

  const pipeline: PipelineResult = {
    synthesized,
    brandStudy,
    plan: reviewedPlan,
    accessibility: { plan: accessibilityPlan, report },
  };

  return { pipeline, pptxBuffer: buffer, accessibilityText };
}

/**
 * Re-export the brand info so the API route can include it in the
 * response without importing brand.ts directly. Tiny convenience.
 */
export const PIPELINE_BRAND = MAYS_BRAND;

/**
 * Suppress unused-import warning for AccessibilityReport when the
 * generator's report is used solely via the rendered text.
 */
export type { AccessibilityReport };
