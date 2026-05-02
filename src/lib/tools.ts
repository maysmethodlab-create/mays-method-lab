import type { ToolCardProps } from '@/components/ToolCard';

/**
 * Registry of admin tools rendered on the Admin Tools page.
 * Add a new entry here to surface a new tool — no other changes required.
 */
export const ADMIN_TOOLS: ToolCardProps[] = [
  {
    title: 'Evaluation Letter Writer',
    description:
      'Generate annual faculty evaluation letters from a self-evaluation, CV, and writer notes. Three-phase AI pipeline with research, draft, and verification stages.',
    href: '/admin/evaluation-letters',
    status: 'live',
    category: 'Faculty Evaluations',
  },
  {
    title: 'Endowed Positions Letter Writer [Stage 2: ADR]',
    description:
      "After the MRC votes on a candidate, the Associate Dean for Research drafts the recommendation memo to the Dean.",
    href: '/admin/endowed-positions',
    status: 'live',
    category: 'Endowed Positions',
  },
  {
    title: 'Mays Faculty Guidelines Chatbot [Beta]',
    description:
      "Consult the October 2025 guidelines before drafting an eval letter, recommendation memo, or response to the dean's office. Ask any question; the chatbot quotes the relevant passage with section and page citations. Same source as the faculty-side chatbot, framed for administrative use.",
    href: '/apps/faculty-guidelines',
    status: 'live',
    category: 'Faculty Reference',
  },
];
