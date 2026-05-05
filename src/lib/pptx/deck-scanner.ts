import 'server-only';
import JSZip from 'jszip';

/**
 * Deck Analyzer — pre-flight scanner for PowerPoint files.
 *
 * Reads a .pptx (or .pptm) file and returns two structured reports:
 *
 *   1. Reliability findings — categorizes every element type in the deck
 *      (text frames, images, tables, charts, SmartArt, embedded video,
 *      etc.) by how reliably it can be carried through a master-swap
 *      conversion to the Mays template. Three buckets:
 *        ✅ RELIABLE — content preserved verbatim, formatting picks up
 *           the new template
 *        ⚠️ DEGRADED — content survives but with cosmetic shifts (theme
 *           colors update on charts, hardcoded fonts stay hardcoded,
 *           etc.)
 *        ❌ UNSUPPORTED — element cannot be reliably preserved
 *           (embedded video/audio/OLE, ink, etc.)
 *
 *   2. Accessibility findings — checks against the most actionable WCAG
 *      / Office 365 accessibility rules. Per-slide flags for:
 *        - Images without alt text
 *        - Slides without a title placeholder
 *        - Hyperlinks with vague text ("click here", "here", "link")
 *        - Tables without a header row
 *
 * Both reports feed the analyzer UI, which presents them as a pre-flight
 * decision card: 🟢 proceed / 🟡 proceed with eyes open / 🟠 partial
 * conversion / 🔴 don't run through the tool.
 *
 * No LLM calls. Pure static analysis of OOXML.
 */

/* ===========================================================================
 *  Types
 * ========================================================================= */

export type ReliabilityStatus = 'reliable' | 'degraded' | 'unsupported';

export type ReliabilityFinding = {
  /** Human-readable element category, e.g. "Text frames", "Charts (column/bar)". */
  type: string;
  count: number;
  status: ReliabilityStatus;
  /** One-sentence explanation shown in the UI. */
  note: string;
};

export type AccessibilitySeverity = 'critical' | 'major' | 'minor' | 'info';

export type AccessibilityIssueType =
  | 'missing-alt-text'
  | 'no-slide-title'
  | 'unlabeled-link'
  | 'unstructured-table'
  | 'reading-order-unclear';

export type AccessibilityIssue = {
  slideIndex: number;
  severity: AccessibilitySeverity;
  type: AccessibilityIssueType;
  description: string;
};

export type DeckOverallRecommendation = 'green' | 'yellow' | 'orange' | 'red';

export type DeckScanReport = {
  /** Top-level metadata about the file. */
  deck: {
    fileName: string;
    fileSize: number;
    fileFormat: 'pptx' | 'pptm' | 'unsupported';
    slideCount: number;
    isMacroEnabled: boolean;
    isPasswordProtected: boolean;
    parseError?: string;
  };
  /** Reliability findings, grouped by element type. */
  reliability: {
    findings: ReliabilityFinding[];
    summary: {
      reliable: number;
      degraded: number;
      unsupported: number;
    };
    /** Overall traffic-light recommendation for whether to convert. */
    recommendation: DeckOverallRecommendation;
    /** Per-slide breakdown so the UI can highlight which slides are at risk. */
    perSlide: Array<{
      slideIndex: number;
      status: ReliabilityStatus;
      reasons: string[];
    }>;
  };
  /** Accessibility findings (WCAG / Office 365 rules). */
  accessibility: {
    issues: AccessibilityIssue[];
    summary: {
      critical: number;
      major: number;
      minor: number;
      info: number;
    };
    /** 0-100 score: 100 = no issues; deductions per severity. */
    score: number;
  };
};

/* ===========================================================================
 *  XML helpers (regex-based, no DOM parser)
 * ========================================================================= */

function countMatches(xml: string, re: RegExp): number {
  const m = xml.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'));
  return m ? m.length : 0;
}

function hasMatch(xml: string, re: RegExp): boolean {
  return re.test(xml);
}

/** True when the slide XML contains a `<p:graphicFrame>` of the given URI kind. */
function containsGraphicFrame(slideXml: string, uriFragment: string): boolean {
  const re = new RegExp(
    `<p:graphicFrame\\b[\\s\\S]*?<a:graphicData[^>]*uri="[^"]*${uriFragment}[^"]*"`,
    'i',
  );
  return re.test(slideXml);
}

