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
];
