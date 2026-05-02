import 'server-only';

/**
 * Mays brand tokens for the PowerPoint Reformatter.
 *
 * Single source of truth shared by the deterministic generator and the
 * accessibility pass. Colors, fonts, layout sizes, font sizes, and the
 * footer label all live here so a brand change is one edit, not nine.
 *
 * Sources:
 *   - docs/BRAND.md (Mays brand contract)
 *   - tailwind.config.ts (Aggie Maroon and maroon-muted hex values)
 *   - mays.tamu.edu (sentence-case Oswald headings, Work Sans body)
 *
 * pptxgenjs accepts hex without the leading "#", which is what we store.
 */

/** Aggie Maroon. The primary brand color, used for headings and accents. */
export const MAYS_MAROON = '500000';

/** Maroon muted. Used for secondary accents and the footer rule. */
export const MAYS_MAROON_MUTED = '732F2F';

/** Pure white for text on maroon backgrounds. */
export const MAYS_WHITE = 'FFFFFF';

/** Body ink. Near-black, never pure black. Mirrors `text-ink-primary`. */
export const MAYS_INK = '111111';

/** Secondary ink for supporting body copy. */
export const MAYS_INK_SECONDARY = '4A4A4A';

/**
 * Heading font. Oswald is the brand display face. PowerPoint substitutes
 * with the closest installed sans serif when Oswald is not present, which
 * is acceptable for the mvp.
 */
export const MAYS_HEAD_FONT = 'Oswald';

/** Body font. Work Sans is the brand body face; Calibri is the fallback. */
export const MAYS_BODY_FONT = 'Work Sans';

/**
 * Slide dimensions in inches. 13.333 x 7.5 is the standard 16:9 widescreen
 * size pptxgenjs uses by default; we name it explicitly so layout math
 * downstream is readable.
 */
export const SLIDE_WIDTH_IN = 13.333;
export const SLIDE_HEIGHT_IN = 7.5;

/**
 * Minimum type sizes (points). The accessibility pass enforces these as
 * a hard floor, regardless of what the planner emits.
 *
 * 18pt body / 28pt heading clears WCAG AA "large text" thresholds and
 * matches common projector-readability guidance.
 */
export const MIN_BODY_PT = 18;
export const MIN_HEAD_PT = 28;

/** Standard heading size for content slides. */
export const HEAD_PT = 32;

/** Standard body size for content slides. */
export const BODY_PT = 18;

/** Title-slide hero size. */
export const TITLE_HERO_PT = 54;

/** Section-header size. */
export const SECTION_HERO_PT = 44;

/** Footer label shown on every content slide. */
export const FOOTER_LABEL = 'Mays Business School';

/**
 * Approved layout names. The planner picks one of these per slide and the
 * generator switches on the same set. Keep additions narrow; every layout
 * costs design review and accessibility validation.
 */
export type MaysLayout =
  | 'title'
  | 'section'
  | 'content'
  | 'two-column'
  | 'image-caption'
  | 'closing';

export const MAYS_LAYOUTS: MaysLayout[] = [
  'title',
  'section',
  'content',
  'two-column',
  'image-caption',
  'closing',
];

/**
 * One-line description per layout. Used in the brand-study LLM prompt so
 * the planner has structured options to choose from instead of inventing
 * its own taxonomy.
 */
export const MAYS_LAYOUT_DESCRIPTIONS: Record<MaysLayout, string> = {
  title: 'Title slide. Hero headline in maroon, optional subtitle, optional speaker line. First slide of the deck.',
  section: 'Section divider. Maroon background with white headline. Use to break the deck into chapters.',
  content: 'Single-column content. One headline, one short body paragraph or up to five bullets.',
  'two-column': 'Two side-by-side columns. Use for compare/contrast or before/after.',
  'image-caption': 'A single image area with a short caption headline. Image alt text required.',
  closing: 'Closing slide. Thank-you headline, contact line, references line.',
};

/**
 * Sharp-corner radius. Mays uses zero-radius rectangles per the brand
 * contract; pptxgenjs has no global radius setting, but every shape we
 * draw passes `rectRadius: 0` to be explicit.
 */
export const SHARP_RADIUS = 0;

/**
 * Minimum WCAG-AA contrast ratio for normal-size body text. The
 * accessibility pass uses this to flag any color combination that drops
 * below the threshold.
 */
export const WCAG_AA_NORMAL = 4.5;

/**
 * Minimum WCAG-AA contrast ratio for large text (18pt+ regular or
 * 14pt+ bold). We let headings (28pt+) ride this looser bar.
 */
export const WCAG_AA_LARGE = 3.0;

/**
 * Compute relative luminance of a hex color per the WCAG formula. Used by
 * the accessibility pass to score color combinations.
 */
function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const channel = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * Compute the WCAG contrast ratio between two hex colors. Range is 1
 * (no contrast) to 21 (black on white).
 */
export function contrastRatio(fgHex: string, bgHex: string): number {
  const l1 = luminance(fgHex);
  const l2 = luminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convenience bundle for downstream importers. Holds the most-used
 * tokens in one object so calls read like `MAYS_BRAND.maroon` instead
 * of importing four constants per file.
 */
export const MAYS_BRAND = {
  maroon: MAYS_MAROON,
  maroonMuted: MAYS_MAROON_MUTED,
  white: MAYS_WHITE,
  ink: MAYS_INK,
  inkSecondary: MAYS_INK_SECONDARY,
  headFont: MAYS_HEAD_FONT,
  bodyFont: MAYS_BODY_FONT,
  slideWidthIn: SLIDE_WIDTH_IN,
  slideHeightIn: SLIDE_HEIGHT_IN,
  minBodyPt: MIN_BODY_PT,
  minHeadPt: MIN_HEAD_PT,
  headPt: HEAD_PT,
  bodyPt: BODY_PT,
  titleHeroPt: TITLE_HERO_PT,
  sectionHeroPt: SECTION_HERO_PT,
  footerLabel: FOOTER_LABEL,
  sharpRadius: SHARP_RADIUS,
} as const;

export type MaysBrand = typeof MAYS_BRAND;
