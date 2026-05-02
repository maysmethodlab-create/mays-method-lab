import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isAuthenticated } from '@/lib/auth';

// /your-ai-edge holds the Step 0 / Step 1 detail pages and the three intake
// forms (contribute-prompt, consultation, join-lab). Same TAMU member gate
// as /learning-community. Either Google OAuth or the admin password flow
// can satisfy it.

export default function YourAiEdgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAuthenticated()) {
    const h = headers();
    const fullUrl =
      h.get('x-invoke-path') || h.get('referer') || '/your-ai-edge';
    const next = fullUrl.startsWith('/') ? fullUrl : '/your-ai-edge';
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return <>{children}</>;
}
