import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

export const metadata = {
  title: 'Sign In | Mays Method Lab',
};

export default function LoginPage() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-16 pb-16">
      <div className="w-full max-w-md">
        <div className="eyebrow-lg mb-3">Admin Access</div>
        <h1 className="mb-3">Sign in to the Lab.</h1>
        <p className="text-[15px] text-ink-secondary mb-10 leading-relaxed">
          Sign in with your TAMU Google account to continue. Admin Tools are
          restricted to @tamu.edu users.
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
