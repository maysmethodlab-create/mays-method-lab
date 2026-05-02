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
      "For the Associate Dean for Research (Rogelio Oliva), as Chair of the Mays Research Council, to recommend a candidate for appointment, reappointment, or fellowship to the Dean — AFTER the MRC has met and voted. Stage 1 (department head nomination letter) and Stage 3 (Dean appointment letter) will become separate apps later. Six-step workflow with vote collection and a verbatim institutional template. Lands on a sample case (Len Berry) so you can see a populated workflow before entering real inputs.",
    href: '/admin/endowed-positions',
    status: 'live',
    category: 'Endowed Positions',
  },
];
