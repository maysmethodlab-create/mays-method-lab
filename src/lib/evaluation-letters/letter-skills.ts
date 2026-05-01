import { promises as fs } from 'fs';
import path from 'path';
import type { LetterSkillKey } from './role-categories';

/**
 * Letter skills are markdown files derived from real department-head letters.
 * They tell the Writing Agent what structure, tone, and language patterns to
 * use for each faculty category.
 *
 * Files live at:
 *   apps/Annual Evaluation Letters/letter-skills/<slug>.md
 *
 * Loaded lazily on first request and cached in memory.
 */

const SKILL_DIR = path.join(
  process.cwd(),
  'apps',
  'Annual Evaluation Letters',
  'letter-skills',
);

// Some skill keys do not have a dedicated file; fall back to the closest match.
const FALLBACK: Partial<Record<LetterSkillKey, LetterSkillKey>> = {
  'department-head': 'full-professor',
  'associate-dean': 'full-professor',
};

const cache = new Map<string, string>();

async function readSkillFile(slug: string): Promise<string> {
  const cached = cache.get(slug);
  if (cached) return cached;
  const filePath = path.join(SKILL_DIR, `${slug}.md`);
  const content = await fs.readFile(filePath, 'utf8');
  cache.set(slug, content);
  return content;
}

export async function loadLetterSkill(key: LetterSkillKey): Promise<{
  primary: string;
  patternsAnalysis: string;
  fallbackUsed: LetterSkillKey | null;
}> {
  let primary: string;
  let fallbackUsed: LetterSkillKey | null = null;
  try {
    primary = await readSkillFile(key);
  } catch {
    const fallback = FALLBACK[key];
    if (!fallback) {
      throw new Error(`No letter skill found for key: ${key}`);
    }
    fallbackUsed = fallback;
    primary = await readSkillFile(fallback);
  }

  let patternsAnalysis = '';
  try {
    patternsAnalysis = await readSkillFile('LETTER-PATTERNS-ANALYSIS');
  } catch {
    // Cross-department analysis is helpful but not required.
  }

  return { primary, patternsAnalysis, fallbackUsed };
}
