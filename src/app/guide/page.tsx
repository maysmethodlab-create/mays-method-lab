import { redirect } from 'next/navigation';

/**
 * The legacy /guide route now redirects to /your-ai-edge/start, which hosts
 * the canonical Step 0 quick-start content natively.
 */
export default function GuidePage() {
  redirect('/your-ai-edge/start');
}
