/**
 * Prompt library data.
 *
 * Each entry is a paste-ready prompt with example output and related prompts.
 * Surfaced on /prompts via a card grid + side-sheet reading surface.
 */

export type PromptBucket =
  | 'research'
  | 'teaching'
  | 'writing'
  | 'programs'
  | 'faculty-support'
  | 'advising'
  | 'learning-ai';

export type PromptRole = 'faculty' | 'staff' | 'both';

export type Prompt = {
  slug: string;
  title: string;
  blurb: string;
  bucket: PromptBucket;
  role: PromptRole;
  /** The full paste-ready prompt text. */
  promptText: string;
  /** A short illustrative output paragraph. */
  exampleOutput: string;
  /** Slugs of related prompts. */
  related?: string[];
};

export const BUCKET_LABELS: Record<PromptBucket, string> = {
  research: 'Research',
  teaching: 'Teaching',
  writing: 'Writing',
  programs: 'Programs',
  'faculty-support': 'Faculty support',
  advising: 'Advising',
  'learning-ai': 'Learning AI',
};

export const PROMPTS: Prompt[] = [
  /* ---------- WRITING ---------- */
  {
    slug: 'announcement-writer',
    title: 'Draft an announcement',
    blurb: 'A short update for a department, college, or campus audience.',
    bucket: 'writing',
    role: 'both',
    promptText:
      'You are a Mays Business School communications writer. Draft a 120 to 180 word announcement using the bullet points below. The audience is [AUDIENCE: faculty / staff / students / alumni / prospects]. Tone: confident, plain, no exclamation points, no AI cheerleader words. Lead with the news, then the why, then the action the reader should take. Keep paragraphs to two sentences.\n\nBULLET POINTS:\n- [paste your raw notes here]\n- [paste another bullet]\n- [paste another bullet]',
    exampleOutput:
      'The Mays MS Marketing program will host its annual industry day on Friday, October 18 at the Wehner Building. Twenty-two recruiters from CPG, retail, and tech will meet with second-year students between 9 a.m. and 4 p.m. Students should RSVP via the Mays Career Center portal by October 4 and arrive in business professional attire. Faculty are welcome to drop in for the closing reception at 3:30 p.m.',
    related: ['report-draft', 'meeting-notes-summary'],
  },
  {
    slug: 'meeting-notes-summary',
    title: 'Summarize meeting notes',
    blurb: 'Turn raw notes into decisions, owners, and next steps.',
    bucket: 'writing',
    role: 'both',
    promptText:
      'You are an executive assistant summarizing a meeting. Read the raw notes below and produce: (1) a one-paragraph summary of what was discussed, (2) a bulleted list of decisions made, (3) a table of action items with columns Owner, Action, Due date. If a date or owner is missing, leave it blank rather than guessing.\n\nRAW NOTES:\n[paste here]',
    exampleOutput:
      'Summary: The undergraduate program committee reviewed the proposed change to the capstone sequence and agreed to pilot a two-track option in spring.\n\nDecisions:\n- Pilot the two-track capstone in spring 2027\n- Keep the single-track option for transfer students\n\nAction items:\n| Owner | Action | Due date |\n| Smith | Draft pilot syllabus | Sep 30 |\n| Lee | Survey current cohort | Oct 7 |',
    related: ['report-draft', 'announcement-writer'],
  },
  {
    slug: 'report-draft',
    title: 'Draft a status report',
    blurb: 'Turn rough notes into a structured report for leadership.',
    bucket: 'writing',
    role: 'both',
    promptText:
      'You are drafting a one-page status report for the dean. Use the notes below to produce: (1) a two-sentence executive summary, (2) "What we shipped" with three to five bullets, (3) "What is at risk" with one to three bullets, (4) "What we need from you" with up to three bullets. Keep total length under 350 words. Plain language, no jargon.\n\nNOTES:\n[paste here]',
    exampleOutput:
      'Executive summary: The MS Analytics program closed July with 62 admits, ahead of last year by 9. We are on track for an opening cohort of 48 to 52 in August.\n\nWhat we shipped:\n- Sent 1,200 personalized recruiter emails\n- Closed three new corporate scholarship gifts\n- Launched the new program website\n\nWhat is at risk:\n- One faculty hire fell through; the search committee needs guidance\n\nWhat we need from you:\n- A 30-minute meeting to discuss the faculty hire',
    related: ['meeting-notes-summary', 'resume-bullet-points'],
  },
  {
    slug: 'resume-bullet-points',
    title: 'Strengthen resume bullets',
    blurb: 'Rewrite weak bullets with action verbs and measurable results.',
    bucket: 'writing',
    role: 'both',
    promptText:
      'Rewrite the resume bullets below to follow this pattern: strong verb + what you did + measurable result. Cut filler words. Keep each bullet under 20 words. Output the rewrites as a numbered list. Mark any bullet where you had to guess at a number with [verify].\n\nBULLETS:\n[paste here]',
    exampleOutput:
      '1. Led the redesign of the MS Marketing curriculum, lifting student satisfaction scores from 3.6 to 4.4 of 5.\n2. Closed three new corporate partnerships, adding $180,000 in scholarship funding for the 2026 cohort [verify].\n3. Cut application processing time from 14 days to 3 by automating the transcript review step.',
    related: ['report-draft'],
  },

  /* ---------- TEACHING ---------- */
  {
    slug: 'syllabus-builder',
    title: 'Build a course syllabus',
    blurb: 'A structured first draft from your course goals.',
    bucket: 'teaching',
    role: 'faculty',
    promptText:
      'You are a faculty member at Mays Business School building a 14-week course syllabus. Use the inputs below to draft a syllabus with these sections: course description (under 150 words), learning objectives (5 to 7, measurable, Bloom-aligned), weekly topic schedule (one row per week), assessment plan (with point weights), required readings, and a one-paragraph AI policy. Use plain language.\n\nINPUTS:\n- Course title: [...]\n- Level (UG / MS / MBA): [...]\n- Credit hours: [...]\n- Three things students should be able to do after the course: [...]',
    exampleOutput:
      'MKTG 489: Customer Insight and Strategy is a 3-credit MS elective that prepares students to translate customer data into pricing, positioning, and channel decisions...\n\nLearning objectives:\n1. Frame a customer insight problem as a testable business question.\n2. Choose the right data source (survey, behavioral, transactional) for that question.\n3. Communicate findings in a one-page executive memo.\n\nWeek-by-week schedule (excerpt):\n| Week 1 | Course intro and the insight pipeline |\n| Week 2 | Survey design fundamentals |',
    related: ['learning-objectives', 'rubric-generator'],
  },
  {
    slug: 'learning-objectives',
    title: 'Write learning objectives',
    blurb: 'Measurable, Bloom-aligned objectives for any topic or module.',
    bucket: 'teaching',
    role: 'faculty',
    promptText:
      'Write 5 to 7 learning objectives for the topic below. Each objective must start with a measurable verb (analyze, design, evaluate, build, compare, etc.), name the artifact or behavior the student will produce, and avoid the verbs "understand," "know," and "appreciate." Output as a numbered list.\n\nTOPIC: [...]\nLEVEL (UG / MS / MBA): [...]',
    exampleOutput:
      '1. Build a discounted cash flow model for a publicly traded firm using three years of 10-K filings.\n2. Compare two pricing strategies and recommend one with a one-page memo defending the choice.\n3. Diagnose a misaligned channel partnership and propose three corrective actions.',
    related: ['syllabus-builder', 'rubric-generator'],
  },
  {
    slug: 'rubric-generator',
    title: 'Create an assignment rubric',
    blurb: 'A grading rubric with clear criteria and performance levels.',
    bucket: 'teaching',
    role: 'faculty',
    promptText:
      'Build a grading rubric for the assignment below. Use a 4-level scale: Exemplary, Proficient, Developing, Beginning. Pick 4 to 6 criteria that match the assignment goals. Each cell should be one short sentence describing what that level looks like. Output as a Markdown table.\n\nASSIGNMENT: [paste prompt]\nWEIGHT: [points or percent]\nCOURSE LEVEL: [...]',
    exampleOutput:
      '| Criterion | Exemplary (4) | Proficient (3) | Developing (2) | Beginning (1) |\n| Argument | Original, well-defended thesis with three supporting claims | Clear thesis with two supporting claims | Thesis present but vague | No identifiable thesis |\n| Evidence | Cites five or more sources, all primary | Cites three to four credible sources | Cites two sources, mixed quality | Fewer than two sources |',
    related: ['syllabus-builder', 'exam-prep-questions'],
  },
  {
    slug: 'exam-prep-questions',
    title: 'Generate practice exam questions',
    blurb: 'Practice questions from your course material.',
    bucket: 'teaching',
    role: 'faculty',
    promptText:
      'Generate 10 practice exam questions from the content below. Mix four formats: 4 multiple choice (4 options each, one correct), 3 short answer, 2 calculation problems, 1 case-style essay. After each question, give the answer and a one-sentence rationale. Match the difficulty to a [LEVEL] course.\n\nCONTENT:\n[paste lecture notes, slides, or chapter excerpt]',
    exampleOutput:
      '1. (Multiple choice) Which of the following best describes a Type II error?\n   a. Rejecting a true null\n   b. Failing to reject a false null\n   c. A sampling bias\n   d. A coding error\n   Answer: b. Rationale: Type II is a failure to detect a real effect.',
    related: ['study-guide-creator', 'rubric-generator'],
  },

  /* ---------- RESEARCH ---------- */
  {
    slug: 'literature-review-summary',
    title: 'Summarize research sources',
    blurb: 'Synthesize research sources, surface themes, conflicts, and gaps.',
    bucket: 'research',
    role: 'faculty',
    promptText:
      'You are a research assistant. Read the abstracts and excerpts below and produce: (1) a two-paragraph synthesis of the field, (2) a table mapping each paper to its main claim and method, (3) a list of three open questions where the literature disagrees or has not yet looked. Cite by author and year.\n\nSOURCES:\n[paste abstracts here]',
    exampleOutput:
      'Synthesis: The literature on customer trust in AI-mediated service splits into two camps. Studies grounded in marketing (Smith 2022, Kim 2023) frame trust as a function of disclosure and choice. Studies grounded in human-computer interaction (Park 2021, Garcia 2024) frame it as a function of perceived competence and recovery from errors...\n\n| Paper | Main claim | Method |\n| Smith 2022 | Disclosure raises trust | Field experiment |\n| Park 2021 | Recovery raises trust more than disclosure | Lab experiment |',
    related: ['research-paper-tracker'],
  },
  {
    slug: 'research-paper-tracker',
    title: 'Track a research paper',
    blurb: 'Tag, summarize, and decide whether to read.',
    bucket: 'research',
    role: 'faculty',
    promptText:
      'I will paste a paper abstract. You produce: (1) a one-sentence what-they-did, (2) a one-sentence what-they-found, (3) a one-sentence why-it-matters-for-my-work where my work is on [TOPIC], (4) a read / skim / skip recommendation with a one-line reason.\n\nABSTRACT:\n[paste]',
    exampleOutput:
      'What they did: Ran a field experiment with 1,400 mobile-app users to test the effect of price-anchor framing.\n\nWhat they found: Anchored prices lifted conversion by 11% but only when the discount was framed as a daily rate.\n\nWhy it matters for my work on subscription pricing: Useful precedent for the framing manipulation in study 2.\n\nRead / skim / skip: Skim. Methods are sound but the context is consumer apps, not B2B.',
    related: ['literature-review-summary'],
  },

  /* ---------- ADVISING / STUDENT-FACING ---------- */
  {
    slug: 'study-guide-creator',
    title: 'Create a study guide',
    blurb: 'A focused review sheet from lecture notes or textbook content.',
    bucket: 'advising',
    role: 'both',
    promptText:
      'You are a graduate teaching assistant. Build a focused study guide from the content below. Output four sections: (1) Core concepts (5 to 8 short definitions), (2) Worked examples (2, with steps), (3) Common mistakes (3 to 5 bullets), (4) Practice questions (5, with answers at the end). Keep total under 800 words.\n\nCONTENT:\n[paste]',
    exampleOutput:
      'Core concepts:\n- Net Present Value (NPV): the sum of discounted future cash flows minus the initial investment.\n- Internal Rate of Return (IRR): the discount rate that makes NPV equal to zero.\n\nWorked example 1: A project costs $100,000 today and returns $40,000 a year for three years. At a 10% discount rate, NPV = -100,000 + 40,000/1.10 + 40,000/1.21 + 40,000/1.331 = -$510. Reject.',
    related: ['exam-prep-questions', 'assignment-help'],
  },
  {
    slug: 'assignment-help',
    title: 'Explain an assignment prompt',
    blurb: 'Break a confusing assignment prompt into clear requirements.',
    bucket: 'advising',
    role: 'both',
    promptText:
      'A student is confused by the assignment prompt below. Without doing the assignment for them, produce: (1) a plain-language restatement of what is being asked, (2) a numbered list of the requirements, (3) a suggested order of operations they could follow, (4) three questions they should ask themselves before starting.\n\nPROMPT:\n[paste]',
    exampleOutput:
      'Plain-language restatement: You are being asked to pick a real company, find their pricing model, evaluate whether it is working, and recommend one change.\n\nRequirements:\n1. Pick a publicly traded company\n2. Describe their current pricing in 2 paragraphs\n3. Use at least 3 sources\n4. Recommend exactly one change with a 1-page justification',
    related: ['study-guide-creator'],
  },

  /* ---------- PROGRAMS / FACULTY SUPPORT (overlap with writing) ---------- */
  {
    slug: 'recruiter-outreach',
    title: 'Recruiter outreach email',
    blurb:
      'A warm, professional opener for an employer you have not contacted in a year or more.',
    bucket: 'programs',
    role: 'staff',
    promptText:
      'Draft a 120-word outreach email from a Mays MS program coordinator to a recruiter we have not spoken with in over a year. Tone: warm, professional, direct. Include: (1) a one-line "where we left off" reference, (2) a one-line program update worth their time, (3) one specific ask (info session, posting a job, mock interviews), (4) a closing line that does not beg. No subject line jokes.\n\nINPUTS:\n- Recruiter name and company: [...]\n- Last touchpoint: [...]\n- Program update: [...]\n- The ask: [...]',
    exampleOutput:
      'Hi Jordan,\n\nWe last talked at the spring info session you ran for our MS Analytics cohort. Since then, our class size has grown from 38 to 52, and we have added a required Python sequence in the first semester.\n\nWould you be open to a 30-minute virtual info session in October for the new cohort? We can host it during your team\'s lunch hour to make it easy.\n\nHappy to share an updated student profile if useful.\n\nBest,\n[Name]',
    related: ['announcement-writer'],
  },

  /* ---------- LEARNING AI ---------- */
  {
    slug: 'learn-prompting-basics',
    title: 'Learn the prompting basics',
    blurb: 'A starter prompt that asks the AI to teach you better prompts.',
    bucket: 'learning-ai',
    role: 'both',
    promptText:
      'I am a [ROLE] at Mays Business School. I want to learn how to write better AI prompts for my work. Pick three of the most common writing tasks I probably do (you can ask me one clarifying question first) and for each one, show me: (1) a weak prompt I might naively type, (2) a strong prompt that gets better output, (3) why the strong one works. Use plain language. No jargon.',
    exampleOutput:
      'One clarifying question first: Are most of your writing tasks internal communication (memos, updates, emails to colleagues) or external (donor notes, recruiter outreach, parent emails)?\n\nWeak: "Write me an email to a recruiter."\nStrong: "Draft a 120-word follow-up email to a recruiter we last talked to in March. Reference the spring info session, share that our class grew from 38 to 52, and ask if they would do a fall info session."\nWhy: The strong prompt names the audience, the length, the prior context, the news, and the specific ask. The model has nothing to invent.',
    related: ['announcement-writer', 'meeting-notes-summary'],
  },
];

export function promptsByBucket(bucket: PromptBucket): Prompt[] {
  return PROMPTS.filter((p) => p.bucket === bucket);
}

export function promptBySlug(slug: string): Prompt | undefined {
  return PROMPTS.find((p) => p.slug === slug);
}
