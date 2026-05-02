'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Inline 18px Google G logo. Standard branding mark, no external dependency.
function GoogleGIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.806.54-1.8368.8595-3.0477.8595-2.344 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9831 5.4818 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71c-.18-.54-.2823-1.1168-.2823-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1731 0 7.5477 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"
      />
      <path
        fill="#EA4335"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"
      />
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/admin';
  const errorParam = search.get('error');

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (errorParam === 'domain') {
      setError(
        'Sign-in is restricted to @tamu.edu accounts. Please use your TAMU Google account.',
      );
    } else if (errorParam === 'oauth') {
      setError('Sign-in failed. Please try again.');
    } else if (errorParam === 'oauth-not-configured') {
      setError(
        'Google sign-in is not yet configured on this server. Please use the admin password.',
      );
      setShowPasswordForm(true);
    }
  }, [errorParam]);

  const googleHref = `/api/auth/google/start?next=${encodeURIComponent(next)}`;

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
    <div className="space-y-6">
      <a
        href={googleHref}
        className="google-signin-btn"
        aria-label="Sign in with TAMU Google"
      >
        <GoogleGIcon />
        <span>Sign in with TAMU Google</span>
      </a>

      {error ? (
        <div className="text-sm text-status-error border border-status-error/40 bg-status-error/10 px-4 py-3">
          {error}
        </div>
      ) : null}

      <p className="text-xs text-ink-muted leading-relaxed">
        Sign-in is restricted to @tamu.edu accounts. Use your TAMU Google account
        (faculty, staff, or student).
      </p>

      <div className="pt-2">
        {showPasswordForm ? (
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

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => setShowPasswordForm(false)}
              className="text-xs text-ink-muted hover:text-ink-secondary underline"
            >
              Hide password form
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowPasswordForm(true)}
            className="text-xs text-ink-muted hover:text-ink-secondary underline"
          >
            Use admin password (dev)
          </button>
        )}
      </div>
    </div>
  );
}
