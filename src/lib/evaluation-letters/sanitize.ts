/**
 * Deterministic post-processing pass that catches the AI-language patterns
 * the writing rules prohibit, and that the Claude verifier sometimes still
 * lets through (or re-introduces in its own corrections).
 *
 * Three things happen here:
 *  1. Banned single-word swaps (leverage → use, enhance → strengthen, …).
 *  2. Banned phrase substitutions ("the fact that" → "that").
 *  3. Break up runs of 3+ consecutive sentences starting with "Your" / "You"
 *     by rewriting the middle one with a soft transition.
 *
 * The substitutions deliberately favor short, plain alternatives so the
 * letter still reads like a department head wrote it.
 */

type Sub = { from: RegExp; to: string };

// Single-word substitutions. Each entry handles the lowercase, capitalized,
// and ALL-CAPS forms automatically via wordSwap below.
const SINGLE_WORD_SWAPS: Record<string, string> = {
  // Adjectives
  robust: 'strong',
  comprehensive: 'thorough',
  nuanced: 'careful',
  multifaceted: 'broad',
  intricate: 'detailed',
  innovative: 'creative',
  'cutting-edge': 'leading',
  seamless: 'smooth',
  pivotal: 'central',
  crucial: 'important',
  vital: 'important',
  vibrant: 'active',
  compelling: 'strong',
  profound: 'deep',
  notable: 'real',
  commendable: 'strong',
  meticulous: 'careful',
  versatile: 'broad',
  holistic: 'full',

  // Verbs
  delve: 'explore',
  harness: 'use',
  leverage: 'use',
  underscore: 'show',
  foster: 'support',
  enhance: 'strengthen',
  streamline: 'simplify',
  optimize: 'improve',
  embark: 'begin',
  navigate: 'manage',
  unpack: 'examine',
  unravel: 'untangle',
  showcase: 'show',
  garner: 'earn',
  spearhead: 'lead',
  bolster: 'support',
  catalyze: 'trigger',
  revolutionize: 'change',
  transcend: 'go beyond',

  // Nouns (metaphorical use — best effort)
  landscape: 'field',
  realm: 'area',
  ecosystem: 'community',
  tapestry: 'mix',
  trajectory: 'path',
  paradigm: 'model',
  synergy: 'fit',
  nexus: 'intersection',
  cornerstone: 'foundation',
  bedrock: 'foundation',
  testament: 'evidence',
  beacon: 'leader',
  hallmark: 'mark',
  'game-changer': 'turning point',

  // Adverbs (mostly drop)
  fundamentally: '',
  remarkably: '',
  notably: '',
  importantly: '',
  crucially: '',
  essentially: '',
  ultimately: '',
  inherently: '',
};

// Phrase substitutions. Use full case-insensitive regex.
const PHRASE_SWAPS: Sub[] = [
  { from: /\bin order to\b/gi, to: 'to' },
  { from: /\bdue to the fact that\b/gi, to: 'because' },
  { from: /\bthe fact that\b/gi, to: 'that' },
  { from: /\bit is widely recognized that\b/gi, to: '' },
  { from: /\bit is important to note that\b/gi, to: '' },
  { from: /\bit is worth noting that\b/gi, to: '' },
  { from: /\bin other words,?\s*/gi, to: '' },
  { from: /^Moreover,\s*/gim, to: '' },
  { from: /^Furthermore,\s*/gim, to: '' },
  { from: /^Additionally,\s*/gim, to: '' },
  { from: /^Indeed,\s*/gim, to: '' },
  { from: /^Notably,\s*/gim, to: '' },
  { from: /^Importantly,\s*/gim, to: '' },
  { from: /^Taken together,\s*/gim, to: '' },
];

// Em / en dash → comma (per writing rules).
const DASH_SWAPS: Sub[] = [
  { from: /\s*[—–]\s*/g, to: ', ' },
];

