import fs from 'node:fs';
import path from 'node:path';

const TEMPLATES_ROOT = path.join(
  process.cwd(),
  'apps',
  'Annual Evaluation Letters',
  'Template Letters',
);

/**
 * Map from "<writerId>/<roleCategoryId>" to a list of exemplar letter
 * file paths (RELATIVE to Template Letters/). At draft time the prompt
 * builder loads these so the model has a concrete voice and structure
 * to imitate.
 *
 * As more real letters arrive, swap in better exemplars or rotate
 * older ones out — the rest of the pipeline picks up the change with
 * no further edits.
 */
export const APT_EXEMPLARS: Record<string, string[]> = {
  'mcguire/apt-lecturer': [
    'Accounting (McGuire)/Hurta, Amy [APT]/Hurta_Annual_Review_2024.txt',
    'Accounting (McGuire)/Larkin, Ryan [APT-Lecturer]/Larkin_Annual_Review_2024.txt',
    'Accounting (McGuire)/Allen, Natalie [APT]/Allen_Annual_Review_2024.txt',
  ],
  'mcguire/apt-practice': [
    'Accounting (McGuire)/Harding, Michael [APT-Practice]/Harding_Annual_Review_2024.txt',
    'Accounting (McGuire)/Ranzilla, Sam [APT]/Ranzilla_Annual_Review_2024.txt',
  ],
  'mcguire/apt-clinical': [
    'Accounting (McGuire)/Garza, Brent [APT-Clinical]/Garza_Annual_Review_2024.txt',
  ],
  'metters/apt-lecturer': [
    'Information & Operations (Metters)/Curtsinger, Wanda [APT]/Curtsinger_Annual_Review_2025.txt',
    'Information & Operations (Metters)/Boone, Ted [APT]/Boone_Annual_Review_2025.txt',
  ],
  'metters/apt-clinical': [
    'Information & Operations (Metters)/Whitten, Dwayne [APT]/Whitten_Annual_Review_2025.txt',
    'Information & Operations (Metters)/Rangan, Sudarsan [APT]/Rangan_Annual_Review_2025.txt',
  ],
  'metters/apt-practice': [
    'Information & Operations (Metters)/Whitten, Dwayne [APT]/Whitten_Annual_Review_2025.txt',
    'Information & Operations (Metters)/Rangan, Sudarsan [APT]/Rangan_Annual_Review_2025.txt',
  ],
  'boswell/apt-clinical': [
    'Management (Boswell)/Panina, Daria [APT]/Panina_Annual_Review_2025.txt',
    'Management (Boswell)/McFarland, Ken [APT]/McFarland_Annual_Review_2025.txt',
  ],
  'boswell/apt-lecturer': [
    'Management (Boswell)/Panina, Daria [APT]/Panina_Annual_Review_2025.txt',
    'Management (Boswell)/McFarland, Ken [APT]/McFarland_Annual_Review_2025.txt',
  ],
  'boswell/apt-practice': [
    'Management (Boswell)/Panina, Daria [APT]/Panina_Annual_Review_2025.txt',
    'Management (Boswell)/McFarland, Ken [APT]/McFarland_Annual_Review_2025.txt',
  ],
};

/**
 * Resolve and read 0-2 exemplar letters for the given writer + role
 * combination. Returns an empty string if none are configured.
 */
export function loadAptExemplars(writerId: string, roleCategoryId: string): string {
  const key = `${writerId}/${roleCategoryId}`;
  const paths = APT_EXEMPLARS[key];
  if (!paths || paths.length === 0) return '';
  const out: string[] = [];
  for (const rel of paths) {
    const abs = path.join(TEMPLATES_ROOT, rel);
    try {
      const text = fs.readFileSync(abs, 'utf8');
      out.push(`--- EXEMPLAR LETTER (${path.basename(rel)}) ---\n${text}`);
    } catch {
      // missing exemplar — skip silently; the model will fall back to
      // the skill file alone.
    }
  }
  return out.join('\n\n');
}
