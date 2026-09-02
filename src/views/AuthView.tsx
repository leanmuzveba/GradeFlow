import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';

// Placeholder layout — will be restyled to match the hand-designed login/signup
// screen once that markup is provided. The auth wiring below (mode switching,
// signup/login/reset calls, error + confirmation states) stays as-is.
export const AuthView: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'reset') {
        const result = await resetPassword(email.trim());
        if (result.error) setError(result.error);
        else setInfo('Password reset link sent — check your inbox.');
        return;
      }

      if (!password) {
        setError('Please enter a password.');
        return;
      }

      if (mode === 'signup') {
        const result = await signUp(email.trim(), password);
        if (result.error) setError(result.error);
        else if (result.needsEmailConfirmation) {
          setInfo('Almost there — check your inbox to confirm your email before logging in.');
        }
      } else {
        const result = await signIn(email.trim(), password);
        if (result.error) setError(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--gf-bg)] px-6">
      <div className="w-full max-w-sm gf-3d-card p-6">
        <h1 className="text-xl font-extrabold text-[var(--gf-text)] mb-1">
          {mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset password' : 'Welcome back'}
        </h1>
        <p className="text-xs text-[var(--gf-muted)] mb-5">
          {mode === 'signup'
            ? 'Sign up with your email to keep your progress synced.'
            : mode === 'reset'
              ? "We'll email you a link to reset your password."
              : 'Log in to pick up right where you left off.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[var(--gf-text)] mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[var(--gf-primary)]" />
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--gf-tint)] border border-[var(--gf-border)] text-sm text-[var(--gf-text)] focus:outline-none focus:ring-2 focus:ring-[var(--gf-primary)]"
              placeholder="you@example.com"
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="block text-xs font-bold text-[var(--gf-text)] mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[var(--gf-primary)]" />
                Password
              </label>
              <input
                type="password"
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--gf-tint)] border border-[var(--gf-border)] text-sm text-[var(--gf-text)] focus:outline-none focus:ring-2 focus:ring-[var(--gf-primary)]"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="gf-3d-button w-full py-2.5 text-white text-sm font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95 disabled:opacity-60"
          >
            {mode === 'signup' ? 'Create Account' : mode === 'reset' ? 'Send Reset Link' : 'Log In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs">
          {mode === 'login' ? (
            <>
              <button
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setInfo('');
                }}
                className="font-bold text-[var(--gf-primary)] hover:underline cursor-pointer"
              >
                New here? Sign up
              </button>
              <button
                onClick={() => {
                  setMode('reset');
                  setError('');
                  setInfo('');
                }}
                className="text-[var(--gf-muted)] hover:text-[var(--gf-primary)] cursor-pointer"
              >
                Forgot password?
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setInfo('');
              }}
              className="font-bold text-[var(--gf-primary)] hover:underline cursor-pointer"
            >
              Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
