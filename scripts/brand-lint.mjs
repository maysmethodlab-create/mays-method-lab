#!/usr/bin/env node
/**
 * Mays Method Lab — brand lint
 *
 * Scans src/ for the most common brand-contract drift listed in
 * docs/BRAND.md and reports violations. Exits 1 if anything is found.
 *
 * Run:
 *   npm run brand-lint
 *
 * What it catches:
 *   1. text-transform: uppercase on H1/H2/H3 in any .tsx
 *   2. <h1|h2|h3 ...> with text-ink-primary or text-black classes
 *   3. rounded-md|rounded-lg|rounded-xl|rounded-full on pills/badges/cards
 *      (rounded-full on student-fellow avatar images is whitelisted)
 *   4. inline border-radius styles other than 0 or 2px
 *   5. hard-coded hex colors in .tsx not present in tailwind.config.ts
 *   6. drop-shadow utilities (shadow-sm|md|lg|xl|2xl) — Mays uses borders, not shadows
 *
 * Reports grouped by file. Exits 1 on any violation.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');

// -------- Allowlist for the avatar-only rounded-full exception ----------
// Per docs/BRAND.md: avatars on the student-fellows page may be circular.
const AVATAR_ROUNDED_FULL_FILES = new Set([
  join('src', 'app', 'about', 'student-fellows', 'page.tsx'),
]);

// -------- Tailwind palette tokens (so we can spot drift on hex colors) ---
function loadTailwindPalette() {
  // Lightweight regex extraction — we don't run TS, just scrape hex values
  // from tailwind.config.ts so the lint can detect hex colors not in the
  // palette without a TS toolchain.
  const cfg = readFileSync(join(ROOT, 'tailwind.config.ts'), 'utf8');
  const palette = new Set();
  const hex = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g;
  let m;
  while ((m = hex.exec(cfg)) !== null) {
    palette.add(`#${m[1].toUpperCase()}`);
  }
  // Allow #FFFFFF / #000000 always.
  palette.add('#FFFFFF');
  palette.add('#FFF');
  palette.add('#000000');
  palette.add('#000');
  return palette;
}

const PALETTE = loadTailwindPalette();

// -------- File walking ---------------------------------------------------
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const ALL_FILES = walk(SRC).filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'));

// -------- Rule helpers ---------------------------------------------------
function findLineNumber(src, idx) {
  return src.slice(0, idx).split('\n').length;
}

function lineAt(src, line) {
  return src.split('\n')[line - 1] ?? '';
}

// -------- Rules ----------------------------------------------------------
const RULES = [];

// 1. text-transform: uppercase on H1/H2/H3
RULES.push({
  name: 'heading-uppercase',
  test(file, src) {
    if (!file.endsWith('.tsx')) return [];
    const out = [];
    const re = /<h([123])\b[^>]*?\b(class|className)=["'`]([^"'`]*?)["'`]/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      const cls = m[3];
      if (/\buppercase\b/.test(cls)) {
        out.push({
          line: findLineNumber(src, m.index),
          message: `H${m[1]} has 'uppercase' class — headings are sentence case (BRAND.md §1)`,
          snippet: m[0],
        });
      }
    }
    return out;
  },
});

// 2. <h1|h2|h3 with text-ink-primary or text-black
RULES.push({
  name: 'heading-color',
  test(file, src) {
    if (!file.endsWith('.tsx')) return [];
    const out = [];
    const re = /<h([123])\b[^>]*?\b(class|className)=["'`]([^"'`]*?)["'`]/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      const cls = m[3];
      if (/\btext-ink-primary\b/.test(cls) || /\btext-black\b/.test(cls)) {
        out.push({
          line: findLineNumber(src, m.index),
          message: `H${m[1]} forces black text — headings are #500000 (BRAND.md §1, §8)`,
          snippet: m[0],
        });
      }
    }
    return out;
  },
});

// 3. rounded-md|lg|xl|full on tsx (with avatar exception)
RULES.push({
  name: 'rounded-corners',
  test(file, src) {
    if (!file.endsWith('.tsx')) return [];
    const rel = relative(ROOT, file).split(sep).join(sep === '\\' ? '\\' : '/');
    // We compare paths using posix-style for the allowlist set.
    const relPosix = rel.split('\\').join('/');
    const out = [];
    // Match rounded-{md,lg,xl,2xl,3xl,full} as standalone class tokens.
    const re = /\brounded-(?:md|lg|xl|2xl|3xl|full)\b/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      const ln = findLineNumber(src, m.index);
      const lineText = lineAt(src, ln);
      const isAvatar = m[0] === 'rounded-full' && relPosix.startsWith('src/app/about/student-fellows/page.tsx');
      if (isAvatar) continue;
      out.push({
        line: ln,
        message: `'${m[0]}' — Mays uses sharp 0px corners on pills/badges/cards (BRAND.md §10)`,
        snippet: lineText.trim(),
      });
    }
    return out;
  },
});

// 4. inline border-radius styles other than 0 or 2px
RULES.push({
  name: 'inline-border-radius',
  test(file, src) {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return [];
    const out = [];
    const re = /borderRadius\s*:\s*['"`]([^'"`]+)['"`]/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      const v = m[1].trim();
      if (v !== '0' && v !== '0px' && v !== '2px') {
        out.push({
          line: findLineNumber(src, m.index),
          message: `inline borderRadius '${v}' — only 0/0px/2px allowed (BRAND.md §10)`,
          snippet: m[0],
        });
      }
    }
    return out;
  },
});

// 5. hard-coded hex colors not in tailwind palette
RULES.push({
  name: 'hex-palette-drift',
  test(file, src) {
    if (!file.endsWith('.tsx')) return [];
    const out = [];
    const re = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      const hex = `#${m[1].toUpperCase()}`;
      if (!PALETTE.has(hex)) {
        out.push({
          line: findLineNumber(src, m.index),
          message: `hex '${hex}' not in tailwind.config.ts palette — define a token instead (BRAND.md §1)`,
          snippet: lineAt(src, findLineNumber(src, m.index)).trim(),
        });
      }
    }
    return out;
  },
});

// 6. shadow utilities on cards (Mays uses borders, not shadows)
RULES.push({
  name: 'no-card-shadow',
  test(file, src) {
    if (!file.endsWith('.tsx')) return [];
    const out = [];
    const re = /\bshadow-(?:sm|md|lg|xl|2xl|inner)\b/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      out.push({
        line: findLineNumber(src, m.index),
        message: `'${m[0]}' — Mays uses borders, not drop shadows (BRAND.md §3, §5)`,
        snippet: lineAt(src, findLineNumber(src, m.index)).trim(),
      });
    }
    return out;
  },
});

// -------- Run ------------------------------------------------------------
const violationsByFile = new Map();
let total = 0;

for (const file of ALL_FILES) {
  let src;
  try {
    src = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  for (const rule of RULES) {
    const found = rule.test(file, src);
    if (found.length === 0) continue;
    const rel = relative(ROOT, file);
    if (!violationsByFile.has(rel)) violationsByFile.set(rel, []);
    for (const f of found) {
      violationsByFile.get(rel).push({ ...f, rule: rule.name });
      total++;
    }
  }
}

if (total === 0) {
  console.log('brand-lint: no violations found.');
  process.exit(0);
}

console.log('brand-lint: violations found.\n');
const files = [...violationsByFile.keys()].sort();
for (const f of files) {
  const list = violationsByFile.get(f).sort((a, b) => a.line - b.line);
  console.log(`  ${f}`);
  for (const v of list) {
    console.log(`    ${f}:${v.line}  [${v.rule}]  ${v.message}`);
    if (v.snippet) {
      const trimmed = v.snippet.length > 120 ? v.snippet.slice(0, 117) + '…' : v.snippet;
      console.log(`        ${trimmed}`);
    }
  }
  console.log();
}
console.log(`brand-lint: ${total} violation${total === 1 ? '' : 's'} across ${files.length} file${files.length === 1 ? '' : 's'}.`);
process.exit(1);
