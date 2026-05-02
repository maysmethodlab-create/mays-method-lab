import { promises as fs } from 'fs';
import path from 'path';
import type { LetterSkillKey } from './role-categories';

/**
 * Letter skills are markdown files that tell the Writing Agent what
 * structure, tone, and language patterns to use.
 *
 * Two flavors:
 *  - Per-faculty-category skill (assistant-prof, associate-prof, …) — the
 *    section ordering and section-by-section guidance
 *  - Cross-cutting style skills (human-writing, hari-admin, evaluation-
 *    letter-writer-full) — voice, banned words, sentence rules
 *
 * Everything is loaded lazily and cached in memory.
 */

const ROOT = path.join(process.cwd(), 'apps', 'Annual Evaluation Letters');
const CATEGORY_DIR = path.join(ROOT, 'letter-skills');
const STYLE_DIR = path.join(ROOT, 'writing-style-skills');
const APP_SKILL_DIR = path.join(ROOT, 'evaluation-letter-writer-skill');
const TEMPLATE_DIR = path.join(ROOT, 'Template Letters');
const REFERENCE_LETTERS_DIR = path.join(ROOT, 'reference-letters');

// Some skill keys do not have a dedicated file; fall back to the closest match.
const FALLBACK: Partial<Record<LetterSkillKey, LetterSkillKey>> = {
  'department-head': 'full-professor',
  'associate-dean': 'full-professor',
};

const cache = new Map<string, string>();

async function readFileCached(absPath: string): Promise<string> {
  const cached = cache.get(absPath);
  if (cached) return cached;
  const content = await fs.readFile(absPath, 'utf8');
  cache.set(absPath, content);
  return content;
}

async function readMaybe(absPath: string): Promise<string> {
  try {
    return await readFileCached(absPath);
  } catch {
    return '';
  }
}

export async function loadLetterSkill(key: LetterSkillKey): Promise<{
  primary: string;
  patternsAnalysis: string;
  fallbackUsed: LetterSkillKey | null;
}> {
  let primary: string;
  let fallbackUsed: LetterSkillKey | null = null;
  try {
    primary = await readFileCached(path.join(CATEGORY_DIR, `${key}.md`));
  } catch {
    const fallback = FALLBACK[key];
    if (!fallback) {
      throw new Error(`No letter skill found for key: ${key}`);
    }
    fallbackUsed = fallback;
    primary = await readFileCached(path.join(CATEGORY_DIR, `${fallback}.md`));
  }

  const patternsAnalysis = await readMaybe(
    path.join(CATEGORY_DIR, 'LETTER-PATTERNS-ANALYSIS.md'),
  );

  return { primary, patternsAnalysis, fallbackUsed };
}

/**
 * The full style bundle — every skill file that should shape the letter's
 * voice. Loaded once and cached. Goes into the cached system block of the
 * writing prompt so we pay the token cost once per 5-minute window.
 */
export async function loadStyleBundle(): Promise<string> {
  const sources = [
    {
      label: 'HUMAN-WRITING SKILL (the full 40-pattern checklist)',
      path: path.join(STYLE_DIR, 'human-writing', 'SKILL.md'),
    },
    {
      label: "HARI'S ADMIN WRITING STYLE (voice for memos, evaluations, internal correspondence)",
      path: path.join(STYLE_DIR, 'hari-admin-writing-style', 'SKILL.md'),
    },
    {
      label: 'EVALUATION-LETTER-WRITER FULL SKILL (process and structure)',
      path: path.join(STYLE_DIR, 'evaluation-letter-writer-full', 'SKILL.md'),
    },
    {
      label: 'EVALUATION LETTER STRUCTURE REFERENCE',
      path: path.join(
        STYLE_DIR,
        'evaluation-letter-writer-full',
        'references',
        'letter-structure.md',
      ),
    },
    {
      label: 'EVALUATION LETTER WRITING-STYLE GUIDE',
      path: path.join(
        STYLE_DIR,
        'evaluation-letter-writer-full',
        'references',
        'writing-style-guide.md',
      ),
    },
    {
      label: 'EVALUATION LETTER WRITER (app skill — research instructions)',
      path: path.join(APP_SKILL_DIR, 'references', 'research-agent-instructions.md'),
    },
    {
      label:
        "HARI'S P&T LETTER SKILL (the architecture and voice Hari uses for promotion-and-tenure letters; the *research-evaluation* sections of an annual review should follow the same pattern: quantity in top journals, then pipeline, then conferences/lower-prestige, then quality/themes)",
      path: path.join(REFERENCE_LETTERS_DIR, 'hari-promotion-tenure-letter-SKILL.md'),
    },
  ];

  const parts: string[] = [];
  for (const s of sources) {
    const text = await readMaybe(s.path);
    if (text) parts.push(`================================================================
${s.label}
================================================================
${text}`);
  }

  // Append real P&T letter exemplars (extracted on demand from .docx / .pdf).
  const exemplars = await loadPTExemplars();
  if (exemplars) parts.push(exemplars);

  return parts.join('\n\n');
}

