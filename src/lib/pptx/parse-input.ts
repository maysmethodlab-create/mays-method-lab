import 'server-only';
import JSZip from 'jszip';

/**
 * BRAND-NEW (PowerPoint Reformatter, May 2026).
 *
 * .pptx parser. Takes a buffer of an uploaded .pptx and returns a structured
 * representation of every slide's text. .pptx is a Zip archive of XML; we
 * use jszip to read entries and a tiny regex-based reader to walk the
 * relevant XML nodes. We deliberately avoid a full XML DOM parser — Next.js
 * server runtimes are picky, and our needs (titles, body text, bullets,
 * speaker notes) are limited enough that a regex pass is reliable and
 * dependency-free.
 *
 * What we extract per slide:
 *   - title         : the first text run on a Title placeholder (best effort)
 *   - body          : all other text runs joined by newline
 *   - bullets       : a flat list of `<a:p>` paragraphs (each one bullet/line)
 *   - notes         : speaker notes from notesSlideN.xml
 *   - hasTable      : flag set when at least one `<a:tbl>` is present
 *   - hasImage      : flag set when at least one `<p:pic>` is present
 *   - layoutHint    : the slideLayout filename it references (e.g. "slideLayout1.xml")
 *
 * What we skip:
 *   - shape geometry, x/y/w/h positioning
 *   - embedded charts / SmartArt as structured data
 *   - explicit hierarchy of bullets (lvl attribute is read but flattened)
 *   - animations, transitions, comments
 *
 * Quality bar for v1: handle "vanilla" decks reliably. Decks with embedded
 * objects, custom XML parts, or corrupted Zip entries fall back gracefully
 * — affected slides surface with whatever text we could pull and a note
 * for the LLM to flag.
 */

export type ParsedSlide = {
  index: number;
  title: string;
  body: string;
  bullets: string[];
  notes: string;
  hasTable: boolean;
  hasImage: boolean;
  layoutHint: string;
};

export type ParsedDeck = {
  slideCount: number;
  slides: ParsedSlide[];
};

/**
 * Strip XML tags and decode the small set of XML entities we care about.
 * pptx text is plain text inside `<a:t>` runs; nothing fancy.
 */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/** Pull every `<a:t>...</a:t>` text run out of an XML string, in order. */
function extractTextRuns(xml: string): string[] {
  const out: string[] = [];
  const re = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    out.push(decodeEntities(m[1]));
  }
  return out;
}

/**
 * Walk every `<a:p>` paragraph and concatenate its `<a:t>` runs into a
 * single line. This gives us per-bullet granularity without parsing
 * paragraph-level properties. Empty paragraphs are dropped.
 */
function extractParagraphs(xml: string): string[] {
  const out: string[] = [];
  const re = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const runs = extractTextRuns(m[1]);
    const line = runs.join('').trim();
    if (line) out.push(line);
  }
  return out;
}

/**
 * Detect whether the first `<p:sp>` shape on the slide is a title
 * placeholder. PowerPoint marks title placeholders with
 * `<p:ph type="title"/>` or `<p:ph type="ctrTitle"/>`. We pull text from
 * the FIRST such shape.
 */
function extractTitle(slideXml: string): string {
  // Capture each shape (sp) and pick the one whose ph element is title-like.
  const spRe = /<p:sp\b[\s\S]*?<\/p:sp>/g;
  let m: RegExpExecArray | null;
  while ((m = spRe.exec(slideXml)) !== null) {
    const sp = m[0];
    if (/<p:ph\b[^>]*type="(?:ctrTitle|title)"/i.test(sp)) {
      const runs = extractTextRuns(sp);
      const text = runs.join(' ').trim();
      if (text) return text;
    }
  }
  return '';
}

/**
 * Extract body content: every paragraph in the slide that is NOT inside the
 * title placeholder shape. We approximate this by removing title shapes
 * before walking paragraphs.
 */
function extractBodyAndBullets(slideXml: string): { body: string; bullets: string[] } {
  // Strip title placeholder shapes so they don't leak into body.
  const stripped = slideXml.replace(
    /<p:sp\b[\s\S]*?<p:ph\b[^>]*type="(?:ctrTitle|title)"[\s\S]*?<\/p:sp>/g,
    '',
  );
  const bullets = extractParagraphs(stripped);
  const body = bullets.join('\n');
  return { body, bullets };
}

