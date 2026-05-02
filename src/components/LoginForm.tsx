'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/admin';

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Login failed.');
        setLoading(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="password" className="label">
          Admin Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          placeholder="Enter the admin password"
        />
      </div>

      {error ? (
        <div className="text-sm text-status-error border border-status-error/40 bg-status-error/10 px-4 py-3">
          {error}
        </div>
      ) : null}

      <button type="submit" disabled={loading || !password} className="btn-primary w-full">
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="text-xs text-ink-muted leading-relaxed">
        v1 uses a shared admin password. This will be replaced with Texas A&amp;M CAS SSO so
        each user signs in with their NetID.
      </p>
    </form>
  );
}
