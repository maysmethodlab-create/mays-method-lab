/**
 * The "secret sauce": rules that turn AI-flavored prose into letters that
 * sound like a senior academic leader wrote them. These are embedded into
 * every writing prompt and used by the verifier to flag regressions.
 */

export const BANNED_WORDS = {
  // NOTE: "robust", "notable", "vital", "crucial" appear in Sean McGuire's
  // actual letters and his peer-comments file. The Stuber ground-truth
  // comparison surfaced that we were scrubbing them out of his own voice.
  // They are no longer banned. Patterns like "stands as a testament" or
  // "emerges as a beacon" remain banned via BANNED_PHRASES instead.
  adjectives: [
    'comprehensive',
    'nuanced',
    'multifaceted',
    'intricate',
    'innovative',
    'cutting-edge',
    'seamless',
    'pivotal',
    'vibrant',
    'compelling',
    'profound',
    'commendable',
    'meticulous',
    'versatile',
    'holistic',
  ],
  verbs: [
    'delve',
    'harness',
    'leverage',
    'underscore',
    'foster',
    'enhance',
    'streamline',
    'optimize',
    'embark',
    'navigate',
    'unpack',
    'unravel',
    'showcase',
    'garner',
    'spearhead',
    'bolster',
    'catalyze',
    'revolutionize',
    'transcend',
  ],
  nouns: [
    'landscape',
    'realm',
    'ecosystem',
    'tapestry',
    'trajectory',
    'paradigm',
    'synergy',
    'nexus',
    'interplay',
    'cornerstone',
    'bedrock',
    'underpinning',
    'testament',
    'beacon',
    'hallmark',
    'game-changer',
  ],
  adverbs: [
    'fundamentally',
    'remarkably',
    'notably',
    'importantly',
    'crucially',
    'essentially',
    'ultimately',
    'inherently',
  ],
};

export const BANNED_OPENERS = [
  "In today's",
  'In an era of',
  'In the ever-evolving',
  'As [X] continues to evolve',
  'It is important to note that',
  'It is worth noting that',
  'Moreover,',
  'Furthermore,',
  'Additionally,',
  'Indeed,',
  'Notably,',
  'Importantly,',
  'Taken together,',
];

export const BANNED_PHRASES = [
  'In other words,',
  'the fact that',
  'In order to',
  'Due to the fact that',
  'It is widely recognized that',
];

export const STRUCTURAL_RULES = [
  'No em-dashes (—) or en-dashes (–). Use commas, semicolons, colons, or split into two sentences. This is the single most recognizable AI writing pattern.',
  'Vary paragraph length naturally. Do not produce artificially balanced paragraphs.',
  'Do not default to three items in every list. Use however many actually exist.',
  'Do not write every paragraph as topic-sentence + three points + summary.',
  'No triple parallel structures ("AI changes how firms compete, how firms organize, and how firms learn").',
  'Maximum one "While X, Y" opener per page.',
  'Do not end sentences with "-ing" phrases that summarize significance ("...highlighting the importance of governance").',
  'Prefer verbs over nominalizations ("The system improved outcomes" not "The implementation led to an improvement").',
  'Use "is" freely; do not replace with "serves as," "stands as," "represents," "constitutes."',
  'Limit "not just X, but Y" to once per section.',
  'Repeat the right word rather than cycling synonyms.',
  'Match confidence to evidence; do not hedge when the data are strong.',
];

export const TONAL_RULES = [
  'Take positions; do not present false balance.',
  'Show epistemic variation: be certain about some things, uncertain about others.',
  'Do not end with vague optimism about "the field continuing to evolve."',
  'Leave appropriate loose ends; not everything resolves neatly.',
];

/**
 * Compact, high-priority rules block to prepend to the prompt. Keeps the
 * model's attention on the specific banned words it tends to slip in
 * (leverage, enhance, trajectory, comprehensive, notable, navigate, foster).
 */
export function renderTopPriorityRules(): string {
  return `=== TOP PRIORITY ===

ABSOLUTE BANS (the model has been observed using these — do not):
- "leverage"  → use "use" or "draw on"
- "enhance"   → use "strengthen" or "build"
- "trajectory" (career sense) → use "path" or "direction"
- "comprehensive" → use "thorough" or "full"
- "navigate" (metaphorical) → use "manage" or "work through"
- "foster" → use "support" or "build"
- "nuanced", "multifaceted", "innovative", "seamless"
- "showcase", "garner", "spearhead", "bolster", "catalyze", "underscore"
- "delve", "harness", "embark", "transcend"
- "landscape" / "realm" / "ecosystem" / "tapestry" / "paradigm" / "synergy"
- "cornerstone", "bedrock", "testament", "beacon", "hallmark"
- Any em-dash (—) or en-dash (–). Use a comma, semicolon, or two sentences.

NOTE: "robust", "notable", "vital", "crucial" are FINE. Department heads
use them; do not avoid them.

SENTENCE-OPENER VARIETY (this is the model's most-violated rule):
- INSIDE A SINGLE PARAGRAPH, never start more than 2 sentences with
  "Your" or "You". Three in a row reads as AI-generated.
- After two "Your"/"You" sentences, switch to one of:
    "On the [teaching/service/research] side, …"
    "In the [doctoral / undergraduate / committee / classroom] …"
    "Beyond that, …"
    "Within the department, …"
    "The [four publications / two grants / committee work] …" — just lead
    with the concrete noun.
- Headings ("**Summary of Major Accomplishments**") do NOT count as
  sentences for this rule, but the first sentence after a heading still
  counts.

PHRASE BANS:
- "the fact that" → "that"
- "in order to" → "to"
- "It is important to note that..." → drop entirely

=================`;
}

