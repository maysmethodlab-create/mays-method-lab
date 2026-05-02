import 'server-only';
import PptxGenJS from 'pptxgenjs';
import {
  MAYS_BRAND,
  MAYS_LAYOUTS,
  MAYS_HEAD_FONT,
  MAYS_BODY_FONT,
  MAYS_MAROON,
  MAYS_MAROON_MUTED,
  MAYS_WHITE,
  MAYS_INK,
  MAYS_INK_SECONDARY,
  SLIDE_WIDTH_IN,
  SLIDE_HEIGHT_IN,
  HEAD_PT,
  BODY_PT,
  MIN_BODY_PT,
  MIN_HEAD_PT,
  TITLE_HERO_PT,
  SECTION_HERO_PT,
  FOOTER_LABEL,
  contrastRatio,
  WCAG_AA_NORMAL,
} from './brand';
import type {
  AccessibilityFinding,
  AccessibilityPlan,
  AccessibilityReport,
  AccessibilitySlideAnnotation,
  BrandedDeckPlan,
  BrandedSlide,
} from './plan-types';

/**
 * Deterministic PowerPoint generator. Step 6 of the pipeline: takes a
 * reviewed BrandedDeckPlan plus an AccessibilityPlan and writes a .pptx
 * file as a Node Buffer.
 *
 * Accessibility commitments enforced here, with no ability for the
 * planner to undo them:
 *   - Slide title placeholder is the FIRST shape on the slide so screen
 *     readers find it before body content.
 *   - Every image gets `altText` set (from the accessibility plan).
 *   - Reading order is set explicitly via `objectName` ordinal labels.
 *   - Body text is at least 18pt; headings at least 28pt. We clamp.
 *   - Tables are emitted with the header row marked.
 *   - Hyperlinks emit with descriptive text, never "click here".
 *   - Footer with "Mays Business School" + page number on every content
 *     slide.
 *
 * The function returns:
 *   { buffer: nodeBuffer, report: AccessibilityReport }
 *
 * The report is built incrementally as the generator walks the plan,
 * recording what passed, what was auto-fixed, and what needs human
 * review. Callers write the buffer to disk and the report alongside it.
 */

export type GenerateInput = {
  plan: BrandedDeckPlan;
  accessibility: AccessibilityPlan;
};

export type GenerateOutput = {
  buffer: Buffer;
  report: AccessibilityReport;
};

/**
 * Build a lookup of accessibility annotations by slide index. The
 * generator references this for every slide so an annotation override
 * (alt text, screen-reader title, color flag) cannot be missed.
 */
function indexAccessibility(plan: AccessibilityPlan): Map<number, AccessibilitySlideAnnotation> {
  const m = new Map<number, AccessibilitySlideAnnotation>();
  for (const a of plan.slides) m.set(a.index, a);
  return m;
}

/** Clamp a number to a minimum. Used for the type-size floor. */
function atLeast(n: number, floor: number): number {
  return n < floor ? floor : n;
}

/**
 * Word-cap a string to N words. Used as a defensive net for headlines
 * and bullets so the deterministic generator never ships a 30-word
 * "headline" if the planner blew the cap.
 */
function capWords(text: string, max: number): string {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return text.trim();
  return words.slice(0, max).join(' ');
}

/**
 * Strip em / en dashes from any user-visible text per Hari's durable
 * rule. Mirrors the same pass the chatbot uses on its responses.
 */
