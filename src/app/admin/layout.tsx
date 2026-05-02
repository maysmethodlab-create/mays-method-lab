import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isAdminAuthenticated } from '@/lib/auth';

// Admin tools require the admin password, not just a TAMU Google session.
// A faculty member signed in via Google can use the Learning Community but
// not the admin apps. The admin password POST sets both cookies; Google
// OAuth sets only the member session.

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdminAuthenticated()) {
    const h = headers();
    const fullUrl = h.get('x-invoke-path') || h.get('referer') || '/admin';
    const next = fullUrl.startsWith('/') ? fullUrl : '/admin';
    redirect(`/login?next=${encodeURIComponent(next)}&mode=admin`);
  }

  return <>{children}</>;
}