function countGraphicFrames(slideXml: string, uriFragment: string): number {
  const re = new RegExp(
    `<p:graphicFrame\\b[\\s\\S]*?<a:graphicData[^>]*uri="[^"]*${uriFragment}[^"]*"`,
    'gi',
  );
  return countMatches(slideXml, re);
}

/* ===========================================================================
 *  Per-slide scanner
 * ========================================================================= */

type PerSlideCounts = {
  slideIndex: number;
  textFrames: number;
  pictures: number;
  picturesMissingAlt: number;
  tablesBasic: number;
  tablesWithMergedCells: number;
  tablesWithoutHeader: number;
  charts: number;
  smartArt: number;
  oleObjects: number;
  embeddedVideo: number;
  embeddedAudio: number;
  ink: number;
  connectors: number;
  groups: number;
  hyperlinks: number;
  unlabeledLinks: number;
  hasAnimations: boolean;
  hasTitle: boolean;
};

function scanSlide(xml: string, slideIndex: number): PerSlideCounts {
  const counts: PerSlideCounts = {
    slideIndex,
    textFrames: 0,
    pictures: 0,
    picturesMissingAlt: 0,
    tablesBasic: 0,
    tablesWithMergedCells: 0,
    tablesWithoutHeader: 0,
    charts: 0,
    smartArt: 0,
    oleObjects: 0,
    embeddedVideo: 0,
    embeddedAudio: 0,
    ink: 0,
    connectors: 0,
    groups: 0,
    hyperlinks: 0,
    unlabeledLinks: 0,
    hasAnimations: false,
    hasTitle: false,
  };

  // Text frames: `<p:sp>` shapes that contain `<p:txBody>` text. Note that
  // `<p:sp>` without text is still a "shape" but may be a connector or a
  // pure decorative shape. We count SHAPES WITH TEXT as "text frames".
  // A shape without text is still preserved on master-swap, but it's not a
  // "text frame" for accessibility purposes.
  const spRegex = /<p:sp\b[\s\S]*?<\/p:sp>/g;
  let m: RegExpExecArray | null;
  while ((m = spRegex.exec(xml)) !== null) {
    if (/<p:txBody\b/.test(m[0])) counts.textFrames += 1;
    if (/<p:ph\b[^>]*type="(?:ctrTitle|title)"/i.test(m[0])) counts.hasTitle = true;
  }

  // Pictures: `<p:pic>` blocks. Each should have alt text in the
  // `<p:nvPicPr><p:cNvPr descr="...">` slot.
  const picRegex = /<p:pic\b[\s\S]*?<\/p:pic>/g;
  while ((m = picRegex.exec(xml)) !== null) {
    counts.pictures += 1;
    // Alt text is in cNvPr's `descr` attribute or `<p:nvPicPr><p:cNvPr title="..."`
    if (!/<p:cNvPr\b[^>]*\bdescr="[^"]+"/i.test(m[0])) {
      counts.picturesMissingAlt += 1;
    }
  }

  // Tables: `<a:tbl>`. Check for merged cells via `gridSpan` or `rowSpan`,
  // and for header row via `firstRow="1"` on `<a:tblPr>`.
  const tblRegex = /<a:tbl\b[\s\S]*?<\/a:tbl>/g;
  while ((m = tblRegex.exec(xml)) !== null) {
    const merged = /\bgridSpan="[2-9]/.test(m[0]) || /\browSpan="[2-9]/.test(m[0]);
    const hasHeader = /<a:tblPr\b[^>]*\bfirstRow="1"/.test(m[0]);
    if (merged) counts.tablesWithMergedCells += 1;
    else counts.tablesBasic += 1;
    if (!hasHeader) counts.tablesWithoutHeader += 1;
  }

  // Charts, SmartArt, OLE — all `<p:graphicFrame>` with different URIs.
  counts.charts += countGraphicFrames(xml, 'drawingml/2006/chart');
  counts.smartArt += countGraphicFrames(xml, 'drawingml/2006/diagram');
  counts.oleObjects += countGraphicFrames(xml, 'presentationml/2006/ole');

  // Video/audio: detect via `<p:videoFile>` or `<p:audioFile>` or
  // `<p:videoLink>` / `<p:audioLink>` patterns inside the slide.
  counts.embeddedVideo += countMatches(xml, /<p:video(?:File|Link)\b/g);
  counts.embeddedAudio += countMatches(xml, /<p:audio(?:File|Link)\b/g);

  // Some videos are wrapped in `<a:videoFile>` extensions in Office 2010+
  counts.embeddedVideo += countMatches(xml, /<a:videoFile\b/g);
  counts.embeddedAudio += countMatches(xml, /<a:audioFile\b/g);

  // Ink (handwriting): `<p:contentPart>` references an inkML part.
  counts.ink += countMatches(xml, /<p:contentPart\b/g);

  // Connectors and groups (informational, no reliability hit).
  counts.connectors += countMatches(xml, /<p:cxnSp\b/g);
  counts.groups += countMatches(xml, /<p:grpSp\b/g);

  // Hyperlinks: `<a:hlinkClick>` elements. Check whether the surrounding
  // run text is a vague placeholder ("click here", "here", "link").
  const hlinkRegex = /<a:r\b[\s\S]*?<a:hlinkClick\b[\s\S]*?<a:t[^>]*>([\s\S]*?)<\/a:t>[\s\S]*?<\/a:r>/g;
  while ((m = hlinkRegex.exec(xml)) !== null) {
    counts.hyperlinks += 1;
    const linkText = m[1].toLowerCase().trim();
    if (
      linkText === 'click here' ||
      linkText === 'here' ||
      linkText === 'link' ||
      linkText === 'this link' ||
      linkText === 'read more' ||
      linkText === 'click' ||
      linkText === ''
    ) {
      counts.unlabeledLinks += 1;
    }
  }
  // Also count direct hlinkClick references without a wrapping run text
  // (those will be picked up as "raw" links — count them but don't flag
  // for vague text since we don't have context).
  const rawHlinks = countMatches(xml, /<a:hlinkClick\b/g);
  if (rawHlinks > counts.hyperlinks) {
    // The regex above only catches links inside text runs. Add the rest
    // as plain links.
    counts.hyperlinks = rawHlinks;
  }

  // Animations: presence of `<p:timing>` block at slide level.
  counts.hasAnimations = hasMatch(xml, /<p:timing\b/);

  return counts;
}

