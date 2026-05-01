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
 * Break up runs of 3+ consecutive sentences starting with "Your" or "You".
 * Rewrites the second sentence in a run with a soft transition.
 */
function breakYourRuns(text: string): string {
  // Split into sentences while preserving boundaries.
  const parts = text.split(/(?<=[.!?])(\s+)/);
  // parts is alternating [sentence, whitespace, sentence, whitespace, ...]

  const sentences: string[] = [];
  const separators: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    sentences.push(parts[i]);
    separators.push(parts[i + 1] ?? '');
  }

  // Detect runs by index.
  let i = 0;
  while (i < sentences.length) {
    if (!startsWithYou(sentences[i])) {
      i += 1;
      continue;
    }
    // Find end of run
    let j = i;
    while (j < sentences.length && startsWithYou(sentences[j])) j += 1;
    const runLen = j - i;
    if (runLen >= 3) {
      // Rewrite every 2nd, 4th, ... sentence in the run by softening the opener.
      for (let k = i + 1; k < j; k += 2) {
        sentences[k] = softenOpener(sentences[k]);
      }
    }
    i = j;
  }

  // Re-stitch.
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += 1) {
    out.push(sentences[i]);
    if (i < separators.length) out.push(separators[i]);
  }
  return out.join('');
}

function startsWithYou(sentence: string): boolean {
  const first = sentence.trimStart().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
  return first === 'your' || first === 'you';
}

function softenOpener(sentence: string): string {
  const trimmed = sentence.trimStart();
  // Replace the very first word "Your" / "You" with a soft transition.
  if (/^Your\b/.test(trimmed)) {
    return sentence.replace(/^(\s*)Your\b/, '$1In addition, your');
  }
  if (/^You\b/.test(trimmed)) {
    return sentence.replace(/^(\s*)You\b/, '$1In addition, you');
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
