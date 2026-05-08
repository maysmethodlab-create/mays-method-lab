import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isAuthenticated } from '@/lib/auth';

// The Apps section sits behind the same TAMU member gate as Your AI Edge.
// Either the Google OAuth flow or the admin password flow can satisfy it.
// The public marketing pages (/, /about, /login) stay open so a first-time
// visitor sees the pitch before being asked to sign in.
//
// Every /apps/* page also gets a small back-link to Your AI Edge at the top.
// Faculty and staff who land here from Your AI Edge need a one-click path
// home; without it the only way back is the browser button.

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

  return (
    <>
      <div className="section pt-6 pb-2">
        <Link
          href="/learning-community"
          className="inline-flex items-center gap-2 text-[16px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon"
        >
          <span aria-hidden="true">&larr;</span>
          <span>Back to Your AI Edge</span>
        </Link>
      </div>
      {children}
    </>
  );
}
