import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

export const metadata = {
  title: 'Sign In — Mays Method Lab',
};

export default function LoginPage() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
      <div className="w-full max-w-md">
        <div className="eyebrow mb-3">Admin Access</div>
        <h1 className="headline text-4xl mb-3">Sign in to the Lab.</h1>
        <p className="text-sm text-ink-secondary mb-10 leading-relaxed">
          Admin Tools require authentication. Enter the shared admin password to continue.
        </p>

        <div className="card">
          <Suspense fallback={<div className="text-sm text-ink-secondary">Loading…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
