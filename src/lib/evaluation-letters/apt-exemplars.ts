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
 * Strip signature-line and reviewer-acknowledgement boilerplate that
 * many real letters carry at the end. The model picks these up as
 * "style cues" and starts pasting them into the body of new letters.
 * We cut them at load time so the exemplar reads as the writer's prose
 * alone, ending with the writer's actual closing sentence.
 */
function stripTrailingBoilerplate(text: string): string {
  let cleaned = text;
  // Cut at any of the well-known reviewer-signature trailers.
  const cutMarkers = [
    /\bI have reviewed this performance evaluation\b/i,
    /\bSignature\s*[_\s]*\s*Date\b/i,
    /\bEmployee['’]s Signature\b/i,
    /\bPlease return the signed copy to Donna Shumaker\b/i,
    /\bPlease sign and return to Donna Shumaker\b/i,
    /\bI hope you have an enjoyable\b.*?\bquestions\b/i,
    /\+-+\+/, // ASCII signature box
  ];
  for (const re of cutMarkers) {
    const m = cleaned.match(re);
    if (m && typeof m.index === 'number') {
      cleaned = cleaned.slice(0, m.index).trimEnd();
    }
  }
  // Drop any raw image-path artifacts that survived docx-to-text extraction.
  cleaned = cleaned.replace(/\[[A-Z]:\\.*?\.(jpg|jpeg|png|gif)\]/gi, '');
  return cleaned.trimEnd();
}

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
      const raw = fs.readFileSync(abs, 'utf8');
      const cleaned = stripTrailingBoilerplate(raw);
      out.push(`--- EXEMPLAR LETTER (${path.basename(rel)}) ---\n${cleaned}`);
    } catch {
      // missing exemplar — skip silently; the model will fall back to
      // the skill file alone.
    }
  }
  return out.join('\n\n');
}
