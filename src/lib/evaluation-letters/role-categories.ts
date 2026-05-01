export type RatingArea = 'teaching' | 'research' | 'service';

export type RoleCategory = {
  id: string;
  /** Two-line label rendered in the dropdown */
  group: string;
  label: string;
  description: string;
  /** Rating areas required for this category */
  required: RatingArea[];
  /** Rating areas that are optional (e.g. research for clinical faculty) */
  optional: RatingArea[];
  /** Letter-skill key — maps to a file in letter-skills.ts */
  letterSkill: LetterSkillKey;
  /** Critical reminder shown to the user in the UI */
  warning?: string;
};

export type LetterSkillKey =
  | 'assistant-professor-tenure-track'
  | 'associate-professor'
  | 'full-professor'
  | 'lecturer-and-senior-lecturer'
  | 'executive-professor-and-professor-of-practice'
  | 'department-head'
  | 'associate-dean';

export const ROLE_CATEGORIES: RoleCategory[] = [
  {
    id: 'tt-professor',
    group: 'Tenured / Tenure-Track Faculty',
    label: 'Professor',
    description:
      'Evaluated on Research & Publication, Teaching, and Service. Expected to demonstrate leadership and excellence in at least one area.',
    required: ['teaching', 'research', 'service'],
    optional: [],
    letterSkill: 'full-professor',
  },
  {
    id: 'tt-associate-professor',
    group: 'Tenured / Tenure-Track Faculty',
    label: 'Associate Professor',
    description:
      'Evaluated on all three areas. Expected to demonstrate effectiveness in all three, with excellence in research/publication or teaching.',
    required: ['teaching', 'research', 'service'],
    optional: [],
    letterSkill: 'associate-professor',
  },
  {
    id: 'tt-assistant-professor',
    group: 'Tenured / Tenure-Track Faculty',
    label: 'Assistant Professor',
    description:
      'Evaluated on all three areas. Focus is progress toward tenure: effectiveness in teaching and excellence in research expected.',
    required: ['teaching', 'research', 'service'],
    optional: [],
    letterSkill: 'assistant-professor-tenure-track',
  },
  {
    id: 'apt-lecturer',
    group: 'APT Faculty',
    label: 'Lecturer / Senior Lecturer / Principal Lecturer',
    description:
      'Evaluated primarily on Teaching, with secondary consideration of Service. Research is NOT evaluated and its absence must NOT be noted negatively.',
    required: ['teaching', 'service'],
    optional: [],
    letterSkill: 'lecturer-and-senior-lecturer',
    warning:
      'Research is not part of the lecturer role. The letter must not evaluate or reference the absence of research.',
  },
  {
    id: 'apt-clinical',
    group: 'APT Faculty',
    label: 'Clinical Assistant / Associate / Professor',
    description:
      'Evaluated on Teaching and Service. May satisfy service expectations through research publications with Department Head approval.',
    required: ['teaching', 'service'],
    optional: ['research'],
    letterSkill: 'executive-professor-and-professor-of-practice',
  },
  {
    id: 'apt-practice',
    group: 'APT Faculty',
    label: 'Professor of Practice (Assistant / Associate / Full)',
    description:
      'Evaluated on Teaching and Service. Individuals without terminal degrees who had distinguished private-sector careers.',
    required: ['teaching', 'service'],
    optional: ['research'],
    letterSkill: 'executive-professor-and-professor-of-practice',
  },
  {
    id: 'department-head',
    group: 'Leadership',
    label: 'Department Head',
    description:
      'Evaluated on departmental leadership, faculty development, strategic direction, budget stewardship, plus continued research if applicable.',
    required: ['teaching', 'research', 'service'],
    optional: [],
    letterSkill: 'department-head',
  },
  {
    id: 'associate-dean',
    group: 'Leadership',
    label: 'Associate Dean / Other Administrative Leadership',
    description:
      'Evaluated on cross-functional impact, strategic initiatives, institutional leadership, program building.',
    required: ['service'],
    optional: ['teaching', 'research'],
    letterSkill: 'associate-dean',
  },
];

export function getRoleCategory(id: string): RoleCategory | undefined {
  return ROLE_CATEGORIES.find((r) => r.id === id);
}

export const RATING_LEVELS = [
  'Excellent',
  'Effective',
  'Needs Improvement',
  'Unsatisfactory',
] as const;

export type Rating = (typeof RATING_LEVELS)[number];