/* ===========================================================================
 *  Aggregation: counts → reliability findings + recommendation
 * ========================================================================= */

function buildReliabilityFindings(
  per: PerSlideCounts[],
): { findings: ReliabilityFinding[]; perSlide: DeckScanReport['reliability']['perSlide']; summary: DeckScanReport['reliability']['summary']; recommendation: DeckOverallRecommendation } {
  const sum = (k: keyof PerSlideCounts): number =>
    per.reduce<number>((acc, s) => acc + (typeof s[k] === 'number' ? (s[k] as number) : 0), 0);
  const animatedSlides = per.filter((s) => s.hasAnimations).length;

  const findings: ReliabilityFinding[] = [];

  // Reliable elements
  const text = sum('textFrames');
  if (text > 0) {
    findings.push({
      type: 'Text frames (titles, body, bullets)',
      count: text,
      status: 'reliable',
      note: 'Preserved verbatim. Theme fonts and colors update to Mays brand.',
    });
  }
  const pics = sum('pictures');
  if (pics > 0) {
    findings.push({
      type: 'Images (PNG/JPG/SVG)',
      count: pics,
      status: 'reliable',
      note: 'Bytes preserved at original resolution; no compression.',
    });
  }
  const basicTables = sum('tablesBasic');
  if (basicTables > 0) {
    findings.push({
      type: 'Tables (basic)',
      count: basicTables,
      status: 'reliable',
      note: 'Rows/columns preserved; theme colors update to Mays brand.',
    });
  }
  const conn = sum('connectors');
  if (conn > 0) {
    findings.push({
      type: 'Connectors (lines, arrows)',
      count: conn,
      status: 'reliable',
      note: 'Geometry preserved; line colors update to Mays accent.',
    });
  }
  const groups = sum('groups');
  if (groups > 0) {
    findings.push({
      type: 'Grouped shapes',
      count: groups,
      status: 'reliable',
      note: 'Group structure preserved.',
    });
  }
  const hlinks = sum('hyperlinks');
  if (hlinks > 0) {
    findings.push({
      type: 'Hyperlinks',
      count: hlinks,
      status: 'reliable',
      note: 'URLs preserved verbatim.',
    });
  }

  // Degraded elements
  const mergedTables = sum('tablesWithMergedCells');
  if (mergedTables > 0) {
    findings.push({
      type: 'Tables with merged cells',
      count: mergedTables,
      status: 'degraded',
      note: 'Content survives. Row/column merges may shift slightly under the new master.',
    });
  }
  const charts = sum('charts');
  if (charts > 0) {
    findings.push({
      type: 'Charts (column, bar, line, etc.)',
      count: charts,
      status: 'degraded',
      note: 'Chart structure preserved. Theme colors update; embedded Excel link may need to be re-attached after.',
    });
  }
  const sa = sum('smartArt');
  if (sa > 0) {
    findings.push({
      type: 'SmartArt graphics',
      count: sa,
      status: 'degraded',
      note: 'Often flattened to a static image. Loses click-to-edit; visual content preserved.',
    });
  }
  if (animatedSlides > 0) {
    findings.push({
      type: 'Slide animations / transitions',
      count: animatedSlides,
      status: 'degraded',
      note: 'Master-bound animations preserved. Custom motion paths may degrade or be lost.',
    });
  }

  // Unsupported elements
  const video = sum('embeddedVideo');
  if (video > 0) {
    findings.push({
      type: 'Embedded video',
      count: video,
      status: 'unsupported',
      note: 'Cannot guarantee playback in the branded output. Recommend: replace with a hyperlink to the video, or process this slide manually.',
    });
  }
  const audio = sum('embeddedAudio');
  if (audio > 0) {
    findings.push({
      type: 'Embedded audio',
      count: audio,
      status: 'unsupported',
      note: 'Cannot guarantee playback in the branded output. Recommend: replace with a transcript link, or process this slide manually.',
    });
  }
  const ole = sum('oleObjects');
  if (ole > 0) {
    findings.push({
      type: 'Embedded objects (Excel/Word)',
      count: ole,
      status: 'unsupported',
      note: 'OLE-embedded files do not roundtrip cleanly. Recommend: paste the content as a table or image instead.',
    });
  }
  const ink = sum('ink');
  if (ink > 0) {
    findings.push({
      type: 'Ink / handwriting annotations',
      count: ink,
      status: 'unsupported',
      note: 'Ink stroke fidelity is not preserved. Recommend: convert the annotation to a text shape.',
    });
  }

  // Per-slide rollup
  const perSlide: DeckScanReport['reliability']['perSlide'] = per.map((s) => {
    const reasons: string[] = [];
    let status: ReliabilityStatus = 'reliable';
    if (s.embeddedVideo > 0) {
      reasons.push(`${s.embeddedVideo} embedded video${s.embeddedVideo > 1 ? 's' : ''}`);
      status = 'unsupported';
    }
    if (s.embeddedAudio > 0) {
      reasons.push(`${s.embeddedAudio} embedded audio`);
      status = 'unsupported';
    }
    if (s.oleObjects > 0) {
      reasons.push(`${s.oleObjects} embedded object${s.oleObjects > 1 ? 's' : ''}`);
      status = 'unsupported';
    }
    if (s.ink > 0) {
      reasons.push(`${s.ink} ink/handwriting element${s.ink > 1 ? 's' : ''}`);
      status = 'unsupported';
    }
    if (status !== 'unsupported') {
      if (s.charts > 0) {
        reasons.push(`${s.charts} chart${s.charts > 1 ? 's' : ''}`);
        status = 'degraded';
      }
      if (s.smartArt > 0) {
        reasons.push(`${s.smartArt} SmartArt`);
        status = 'degraded';
      }
      if (s.tablesWithMergedCells > 0) {
        reasons.push(`${s.tablesWithMergedCells} table${s.tablesWithMergedCells > 1 ? 's' : ''} with merged cells`);
        status = 'degraded';
      }
      if (s.hasAnimations) {
        reasons.push('animations');
        status = 'degraded';
      }
    }
    return { slideIndex: s.slideIndex, status, reasons };
  });

  // Summary counts of slides per bucket
  const summary = {
    reliable: perSlide.filter((s) => s.status === 'reliable').length,
    degraded: perSlide.filter((s) => s.status === 'degraded').length,
    unsupported: perSlide.filter((s) => s.status === 'unsupported').length,
  };

  // Overall recommendation
  let recommendation: DeckOverallRecommendation = 'green';
  if (summary.unsupported > 0) {
    // If MOST slides are unsupported, RED. Otherwise ORANGE.
    const unsupportedRatio = summary.unsupported / perSlide.length;
    recommendation = unsupportedRatio >= 0.5 ? 'red' : 'orange';
  } else if (summary.degraded > 0) {
    recommendation = 'yellow';
  }

  return { findings, perSlide, summary, recommendation };
}