/**
 * Read the slide-to-layout relationship from `_rels/slideN.xml.rels` so we
 * can surface a `layoutHint` to the LLM. Best-effort — if the rels file is
 * missing or malformed, return an empty string.
 */
function readLayoutHint(relsXml: string | undefined): string {
  if (!relsXml) return '';
  const m = relsXml.match(/Target="\.\.\/slideLayouts\/(slideLayout\d+\.xml)"/i);
  return m ? m[1] : '';
}

/**
 * Speaker notes live in ppt/notesSlides/notesSlideN.xml. The notesSlide N
 * matches the slide index from the slide rels file; we look up by the
 * `notesSlideN.xml` filename pattern, falling back to ordering if the rel
 * is absent.
 */
function readNotes(zip: JSZip, slideNum: number): Promise<string> {
  const file = zip.file(`ppt/notesSlides/notesSlide${slideNum}.xml`);
  if (!file) return Promise.resolve('');
  return file.async('string').then((xml) => {
    // Drop the slide-number placeholder text the master injects.
    const stripped = xml.replace(
      /<p:sp\b[\s\S]*?<p:ph\b[^>]*type="sldNum"[\s\S]*?<\/p:sp>/g,
      '',
    );
    return extractParagraphs(stripped).join('\n').trim();
  });
}

/**
 * Slides in a .pptx are listed in ppt/_rels/presentation.xml.rels with
 * sequential ids. We read presentation.xml's `<p:sldIdLst>` to get the
 * authoritative ORDER, then map ids to filenames via the rels file.
 */
async function readSlideOrder(zip: JSZip): Promise<string[]> {
  const presXml = await zip.file('ppt/presentation.xml')?.async('string');
  const relsXml = await zip.file('ppt/_rels/presentation.xml.rels')?.async('string');
  if (!presXml || !relsXml) {
    // Fallback: alphabetical by filename. Loses ordering for >9 slides.
    const fallback = Object.keys(zip.files)
      .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
      .sort();
    return fallback;
  }

  // Map rId -> Target
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
    // Targets in presentation.xml.rels are like "slides/slide1.xml"; resolve
    // them relative to "ppt/" so they match the zip path.
    const path = target.startsWith('/')
      ? target.slice(1)
      : `ppt/${target.replace(/^\.\//, '')}`;
    order.push(path);
  }
  return order;
}

/**
 * Cap on slide count. A 200-slide deck would blow the LLM context; for v1
 * we hard-cap at 60 and the API surfaces a clear error to the caller.
 */
export const MAX_SLIDES = 60;

export async function parsePptx(buffer: Buffer): Promise<ParsedDeck> {
  const zip = await JSZip.loadAsync(buffer);
  const order = await readSlideOrder(zip);
  if (order.length === 0) {
    return { slideCount: 0, slides: [] };
  }

  const slides: ParsedSlide[] = [];
  for (let i = 0; i < order.length && i < MAX_SLIDES; i++) {
    const slidePath = order[i];
    const slideFile = zip.file(slidePath);
    if (!slideFile) continue;
    const slideXml = await slideFile.async('string');

    // Slide number from filename ("ppt/slides/slide7.xml" -> 7)
    const numMatch = slidePath.match(/slide(\d+)\.xml$/);
    const slideNum = numMatch ? Number(numMatch[1]) : i + 1;

    // rels file for the slide, used for layoutHint and notes lookup
    const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
    const relsFile = zip.file(relsPath);
    const relsXml = relsFile ? await relsFile.async('string') : undefined;

    const title = extractTitle(slideXml);
    const { body, bullets } = extractBodyAndBullets(slideXml);
    const notes = await readNotes(zip, slideNum);
    const hasTable = /<a:tbl\b/.test(slideXml);
    const hasImage = /<p:pic\b/.test(slideXml);
    const layoutHint = readLayoutHint(relsXml);

    slides.push({
      index: i + 1,
      title,
      body,
      bullets,
      notes,
      hasTable,
      hasImage,
      layoutHint,
    });
  }

  return { slideCount: slides.length, slides };
}