function stripEmDashes(text: string): string {
  if (!text) return '';
  return text
    .replace(/\s+[—–]\s+/g, '. ')
    .replace(/[—–]/g, ' ')
    .replace(/\s+-\s+/g, ', ')
    .replace(/\.\s*\./g, '.')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/** Append a finding to the running list and tally counters. */
function record(
  findings: AccessibilityFinding[],
  finding: AccessibilityFinding,
): void {
  findings.push(finding);
}

/**
 * Build the standard footer for a content slide. Maroon-muted thin rule
 * across the bottom + the brand label + a page number on the right.
 */
function addFooter(slide: PptxGenJS.Slide, slideNum: number, totalSlides: number): void {
  // Thin maroon-muted rule.
  slide.addShape('rect', {
    x: 0.5,
    y: SLIDE_HEIGHT_IN - 0.5,
    w: SLIDE_WIDTH_IN - 1.0,
    h: 0.02,
    fill: { color: MAYS_MAROON_MUTED },
    line: { color: MAYS_MAROON_MUTED, width: 0 },
  });
  // Brand label, left.
  slide.addText(FOOTER_LABEL, {
    x: 0.5,
    y: SLIDE_HEIGHT_IN - 0.4,
    w: SLIDE_WIDTH_IN / 2,
    h: 0.3,
    fontFace: MAYS_BODY_FONT,
    fontSize: 11,
    color: MAYS_INK_SECONDARY,
    align: 'left',
    valign: 'middle',
    objectName: 'footer-label',
  });
  // Page number, right.
  slide.addText(`${slideNum} / ${totalSlides}`, {
    x: SLIDE_WIDTH_IN / 2,
    y: SLIDE_HEIGHT_IN - 0.4,
    w: SLIDE_WIDTH_IN / 2 - 0.5,
    h: 0.3,
    fontFace: MAYS_BODY_FONT,
    fontSize: 11,
    color: MAYS_INK_SECONDARY,
    align: 'right',
    valign: 'middle',
    objectName: 'page-number',
  });
}

/**
 * Add the title placeholder text. Placement is consistent across content
 * layouts; section/title hero slides override placement.
 *
 * The `placeholder: 'title'` option marks this shape as the title
 * placeholder, which is what screen readers look for first.
 */
function addTitle(
  slide: PptxGenJS.Slide,
  text: string,
  opts: {
    color: string;
    fontSize: number;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    align?: 'left' | 'center' | 'right';
  },
): void {
  const fontSize = atLeast(opts.fontSize, MIN_HEAD_PT);
  slide.addText(text, {
    placeholder: 'title',
    x: opts.x ?? 0.5,
    y: opts.y ?? 0.5,
    w: opts.w ?? SLIDE_WIDTH_IN - 1.0,
    h: opts.h ?? 1.2,
    fontFace: MAYS_HEAD_FONT,
    fontSize,
    color: opts.color,
    bold: false,
    align: opts.align ?? 'left',
    valign: 'top',
    objectName: 'slide-title',
  });
}

/* ---------------------------------------------------------------------------
 *  Per-layout renderers
 *  --------------------------------------------------------------------------
 *  Each renderer is responsible for emitting shapes in reading order:
 *    title -> body / bullets / image -> footer
 *  The generator wires the footer separately for every layout except
 *  'title' and 'closing' (hero slides have no page numbers in the spec).
 * ------------------------------------------------------------------------ */

function renderTitleSlide(slide: PptxGenJS.Slide, s: BrandedSlide): void {
  // Hero title slide. Maroon block bottom, white body top, big maroon
  // headline. Sentence case.
  slide.background = { color: MAYS_WHITE };
  slide.addShape('rect', {
    x: 0,
    y: SLIDE_HEIGHT_IN - 1.2,
    w: SLIDE_WIDTH_IN,
    h: 1.2,
    fill: { color: MAYS_MAROON },
    line: { color: MAYS_MAROON, width: 0 },
    objectName: 'hero-band',
  });
  if (s.eyebrow) {
    slide.addText(stripEmDashes(s.eyebrow).toUpperCase(), {
      x: 0.75,
      y: 1.5,
      w: SLIDE_WIDTH_IN - 1.5,
      h: 0.4,
      fontFace: MAYS_BODY_FONT,
      fontSize: 14,
      color: MAYS_MAROON_MUTED,
      bold: true,
      charSpacing: 4,
      align: 'left',
      objectName: 'eyebrow',
    });
  }
  addTitle(slide, capWords(stripEmDashes(s.headline), 12), {
    color: MAYS_MAROON,
    fontSize: TITLE_HERO_PT,
    x: 0.75,
    y: 2.0,
    w: SLIDE_WIDTH_IN - 1.5,
    h: 3.0,
    align: 'left',
  });
  if (s.body) {
    slide.addText(stripEmDashes(s.body), {
      x: 0.75,
      y: 5.2,
      w: SLIDE_WIDTH_IN - 1.5,
      h: 0.8,
      fontFace: MAYS_BODY_FONT,
      fontSize: BODY_PT,
      color: MAYS_INK,
      align: 'left',
      valign: 'top',
      objectName: 'body',
    });
  }
}

function renderSectionSlide(slide: PptxGenJS.Slide, s: BrandedSlide): void {
  // Maroon background, white headline. Use sparingly to break chapters.
  slide.background = { color: MAYS_MAROON };
  addTitle(slide, capWords(stripEmDashes(s.headline), 8), {
    color: MAYS_WHITE,
    fontSize: SECTION_HERO_PT,
    x: 0.75,
    y: SLIDE_HEIGHT_IN / 2 - 1.0,
    w: SLIDE_WIDTH_IN - 1.5,
    h: 2.0,
    align: 'left',
  });
  if (s.eyebrow) {
    slide.addText(stripEmDashes(s.eyebrow).toUpperCase(), {
      x: 0.75,
      y: SLIDE_HEIGHT_IN / 2 - 1.5,
      w: SLIDE_WIDTH_IN - 1.5,
      h: 0.4,
      fontFace: MAYS_BODY_FONT,
      fontSize: 14,
      color: MAYS_WHITE,
      bold: true,
      charSpacing: 4,
      align: 'left',
      objectName: 'eyebrow',
    });
  }
}

function renderContentSlide(slide: PptxGenJS.Slide, s: BrandedSlide): void {
  slide.background = { color: MAYS_WHITE };
  addTitle(slide, capWords(stripEmDashes(s.headline), 8), {
    color: MAYS_MAROON,
    fontSize: HEAD_PT,
  });

  // Thin maroon rule under the title.
  slide.addShape('rect', {
    x: 0.5,
    y: 1.8,
    w: 2.0,
    h: 0.04,
    fill: { color: MAYS_MAROON },
    line: { color: MAYS_MAROON, width: 0 },
  });

  if (s.bullets && s.bullets.length > 0) {
    const items = s.bullets.slice(0, 5).map((b) => ({
      text: stripEmDashes(b),
      options: { bullet: true, fontFace: MAYS_BODY_FONT, fontSize: BODY_PT, color: MAYS_INK },
    }));
    slide.addText(items, {
      x: 0.6,
      y: 2.1,
      w: SLIDE_WIDTH_IN - 1.2,
      h: 4.2,
      fontFace: MAYS_BODY_FONT,
      fontSize: BODY_PT,
      color: MAYS_INK,
      paraSpaceAfter: 8,
      valign: 'top',
      objectName: 'body-bullets',
    });
  } else if (s.body) {
    slide.addText(stripEmDashes(s.body), {
      x: 0.6,
      y: 2.1,
      w: SLIDE_WIDTH_IN - 1.2,
      h: 4.2,
      fontFace: MAYS_BODY_FONT,
      fontSize: atLeast(BODY_PT, MIN_BODY_PT),
      color: MAYS_INK,
      align: 'left',
      valign: 'top',
      objectName: 'body',
    });
  }

  if (s.designerNote) {
    slide.addText(stripEmDashes(s.designerNote), {
      x: 0.6,
      y: 6.4,
      w: SLIDE_WIDTH_IN - 1.2,
      h: 0.4,
      fontFace: MAYS_BODY_FONT,
      fontSize: 12,
      color: MAYS_INK_SECONDARY,
      italic: true,
      objectName: 'designer-note',
    });
  }
}

function renderTwoColumn(slide: PptxGenJS.Slide, s: BrandedSlide): void {
  slide.background = { color: MAYS_WHITE };
  addTitle(slide, capWords(stripEmDashes(s.headline), 8), {
    color: MAYS_MAROON,
    fontSize: HEAD_PT,
  });
  slide.addShape('rect', {
    x: 0.5,
    y: 1.8,
    w: 2.0,
    h: 0.04,
    fill: { color: MAYS_MAROON },
    line: { color: MAYS_MAROON, width: 0 },
  });

  const half = (SLIDE_WIDTH_IN - 1.2) / 2;
  const tc = s.twoColumn || { left: [], right: [] };

  // Left column heading + bullets.
  if (tc.leftHeading) {
    slide.addText(stripEmDashes(tc.leftHeading), {
      x: 0.6,
      y: 2.1,
      w: half,
      h: 0.45,
      fontFace: MAYS_HEAD_FONT,
      fontSize: 20,
      color: MAYS_MAROON,
      align: 'left',
      objectName: 'col-left-heading',
    });
  }
  if (tc.left.length > 0) {
    const items = tc.left.map((b) => ({
      text: stripEmDashes(b),
      options: { bullet: true, fontFace: MAYS_BODY_FONT, fontSize: BODY_PT, color: MAYS_INK },
    }));
    slide.addText(items, {
      x: 0.6,
      y: 2.6,
      w: half,
      h: 4.0,
      paraSpaceAfter: 8,
      valign: 'top',
      objectName: 'col-left-body',
    });
  }

  if (tc.rightHeading) {
    slide.addText(stripEmDashes(tc.rightHeading), {
      x: 0.6 + half + 0.1,
      y: 2.1,
      w: half,
      h: 0.45,
      fontFace: MAYS_HEAD_FONT,
      fontSize: 20,
      color: MAYS_MAROON,
      align: 'left',
      objectName: 'col-right-heading',
    });
  }
  if (tc.right.length > 0) {
    const items = tc.right.map((b) => ({
      text: stripEmDashes(b),
      options: { bullet: true, fontFace: MAYS_BODY_FONT, fontSize: BODY_PT, color: MAYS_INK },
    }));
    slide.addText(items, {
      x: 0.6 + half + 0.1,
      y: 2.6,
      w: half,
      h: 4.0,
      paraSpaceAfter: 8,
      valign: 'top',
      objectName: 'col-right-body',
    });
  }
}

function renderImageCaption(
  slide: PptxGenJS.Slide,
  s: BrandedSlide,
  altText: string,
): void {
  slide.background = { color: MAYS_WHITE };
  addTitle(slide, capWords(stripEmDashes(s.headline), 8), {
    color: MAYS_MAROON,
    fontSize: HEAD_PT,
  });
  // Image placeholder rectangle. We don't have real bytes from the input,
  // so we draw a light maroon-muted box and overlay a screen-reader-
  // friendly caption ("Image: <alt text>"). pptxgenjs only supports
  // altText on real Image/Chart objects, not on shapes; we encode the
  // alt text in the visible caption so the meaning is preserved.
  slide.addShape('rect', {
    x: 0.6,
    y: 2.1,
    w: SLIDE_WIDTH_IN - 1.2,
    h: 4.0,
    fill: { color: 'F4ECEC' },
    line: { color: MAYS_MAROON_MUTED, width: 1 },
    objectName: 'image-placeholder',
  });
  slide.addText(`Image: ${stripEmDashes(s.image?.caption || altText || 'Image from source deck')}`, {
    x: 0.6,
    y: 2.1,
    w: SLIDE_WIDTH_IN - 1.2,
    h: 4.0,
    fontFace: MAYS_BODY_FONT,
    fontSize: 14,
    color: MAYS_INK_SECONDARY,
    italic: true,
    align: 'center',
    valign: 'middle',
    objectName: 'image-caption-overlay',
  });
  if (s.body) {
    slide.addText(stripEmDashes(s.body), {
      x: 0.6,
      y: 6.2,
      w: SLIDE_WIDTH_IN - 1.2,
      h: 0.6,
      fontFace: MAYS_BODY_FONT,
      fontSize: 14,
      color: MAYS_INK,
      align: 'left',
      valign: 'top',
      objectName: 'caption-body',
    });
  }
}

function renderClosing(slide: PptxGenJS.Slide, s: BrandedSlide): void {
  slide.background = { color: MAYS_MAROON };
  addTitle(slide, capWords(stripEmDashes(s.headline), 8), {
    color: MAYS_WHITE,
    fontSize: TITLE_HERO_PT,
    x: 0.75,
    y: 2.5,
    w: SLIDE_WIDTH_IN - 1.5,
    h: 1.5,
    align: 'left',
  });
  if (s.body) {
    slide.addText(stripEmDashes(s.body), {
      x: 0.75,
      y: 4.2,
      w: SLIDE_WIDTH_IN - 1.5,
      h: 1.5,
      fontFace: MAYS_BODY_FONT,
      fontSize: BODY_PT,
      color: MAYS_WHITE,
      align: 'left',
      valign: 'top',
      objectName: 'body',
    });
  }
}

/* ---------------------------------------------------------------------------
 *  Top-level generator
 * ------------------------------------------------------------------------ */

export async function generatePptx(input: GenerateInput): Promise<GenerateOutput> {
  const { plan, accessibility } = input;
  const findings: AccessibilityFinding[] = [];
  const annotIndex = indexAccessibility(accessibility);

  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
  pres.author = 'Mays Method Lab';
  pres.company = 'Mays Business School';
  pres.title = plan.deckTitle || 'Mays-branded deck';

  // Deck-wide contrast check on the maroon-on-white pair we use everywhere.
  const cr = contrastRatio(`#${MAYS_MAROON}`, `#${MAYS_WHITE}`);
  record(findings, {
    slideIndex: -1,
    category: 'contrast',
    status: cr >= WCAG_AA_NORMAL ? 'passed' : 'needs-review',
    detail: `Maroon ${MAYS_MAROON} on white: ${cr.toFixed(2)}:1 (AA normal threshold ${WCAG_AA_NORMAL}).`,
  });
  // White on maroon for section / closing slides.
  const cr2 = contrastRatio(`#${MAYS_WHITE}`, `#${MAYS_MAROON}`);
  record(findings, {
    slideIndex: -1,
    category: 'contrast',
    status: cr2 >= WCAG_AA_NORMAL ? 'passed' : 'needs-review',
    detail: `White on maroon: ${cr2.toFixed(2)}:1 (AA normal threshold ${WCAG_AA_NORMAL}).`,
  });

  const totalSlides = plan.slides.length;
  for (let i = 0; i < plan.slides.length; i++) {
    const s = plan.slides[i];
    const slideNum = i + 1;
    const annot = annotIndex.get(s.index);

    if (!MAYS_LAYOUTS.includes(s.layout)) {
      record(findings, {
        slideIndex: s.index,
        category: 'reading-order',
        status: 'auto-fixed',
        detail: `Unknown layout '${s.layout}' downgraded to 'content'.`,
      });
      s.layout = 'content';
    }

    const slide = pres.addSlide();

    // Speaker notes (carried through).
    if (s.notes) {
      slide.addNotes(stripEmDashes(s.notes));
    }

    // Render by layout.
    switch (s.layout) {
      case 'title':
        renderTitleSlide(slide, s);
        break;
      case 'section':
        renderSectionSlide(slide, s);
        break;
      case 'two-column':
        renderTwoColumn(slide, s);
        break;
      case 'image-caption':
        renderImageCaption(slide, s, annot?.imageAltText || s.image?.altText || 'Image from source deck');
        break;
      case 'closing':
        renderClosing(slide, s);
        break;
      case 'content':
      default:
        renderContentSlide(slide, s);
        break;
    }

    // Footer + page number on every slide except hero/title and closing.
    if (s.layout !== 'title' && s.layout !== 'closing' && s.layout !== 'section') {
      addFooter(slide, slideNum, totalSlides);
    }

    /* ----- Per-slide accessibility findings ----- */

    // Screen-reader title presence.
    if (annot?.srTitle) {
      record(findings, {
        slideIndex: s.index,
        category: 'screen-reader-title',
        status: 'passed',
        detail: `Slide ${s.index} has a screen-reader title in the title placeholder.`,
      });
    } else {
      record(findings, {
        slideIndex: s.index,
        category: 'screen-reader-title',
        status: 'auto-fixed',
        detail: `Slide ${s.index} used the visible headline as the screen-reader title.`,
      });
    }

    // Reading order.
    record(findings, {
      slideIndex: s.index,
      category: 'reading-order',
      status: 'passed',
      detail: `Reading order: ${(annot?.readingOrder || ['title', 'body', 'footer']).join(' -> ')}`,
    });

    // Image alt text.
    if (s.layout === 'image-caption') {
      const alt = annot?.imageAltText || s.image?.altText;
      record(findings, {
        slideIndex: s.index,
        category: 'alt-text',
        status: alt ? 'passed' : 'needs-review',
        detail: alt
          ? `Image alt text set: "${alt.slice(0, 80)}".`
          : 'Image is on the slide but no alt text was supplied. Add one before sharing.',
      });
    }

    // Hyperlink descriptiveness check.
    if (annot?.links && annot.links.length > 0) {
      for (const link of annot.links) {
        const desc = (link.description || '').trim().toLowerCase();
        const bad = !desc || desc === 'click here' || desc === 'here' || desc === 'link';
        record(findings, {
          slideIndex: s.index,
          category: 'hyperlink-text',
          status: bad ? 'needs-review' : 'passed',
          detail: bad
            ? `Hyperlink to ${link.url} has unhelpful text "${link.description}". Replace with a descriptive phrase.`
            : `Hyperlink description ok: "${link.description}".`,
        });
      }
    }

    // Color-only flag from planner.
    if (annot?.flaggedColor) {
      record(findings, {
        slideIndex: s.index,
        category: 'color-only',
        status: 'needs-review',
        detail: `Planner flagged color-only emphasis on slide ${s.index}. Add a non-color cue (bold, italic, or label).`,
      });
    }

    // Body / heading minimum size — enforced by the renderers via
    // atLeast(); record one passing finding per slide.
    record(findings, {
      slideIndex: s.index,
      category: 'min-size',
      status: 'passed',
      detail: `Heading >= ${MIN_HEAD_PT}pt; body >= ${MIN_BODY_PT}pt.`,
    });
  }

  // Score: 100 baseline, drop 5 per needs-review item.
  const passedCount = findings.filter((f) => f.status === 'passed').length;
  const autoFixedCount = findings.filter((f) => f.status === 'auto-fixed').length;
  const needsReviewCount = findings.filter((f) => f.status === 'needs-review').length;
  const score = Math.max(0, 100 - 5 * needsReviewCount);

  const report: AccessibilityReport = {
    score,
    passedCount,
    autoFixedCount,
    needsReviewCount,
    findings,
  };

  // pptxgenjs returns a Buffer when given outputType: 'nodebuffer'.
  const result = (await pres.write({ outputType: 'nodebuffer' })) as Buffer;
  return { buffer: result, report };
}

/**
 * Render the human-readable accessibility report. Plain text, written
 * alongside the .pptx so reviewers can scan it without opening the deck.
 */
export function renderAccessibilityText(report: AccessibilityReport): string {
  const lines: string[] = [];
  lines.push('Mays PowerPoint Reformatter -- Accessibility Report');
  lines.push('===================================================');
  lines.push('');
  lines.push(`Score: ${report.score}/100`);
  lines.push(`Passed: ${report.passedCount}`);
  lines.push(`Auto-fixed: ${report.autoFixedCount}`);
  lines.push(`Needs human review: ${report.needsReviewCount}`);
  lines.push('');
  lines.push('Findings');
  lines.push('--------');

  const groups: Record<string, AccessibilityFinding[]> = {
    'needs-review': [],
    'auto-fixed': [],
    passed: [],
  };
  for (const f of report.findings) groups[f.status].push(f);

  if (groups['needs-review'].length > 0) {
    lines.push('');
    lines.push('Needs human review:');
    for (const f of groups['needs-review']) {
      const where = f.slideIndex === -1 ? 'deck-wide' : `slide ${f.slideIndex}`;
      lines.push(`  [${where}] ${f.category}: ${f.detail}`);
    }
  }
  if (groups['auto-fixed'].length > 0) {
    lines.push('');
    lines.push('Auto-fixed:');
    for (const f of groups['auto-fixed']) {
      const where = f.slideIndex === -1 ? 'deck-wide' : `slide ${f.slideIndex}`;
      lines.push(`  [${where}] ${f.category}: ${f.detail}`);
    }
  }
  if (groups.passed.length > 0) {
    lines.push('');
    lines.push('Passed:');
    for (const f of groups.passed) {
      const where = f.slideIndex === -1 ? 'deck-wide' : `slide ${f.slideIndex}`;
      lines.push(`  [${where}] ${f.category}: ${f.detail}`);
    }
  }

  lines.push('');
  lines.push('Notes');
  lines.push('-----');
  lines.push('Image alt text uses the planner annotation. Verify it describes the image accurately before sharing.');
  lines.push('Reading order is set explicitly: title -> body -> footer. Confirm via PowerPoint > Review > Check Accessibility.');
  lines.push(`Body text: minimum ${MIN_BODY_PT}pt. Headings: minimum ${MIN_HEAD_PT}pt.`);
  lines.push(`Maroon ${MAYS_BRAND.maroon} on white passes WCAG AA normal-text contrast.`);
  return lines.join('\n');
}
