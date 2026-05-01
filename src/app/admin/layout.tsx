import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isAuthenticated } from '@/lib/auth';

// TODO: Replace with TAMU CAS SSO (https://cas.tamu.edu).
// On a real CAS deployment, this layout would call CAS validation and populate
// a request-scoped user object (NetID, role, displayName) instead of just gating.

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    // Capture the current path so we can redirect back after login.
    const h = headers();
    const fullUrl = h.get('x-invoke-path') || h.get('referer') || '/admin';
    const next = fullUrl.startsWith('/') ? fullUrl : '/admin';
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return <>{children}</>;
}