/* ===========================================================================
 *  Accessibility findings
 * ========================================================================= */

function buildAccessibilityFindings(per: PerSlideCounts[]): DeckScanReport['accessibility'] {
  const issues: AccessibilityIssue[] = [];

  for (const s of per) {
    if (s.picturesMissingAlt > 0) {
      issues.push({
        slideIndex: s.slideIndex,
        severity: 'critical',
        type: 'missing-alt-text',
        description: `${s.picturesMissingAlt} image${s.picturesMissingAlt > 1 ? 's' : ''} missing alt text. Screen readers will skip these images entirely.`,
      });
    }
    if (s.unlabeledLinks > 0) {
      issues.push({
        slideIndex: s.slideIndex,
        severity: 'major',
        type: 'unlabeled-link',
        description: `${s.unlabeledLinks} hyperlink${s.unlabeledLinks > 1 ? 's' : ''} use vague text like "click here" or "here". Use descriptive link text instead.`,
      });
    }
    if (!s.hasTitle && s.slideIndex !== 1) {
      // Slide 1 (title slide) often lacks a `title` placeholder; the
      // `ctrTitle` placeholder is used instead. We only flag missing
      // titles on body slides.
      issues.push({
        slideIndex: s.slideIndex,
        severity: 'major',
        type: 'no-slide-title',
        description: 'Slide has no title placeholder. Screen readers rely on slide titles for navigation.',
      });
    }
    if (s.tablesWithoutHeader > 0) {
      issues.push({
        slideIndex: s.slideIndex,
        severity: 'minor',
        type: 'unstructured-table',
        description: `${s.tablesWithoutHeader} table${s.tablesWithoutHeader > 1 ? 's' : ''} without a designated header row. Mark the first row as a header for better accessibility.`,
      });
    }
  }

  const summary = {
    critical: issues.filter((i) => i.severity === 'critical').length,
    major: issues.filter((i) => i.severity === 'major').length,
    minor: issues.filter((i) => i.severity === 'minor').length,
    info: issues.filter((i) => i.severity === 'info').length,
  };

  // Score: start at 100, deduct per severity. Cap deductions at 100.
  let deductions = 0;
  deductions += summary.critical * 15;
  deductions += summary.major * 8;
  deductions += summary.minor * 3;
  deductions += summary.info * 1;
  const score = Math.max(0, 100 - deductions);

  return { issues, summary, score };
}