/**
 * Render the full writing-rules block that gets embedded in every prompt.
 */
export function renderWritingRules(): string {
  const adjectives = BANNED_WORDS.adjectives.join(', ');
  const verbs = BANNED_WORDS.verbs.join(', ');
  const nouns = BANNED_WORDS.nouns.join(', ');
  const adverbs = BANNED_WORDS.adverbs.join(', ');
  return `CRITICAL HUMAN-SOUNDING WRITING RULES (must follow exactly):

BANNED WORDS — never use these:
- Adjectives: ${adjectives}
- Verbs: ${verbs}
- Nouns (metaphorical use): ${nouns}
- Adverbs: ${adverbs}

BANNED OPENERS — never start a sentence with these:
${BANNED_OPENERS.map((p) => `- "${p}"`).join('\n')}

BANNED PHRASES anywhere in the text:
${BANNED_PHRASES.map((p) => `- "${p}"`).join('\n')}

STRUCTURAL RULES:
${STRUCTURAL_RULES.map((r) => `- ${r}`).join('\n')}

TONAL RULES:
${TONAL_RULES.map((r) => `- ${r}`).join('\n')}

VOICE:
- Write like a senior academic leader who genuinely cares about the person's growth.
- Vary sentence length: mix short punchy sentences with longer analytical ones.
- If three sentences in a row start with the same word (especially "Your"), rewrite.
- Use "I" for personal observations; "we" for institutional statements.
- Frame growth areas as logical next steps, not deficiencies.

TEXAS A&M NAMING CONVENTIONS:
- "Texas A&M University" on first reference; "Texas A&M" thereafter.
- "Mays Business School" on first reference; "Mays" thereafter.
- AP-style serial comma (only when needed for clarity).
- Titles lowercase after a name ("Nate Sharp, dean of Mays Business School").
- Titles capitalized before a name ("Dean Nate Sharp").`;
}

// ---- Lightweight client-safe validators (also used by the Verify route) ----

export type LintIssue = {
  kind: 'banned-word' | 'banned-opener' | 'banned-phrase' | 'em-dash' | 'consecutive-your-opener';
  match: string;
  context: string;
};

const wordBoundary = (w: string) =>
  new RegExp(`\\b${w.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'gi');

export function lintLetter(text: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const lines = text.split(/\r?\n/);

  // Em / en dashes
  const dashRe = /[—–]/g;
  let m: RegExpExecArray | null;
  while ((m = dashRe.exec(text)) !== null) {
    const start = Math.max(0, m.index - 30);
    const end = Math.min(text.length, m.index + 30);
    issues.push({
      kind: 'em-dash',
      match: m[0],
      context: text.slice(start, end),
    });
  }

  // Banned words
  const allWords = [
    ...BANNED_WORDS.adjectives,
    ...BANNED_WORDS.verbs,
    ...BANNED_WORDS.nouns,
    ...BANNED_WORDS.adverbs,
  ];
  for (const w of allWords) {
    const re = wordBoundary(w);
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(text)) !== null) {
      const start = Math.max(0, mm.index - 30);
      const end = Math.min(text.length, mm.index + mm[0].length + 30);
      issues.push({ kind: 'banned-word', match: w, context: text.slice(start, end) });
    }
  }

  // Banned phrases (free-text, case-insensitive)
  for (const p of BANNED_PHRASES) {
    const idx = text.toLowerCase().indexOf(p.toLowerCase());
    if (idx >= 0) {
      issues.push({
        kind: 'banned-phrase',
        match: p,
        context: text.slice(Math.max(0, idx - 30), Math.min(text.length, idx + p.length + 30)),
      });
    }
  }

  // Banned sentence openers
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const s of sentences) {
    for (const opener of BANNED_OPENERS) {
      const cleanOpener = opener.replace(/\[.*?\]/, '').trim();
      if (s.startsWith(cleanOpener)) {
        issues.push({
          kind: 'banned-opener',
          match: opener,
          context: s.slice(0, 80),
        });
        break;
      }
    }
  }

  // Three consecutive sentence openers with "Your" or "You"
  let run = 0;
  for (const s of sentences) {
    const first = s.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (first === 'your' || first === 'you') {
      run += 1;
      if (run >= 3) {
        issues.push({
          kind: 'consecutive-your-opener',
          match: 'Your/You opener x3',
          context: s.slice(0, 80),
        });
      }
    } else {
      run = 0;
    }
  }

  // Dedupe near-identical issues
  const seen = new Set<string>();
  return issues.filter((i) => {
    const k = `${i.kind}:${i.match}:${i.context}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  // (lines unused for now, retained for future paragraph-level checks)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void lines;
}
