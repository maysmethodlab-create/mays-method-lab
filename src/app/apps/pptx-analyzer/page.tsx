import DeckAnalyzerClient from './DeckAnalyzerClient';

export const metadata = {
  title: 'Deck Analyzer | Mays Method Lab',
  description:
    'Upload a PowerPoint deck. See which elements convert reliably to the Mays template, where you have accessibility gaps, and whether the deck is a fit for the converter — before running it.',
};

/**
 * Deck Analyzer page. Standalone pre-flight tool: scans a .pptx and
 * surfaces a reliability + accessibility report for the user. The
 * conversion (master-swap) tool itself ships separately; this analyzer
 * is the up-front feature so users can see what the converter would do
 * before any pipeline runs.
 *
 * Gated by /apps/layout which redirects unauthenticated visitors to
 * /login. No admin password gate at the app level — this is a
 * read-only inspector with no LLM cost or external side effects.
 */
export default function DeckAnalyzerPage() {
  return (
    <section className="section">
      <DeckAnalyzerClient />
    </section>
  );
}
