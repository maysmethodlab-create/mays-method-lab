'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } finally {
      router.replace('/');
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="btn-secondary text-xs tracking-[0.15em] uppercase px-5 py-2"
    >
      {busy ? 'Signing out…' : 'Sign Out'}
    </button>
  );
}
