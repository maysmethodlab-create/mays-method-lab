/**
 * AI Student Fellows of the Mays Method Lab.
 * Edit this list to add or update fellows; the /about/student-fellows page
 * renders directly from this array.
 */

export type StudentFellow = {
  name: string;
  /** Optional headshot URL — drop a file in /public/fellows/ and reference it here */
  imageUrl?: string;
  /** One-line program / role label, e.g. "Senior, Mays Business School" */
  program?: string;
  /** Short bio paragraph */
  bio?: string;
  /** Areas of focus / keywords */
  focus?: string[];
  links?: {
    linkedin?: string;
    website?: string;
    email?: string;
  };
};

export const STUDENT_FELLOWS: StudentFellow[] = [
  {
    name: 'Russell Cates',
    program: 'Texas A&M University',
    bio: 'Bio forthcoming.',
    links: { linkedin: 'https://www.linkedin.com/in/russell-cates/' },
  },
  {
    name: 'Yonatan Marom',
    program: 'Texas A&M University',
    bio: 'Bio forthcoming.',
    links: { linkedin: 'https://www.linkedin.com/in/ymarom/' },
  },
];
