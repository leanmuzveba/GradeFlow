import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthView.css';

const DESKTOP_BREAKPOINT = 860;

const useIsWideScreen = (breakpointPx: number): boolean => {
  const [isWide, setIsWide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(`(min-width: ${breakpointPx}px)`).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const handler = (e: MediaQueryListEvent) => setIsWide(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpointPx]);

  return isWide;
};

const NameIcon = () => (
  <svg viewBox="0 0 24 24" className="ico" aria-hidden="true">
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z" />
  </svg>
);
const EmailIcon = () => (
  <svg viewBox="0 0 24 24" className="ico" aria-hidden="true">
    <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm0 2.2V17h16V8.2l-8 5-8-5Zm.8-.2 7.2 4.5L19.2 8H4.8Z" />
  </svg>
);
const PasswordIcon = () => (
  <svg viewBox="0 0 24 24" className="ico" aria-hidden="true">
    <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm3 8H9V7a3 3 0 0 1 6 0v3Z" />
  </svg>
);
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" className="arrow" aria-hidden="true">
    <path d="M5 12h12m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="soc-ico" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.5 2.6 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.3 17.6 9.5 24 9.5Z" />
    <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.2 5.6c4.2-3.9 6.6-9.6 6.6-16.1Z" />
    <path fill="#FBBC05" d="M10.4 28.4c-.5-1.4-.8-3-.8-4.4s.3-3 .8-4.4l-7.8-6.1C1 16.4 0 20.1 0 24s1 7.6 2.6 10.5l7.8-6.1Z" />
    <path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.2-5.6c-2 1.4-4.6 2.2-7.8 2.2-6.4 0-11.7-3.8-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48Z" />
  </svg>
);
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="soc-ico" aria-hidden="true">
    <path d="M16.4 12.9c0-2.3 1.9-3.4 2-3.4-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.9-.9-3.1-.8-1.6 0-3 .9-3.8 2.4-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 3 2.3 1.2-.1 1.6-.8 3.1-.8s1.9.8 3.1.8 2.1-1.1 2.9-2.3c.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.9ZM14 5.6c.7-.8 1.1-2 1-3.1-1 0-2.2.6-2.9 1.4-.6.7-1.2 1.9-1 3 1.1.1 2.2-.5 2.9-1.3Z" />
  </svg>
);

const Logo: React.FC = () => (
  <div className="logo" aria-label="GradeFlow logo">
    <span className="tile tl" />
    <span className="tile tr" />
    <span className="tile br" />
    <span className="tile bl" />
  </div>
);