/* ===========================================================================
 *  Top-level scanner
 * ========================================================================= */

/**
 * Scan a .pptx / .pptm buffer and return the structured report. Never
 * throws on bad files — surfaces the problem in `deck.parseError` instead.
 */
export async function scanDeck(args: {
  fileName: string;
  buffer: Buffer;
}): Promise<DeckScanReport> {
  const fileSize = args.buffer.length;
  const lowerName = args.fileName.toLowerCase();

  // Quick file-format checks before unzip.
  if (lowerName.endsWith('.ppt')) {
    return emptyReport({
      fileName: args.fileName,
      fileSize,
      fileFormat: 'unsupported',
      slideCount: 0,
      isMacroEnabled: false,
      isPasswordProtected: false,
      parseError:
        'Old .ppt binary format is not supported. Open the file in PowerPoint and "Save as .pptx", then re-upload.',
    });
  }

  // Try to unzip. JSZip throws on encrypted or corrupt files.
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(args.buffer);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown unzip error';
    // Encrypted Office files raise a "Corrupted zip" or "End of central
    // directory" style error from JSZip. Surface a friendly message.
    return emptyReport({
      fileName: args.fileName,
      fileSize,
      fileFormat: 'unsupported',
      slideCount: 0,
      isMacroEnabled: false,
      isPasswordProtected: /encrypt|password|corrupt/i.test(msg),
      parseError:
        /encrypt|password|corrupt/i.test(msg)
          ? 'File appears to be password-protected or encrypted. Remove the password in PowerPoint and re-upload.'
          : `Could not read the file: ${msg}`,
    });
  }

  // Detect macros via [Content_Types].xml and file extension.
  const ctXml = await zip.file('[Content_Types].xml')?.async('string');
  const isMacroEnabled =
    lowerName.endsWith('.pptm') ||
    Boolean(ctXml && /macroEnabled/i.test(ctXml));

  if (isMacroEnabled) {
    return emptyReport({
      fileName: args.fileName,
      fileSize,
      fileFormat: 'pptm',
      slideCount: 0,
      isMacroEnabled: true,
      isPasswordProtected: false,
      parseError:
        'Macro-enabled (.pptm) files are not accepted by the analyzer for security reasons. Re-save without macros and upload the resulting .pptx.',
    });
  }

  // Walk slides via the same logic as parse-input.ts.
  const slidePaths = await readSlideOrder(zip);
  const slideCount = slidePaths.length;

  if (slideCount === 0) {
    return emptyReport({
      fileName: args.fileName,
      fileSize,
      fileFormat: 'pptx',
      slideCount: 0,
      isMacroEnabled: false,
      isPasswordProtected: false,
      parseError:
        'No slides could be parsed from the file. The deck may be empty or in an unexpected format.',
    });
  }

  const perSlide: PerSlideCounts[] = [];
  for (let i = 0; i < slidePaths.length; i++) {
    const slidePath = slidePaths[i];
    const slideFile = zip.file(slidePath);
    if (!slideFile) continue;
    const xml = await slideFile.async('string');
    perSlide.push(scanSlide(xml, i + 1));
  }

  const reliability = buildReliabilityFindings(perSlide);
  const accessibility = buildAccessibilityFindings(perSlide);

  return {
    deck: {
      fileName: args.fileName,
      fileSize,
      fileFormat: 'pptx',
      slideCount,
      isMacroEnabled: false,
      isPasswordProtected: false,
    },
    reliability,
    accessibility,
  };
}

