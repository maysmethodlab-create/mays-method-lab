import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isAuthenticated } from '@/lib/auth';

// The Learning Community sits behind the TAMU member gate. Either the
// Google OAuth flow or the admin password flow can satisfy it. The
// public marketing pages (/, /about, /login) stay open so a first-time
// visitor sees the pitch before being asked to sign in.

export default function LearningCommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAuthenticated()) {
    const h = headers();
    const fullUrl =
      h.get('x-invoke-path') || h.get('referer') || '/learning-community';
    const next = fullUrl.startsWith('/') ? fullUrl : '/learning-community';
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return <>{children}</>;
}
