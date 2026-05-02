import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isAuthenticated } from '@/lib/auth';

// The Apps section sits behind the same TAMU member gate as Your AI Edge.
// Either the Google OAuth flow or the admin password flow can satisfy it.
// The public marketing pages (/, /about, /login) stay open so a first-time
// visitor sees the pitch before being asked to sign in.

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAuthenticated()) {
    const h = headers();
    const fullUrl =
      h.get('x-invoke-path') || h.get('referer') || '/apps';
    const next = fullUrl.startsWith('/') ? fullUrl : '/apps';
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return <>{children}</>;
}
