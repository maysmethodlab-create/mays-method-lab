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
    program: 'B.B.A. in Management Information Systems, Mays Business School, Texas A&M University · expected 2027',
    bio: 'Russell is a Mays Business School student at Texas A&M and an incoming intern at Meta. He works with the Lab on the engineering side of its tools.',
    focus: ['MIS', 'Meta intern'],
    links: { linkedin: 'https://www.linkedin.com/in/russell-cates/' },
  },
  {
    name: 'Yuval Marom',
    program: 'B.S. in Industrial and Systems Engineering, Texas A&M University · graduating May 2026',
    bio: 'Yuval is a Texas A&M student graduating this semester with a degree in Industrial and Systems Engineering.',
    focus: ['Industrial & Systems Engineering'],
    links: { linkedin: 'https://www.linkedin.com/in/ymarom/' },
  },
];