function wordSwap(text: string, from: string, to: string): string {
  // Build a regex that matches the word in any case form, with word boundaries.
  // Hyphenated words still get \b on both sides because \b matches between
  // word and non-word characters.
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\b${escaped}\\b`, 'gi');
  return text.replace(re, (match) => {
    const replacement = to;
    if (replacement === '') {
      // Remove the word AND a trailing space.
      return '';
    }
    if (match[0] === match[0].toUpperCase()) {
      // Match capitalization of first letter.
      return replacement[0].toUpperCase() + replacement.slice(1);
    }
    return replacement;
  });
}

/**
 * Break up runs of 3+ consecutive sentences starting with "Your" or "You",
 * but only WITHIN a single paragraph (so headings and section breaks act as
 * natural reset points). Rotates a small set of soft transitions so the
 * fix doesn't read mechanically.
 */
function breakYourRuns(text: string): string {
  const paragraphs = text.split(/(\n{2,})/); // keep blank-line separators
  const out: string[] = [];
  let transitionCursor = 0;

  for (const block of paragraphs) {
    if (!block.trim() || /^\n+$/.test(block)) {
      out.push(block);
      continue;
    }
    const result = processParagraph(block, transitionCursor);
    out.push(result.text);
    transitionCursor = result.cursor;
  }
  return out.join('');
}

const TRANSITIONS = [
  'On the same point, you',
  'Beyond that, you',
  'In a related vein, you',
  'On a related note, you',
];

function processParagraph(
  paragraph: string,
  startCursor: number,
): { text: string; cursor: number } {
  // Split into sentences while preserving separators.
  const parts = paragraph.split(/(?<=[.!?])(\s+)/);
  const sentences: string[] = [];
  const separators: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    sentences.push(parts[i]);
    separators.push(parts[i + 1] ?? '');
  }

  let cursor = startCursor;

  // Find runs of consecutive Your-starting sentences (skipping headings).
  let i = 0;
  while (i < sentences.length) {
    if (!isLikelySentence(sentences[i]) || !startsWithYou(sentences[i])) {
      i += 1;
      continue;
    }
    let j = i;
    while (
      j < sentences.length &&
      isLikelySentence(sentences[j]) &&
      startsWithYou(sentences[j])
    ) {
      j += 1;
    }
    const runLen = j - i;
    if (runLen >= 3) {
      // Rewrite every 2nd, 4th, … sentence in the run.
      for (let k = i + 1; k < j; k += 2) {
        const t = TRANSITIONS[cursor % TRANSITIONS.length];
        cursor += 1;
        sentences[k] = softenOpener(sentences[k], t);
      }
    }
    i = j;
  }

  const stitched: string[] = [];
  for (let i = 0; i < sentences.length; i += 1) {
    stitched.push(sentences[i]);
    if (i < separators.length) stitched.push(separators[i]);
  }
  return { text: stitched.join(''), cursor };
}

function startsWithYou(sentence: string): boolean {
  const first = sentence.trimStart().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
  return first === 'your' || first === 'you';
}

/**
 * A "real sentence" must:
 *  - be longer than 25 chars OR end with terminal punctuation, AND
 *  - not look like a markdown heading or label (no leading **, no trailing colon-only)
 */
function isLikelySentence(s: string): boolean {
  const trimmed = s.trim();
  if (!trimmed) return false;
  if (/^\*\*[^*]+\*\*\.?$/.test(trimmed)) return false; // **Heading**
  if (/^#{1,6}\s/.test(trimmed)) return false; // # markdown heading
  if (trimmed.length < 25 && !/[.!?]$/.test(trimmed)) return false; // probably a label
  return true;
}

function softenOpener(sentence: string, transition: string): string {
  // transition already starts with capital and ends with "you" or "Your".
  // We want: replace leading "You" or "Your" with the transition.
  const lower = transition.toLowerCase();
  if (lower.endsWith('your')) {
    // We're targeting Your sentences
    return sentence.replace(/^(\s*)Your\b/, `$1${transition}r`);
    // Note: "you" + "r" = "your" — keeps capitalization correct
  }
  // For "you" transitions, we need the next word from the original sentence.
  if (/^Your\b/.test(sentence.trimStart())) {
    // Convert "Your X" to "<Transition> X" (drop the "your")
    return sentence.replace(/^(\s*)Your\s+/, `$1${transition.replace(/, you$/, ',')} your `);
  }
  if (/^You\b/.test(sentence.trimStart())) {
    return sentence.replace(/^(\s*)You\b/, `$1${transition}`);
  }
  return sentence;
}

/** Collapse double spaces / orphaned punctuation introduced by removals. */
function tidy(text: string): string {
  return text
    // collapse multiple spaces
    .replace(/[ \t]{2,}/g, ' ')
    // trim spaces around line breaks
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    // collapse 3+ blank lines
    .replace(/\n{3,}/g, '\n\n')
    // fix orphaned ", " at sentence start
    .replace(/(^|\n)\s*,\s*/g, '$1')
    // double-comma cleanup
    .replace(/,\s*,/g, ',')
    // space before punctuation cleanup
    .replace(/ ([.,;:!?])/g, '$1');
}

export type SanitizeResult = {
  text: string;
  /** Count of substitutions performed, broken down by category */
  changes: {
    bannedWords: number;
    phrases: number;
    dashes: number;
    yourRuns: number;
  };
};

export function sanitizeLetter(input: string): SanitizeResult {
  let text = input;
  const changes = { bannedWords: 0, phrases: 0, dashes: 0, yourRuns: 0 };

  // Banned single words
  for (const [from, to] of Object.entries(SINGLE_WORD_SWAPS)) {
    const before = text;
    text = wordSwap(text, from, to);
    if (text !== before) {
      // Count occurrences swapped
      const re = new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = before.match(re);
      changes.bannedWords += matches ? matches.length : 0;
    }
  }

  // Banned phrases
  for (const sub of PHRASE_SWAPS) {
    const before = text;
    text = text.replace(sub.from, sub.to);
    if (text !== before) {
      const matches = before.match(sub.from);
      changes.phrases += matches ? matches.length : 0;
    }
  }

  // Em / en dashes
  for (const sub of DASH_SWAPS) {
    const before = text;
    text = text.replace(sub.from, sub.to);
    if (text !== before) {
      const matches = before.match(sub.from);
      changes.dashes += matches ? matches.length : 0;
    }
  }

  // Your-runs
  const beforeYou = text;
  text = breakYourRuns(text);
  if (text !== beforeYou) {
    // approximate count: count "In addition, your|you" insertions we just made
    const inserted = text.match(/\bIn addition, [Yy]ou/g);
    changes.yourRuns = inserted ? inserted.length : 0;
  }

  text = tidy(text);
  return { text, changes };
}