function emptyReport(deck: DeckScanReport['deck']): DeckScanReport {
  return {
    deck,
    reliability: {
      findings: [],
      summary: { reliable: 0, degraded: 0, unsupported: 0 },
      recommendation: 'red',
      perSlide: [],
    },
    accessibility: {
      issues: [],
      summary: { critical: 0, major: 0, minor: 0, info: 0 },
      score: 0,
    },
  };
}

/**
 * Read slide order from `ppt/presentation.xml` and its rels file.
 * Mirrors the helper in parse-input.ts; copied here to keep the scanner
 * self-contained.
 */
async function readSlideOrder(zip: JSZip): Promise<string[]> {
  const presXml = await zip.file('ppt/presentation.xml')?.async('string');
  const relsXml = await zip.file('ppt/_rels/presentation.xml.rels')?.async('string');
  if (!presXml || !relsXml) {
    return Object.keys(zip.files)
      .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
      .sort();
  }
  const rels: Record<string, string> = {};
  const relRe = /<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g;
  let rm: RegExpExecArray | null;
  while ((rm = relRe.exec(relsXml)) !== null) {
    rels[rm[1]] = rm[2];
  }
  const order: string[] = [];
  const sldRe = /<p:sldId\b[^>]*r:id="([^"]+)"/g;
  let sm: RegExpExecArray | null;
  while ((sm = sldRe.exec(presXml)) !== null) {
    const target = rels[sm[1]];
    if (!target) continue;
    const path = target.startsWith('/')
      ? target.slice(1)
      : `ppt/${target.replace(/^\.\//, '')}`;
    order.push(path);
  }
  return order;
}