export const AuthView: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const isWide = useIsWideScreen(DESKTOP_BREAKPOINT);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const clearMessages = () => {
    setError('');
    setInfo('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const result = await signUp(email.trim(), password, name.trim() || undefined);
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

  const handleForgotPassword = async () => {
    clearMessages();
    if (!email.trim()) {
      setError('Enter your email address above first, then tap "Forgot password?".');
      return;
    }
    const result = await resetPassword(email.trim());
    if (result.error) setError(result.error);
    else setInfo('Password reset link sent — check your inbox.');
  };

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    clearMessages();
  };

  const message = error ? { kind: 'error', text: error } : info ? { kind: 'info', text: info } : null;

  const tabs = (
    <div className="tabs" role="tablist">
      <button type="button" className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>
        Sign In
      </button>
      <button type="button" className={`tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>
        Create Account
      </button>
    </div>
  );

  const messageBanner = message && <p className={`auth-message is-${message.kind}`}>{message.text}</p>;

  // Desktop (split-panel) fields: an explicit label row above an icon+input control.
  const desktopNameField = mode === 'signup' && (
    <label className="field name-field">
      <span className="lbl">Full Name</span>
      <span className="control">
        <NameIcon />
        <input type="text" name="name" placeholder="Ada Lovelace" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      </span>
    </label>
  );

  const desktopEmailField = (
    <label className="field">
      <span className="lbl">Email Address</span>
      <span className="control">
        <EmailIcon />
        <input
          type="email"
          name="email"
          placeholder="name@university.edu"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </span>
    </label>
  );

  const desktopPasswordField = (
    <label className="field">
      <span className="lbl">
        Password
        {mode === 'login' && (
          <button type="button" className="forgot" onClick={handleForgotPassword}>
            Forgot password?
          </button>
        )}
      </span>
      <span className="control">
        <PasswordIcon />
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </span>
    </label>
  );

  // Mobile (card) fields: icon + input as direct siblings, placeholder text
  // doubles as the label (no separate .lbl row) — matches the app-login design.
  const mobileNameField = mode === 'signup' && (
    <label className="field name-field">
      <NameIcon />
      <input type="text" name="name" placeholder="Full Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
    </label>
  );

  const mobileEmailField = (
    <label className="field">
      <EmailIcon />
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </label>
  );

  const mobilePasswordField = (
    <label className="field">
      <PasswordIcon />
      <input
        type="password"
        name="password"
        placeholder="Password"
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </label>
  );

  const mobileForgotLink = mode === 'login' && (
    <button type="button" className="forgot" onClick={handleForgotPassword}>
      Forgot password?
    </button>
  );

  const submitButton = (
    <button type="submit" className="submit" disabled={submitting}>
      <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
      <ArrowIcon />
    </button>
  );

  const divider = (
    <div className="divider">
      <span>Or continue with</span>
    </div>
  );

  const socials = (
    <div className="socials">
      <button type="button" className="social" disabled title="Coming soon">
        <GoogleIcon />
        Google
      </button>
      <button type="button" className="social" disabled title="Coming soon">
        <AppleIcon />
        Apple
      </button>
    </div>
  );

  const terms = (
    <p className="terms">
      By continuing, you agree to GradeFlow's <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
    </p>
  );

  if (isWide) {
    return (
      <div className="gf-auth-web">
        <aside className="brand-panel">
          <div className="brand-inner">
            <div className="lockup">
              <Logo />
              <div className="wordmark">
                <span className="grade">GRADE</span>
                <span className="flow">flow.</span>
              </div>
            </div>

            <p className="tagline">
              Your academic life, <span className="in-flow">in flow.</span>
            </p>

            <div className="illus" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="cap">
                <path d="M12 3 1 8l11 5 9-4.1V15h2V8L12 3ZM5 12.2v3.3c0 1.7 3.1 3.5 7 3.5s7-1.8 7-3.5v-3.3l-7 3.2-7-3.2Z" />
              </svg>
              <span className="line l1" />
              <span className="line l2" />
            </div>
          </div>
        </aside>

        <section className="form-panel">
          <div className="auth">
            {tabs}

            <div className="heads">
              <div className="head">
                <h2>{mode === 'signup' ? 'Create your account' : 'Welcome Back'}</h2>
                <p>{mode === 'signup' ? 'Start keeping your grades in flow' : 'Log in to keep your grades in flow'}</p>
              </div>
            </div>

            {messageBanner}

            <form className="form" onSubmit={handleSubmit}>
              {desktopNameField}
              {desktopEmailField}
              {desktopPasswordField}
              {submitButton}
              {divider}
              {socials}
              {terms}
            </form>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="gf-auth-app">
      <header className="brand">
        <Logo />
        <h1 className="wordmark">
          <span className="grade">GRADE</span>
          <span className="flow">flow.</span>
        </h1>
        <p className="tagline">
          Your academic life, <span className="in-flow">in flow.</span>
        </p>
      </header>

      <section className="card auth">
        {tabs}

        {messageBanner}

        <form className="form" onSubmit={handleSubmit}>
          {mobileNameField}
          {mobileEmailField}
          {mobilePasswordField}
          {mobileForgotLink}
          {submitButton}
          {divider}
          {socials}
        </form>

        {terms}
      </section>
    </div>
  );
};