async function loadPTExemplars(): Promise<string> {
  const out: string[] = [];
  // Gregory Fisher (.docx) — load with mammoth.
  try {
    const mammoth = (await import('mammoth')) as typeof import('mammoth');
    const buf = await fs.readFile(
      path.join(REFERENCE_LETTERS_DIR, 'Gregory Fisher Letter Hari Sridhar 5_29_2025.docx'),
    );
    const r = await mammoth.extractRawText({ buffer: buf });
    if (r.value) {
      out.push(`================================================================
EXEMPLAR: HARI'S P&T LETTER FOR GREGORY FISHER (FULL PROFESSOR, 2025)
This is the writing pattern. Note the quantity-then-quality flow,
the named top journals (italicized), the numbered "First / Second /
Third" anchor-paper differentiators, and the closing recommendation.
The annual evaluation letter should adopt the same DNA in its research
paragraphs (just shorter and adapted to a single-year window).
================================================================
${r.value}`);
    }
  } catch {
    /* missing — skip */
  }
  // Sri Venkataraman (.pdf) — load with pdf-parse via dynamic import.
  try {
    const pdfMod = await import('pdf-parse');
    const pdf = (pdfMod as unknown as { default?: (b: Buffer) => Promise<{ text: string }> }).default
      || (pdfMod as unknown as (b: Buffer) => Promise<{ text: string }>);
    const buf = await fs.readFile(
      path.join(REFERENCE_LETTERS_DIR, 'Sri Venkataraman Letter Hari Sridhar 4_25_2026.pdf'),
    );
    const r = await pdf(buf);
    if (r.text) {
      out.push(`================================================================
EXEMPLAR: HARI'S P&T LETTER FOR SRI VENKATARAMAN (2026)
================================================================
${r.text}`);
    }
  } catch {
    /* missing — skip */
  }
  return out.join('\n\n');
}

/**
 * Peer-comment files Rich provided (full-prof comments on associates and
 * senior-clinical comments on lecturers). When the writer is Rich and the
 * recipient matches a name in these files, we surface them as supporting
 * context so the letter can echo the actual peer feedback.
 *
 * Returns the raw text of all peer-comment documents concatenated. Empty
 * string if nothing relevant.
 */
export async function loadPeerComments(): Promise<string> {
  // These are .docx files; the test pipeline extracts them through the same
  // mammoth path used at upload time. For now we point at the .txt cache
  // produced by scripts/read-peer-comments.mjs if it exists, falling back to
  // mammoth via dynamic import.
  const txtPath = path.join(ROOT, 'test-output', 'peer-comments-extract.txt');
  const fromTxt = await readMaybe(txtPath);
  if (fromTxt) return fromTxt;

  const docxFiles = [
    'Annual review comments of associate profs.docx',
    'Annual review comments junior clinicals and lecturers.docx',
  ];
  const out: string[] = [];
  for (const fn of docxFiles) {
    try {
      const mammoth = (await import('mammoth')) as typeof import('mammoth');
      const buf = await fs.readFile(path.join(TEMPLATE_DIR, '_bundles', fn));
      const r = await mammoth.extractRawText({ buffer: buf });
      out.push(`===== PEER COMMENTS: ${fn} =====\n${r.value}`);
    } catch {
      // missing file — skip silently
    }
  }
  return out.join('\n\n');
}
