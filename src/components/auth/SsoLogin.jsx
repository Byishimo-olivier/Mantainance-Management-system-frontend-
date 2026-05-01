import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import backgroundVideo from '../../assets/136906-765457769_small.mp4';
import AuthHeader from './AuthHeader';

const getHomeRouteForRole = (role) => {
  const normalizedRole = String(role || '').trim().toLowerCase();
  if (normalizedRole === 'superadmin' || normalizedRole === 'super-admin') return '/manager-dashboard';
  if (normalizedRole === 'admin' || normalizedRole === 'manager') return '/dashboard';
  if (normalizedRole === 'technician') return '/technician-dashboard';
  return '/dashboard';
};

const decodeBase64UrlJson = (value) => {
  const normalized = decodeURIComponent(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return JSON.parse(atob(padded));
};

const getBackendAuthUrl = (path) => {
  const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const apiOrigin = apiUrl.replace(/\/api$/i, '');
  return `${apiOrigin || window.location.origin}${path}`;
};

const GoogleLogo = () => (
  <svg className="auth-provider-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.29h6.47c-.28 1.5-1.12 2.77-2.39 3.62v3.01h3.87c2.26-2.08 3.54-5.15 3.54-8.65z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3.01c-1.07.72-2.44 1.14-4.08 1.14-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1C3.25 21.29 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.26c-.24-.72-.38-1.49-.38-2.26s.14-1.54.38-2.26v-3.1H1.27C.46 8.25 0 10.07 0 12s.46 3.75 1.27 5.36l4-3.1z" />
    <path fill="#EA4335" d="M12 4.78c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.94 1.2 15.22 0 12 0 7.31 0 3.25 2.71 1.27 6.64l4 3.1C6.22 6.89 8.87 4.78 12 4.78z" />
  </svg>
);

export default function SsoLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [useCompanyId, setUseCompanyId] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSubmitDisabled = isSubmitting || (useCompanyId ? !companyId.trim() : !email.trim());

  const handleGoogleLogin = () => {
    window.location.href = getBackendAuthUrl('/api/auth/google');
  };

  useEffect(() => {
    const ssoError = searchParams.get('sso_error');
    if (ssoError) {
      setError(ssoError);
      return;
    }

    const hash = window.location.hash || '';
    const match = hash.match(/[#&]sso=([^&]+)/);
    if (!match) return;

    try {
      const payload = decodeBase64UrlJson(match[1]);
      if (!payload?.token || !payload?.user) throw new Error('SSO response was incomplete.');
      if (onLogin && typeof onLogin === 'function') {
        onLogin(payload.token, payload.user);
      } else {
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      }
      window.history.replaceState(null, '', '/sso-login');
      navigate(getHomeRouteForRole(payload.user?.role), { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to complete SSO login.');
    }
  }, [navigate, onLogin, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setMessage('');

    const cleanedEmail = email.trim().toLowerCase();
    const cleanedCompanyId = companyId.trim();

    if (!useCompanyId && !cleanedEmail) {
      setError('Enter your work email to continue.');
      return;
    }

    if (useCompanyId && !cleanedCompanyId) {
      setError('Enter your company ID to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/sso/initiate', {
        email: useCompanyId ? undefined : cleanedEmail,
        companyId: useCompanyId ? cleanedCompanyId : undefined
      });
      const data = res.data || {};
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setMessage('SSO request started. If configured, you will be redirected shortly.');
      }
    } catch (err) {
      const status = err.response?.status;
      const apiMessage = err.response?.data?.error;
      if (status === 404) {
        setError('Google sign-in is not configured yet. Please check the backend Google OAuth settings.');
      } else {
        setError(apiMessage || 'Unable to start Google sign-in.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell auth-shell--with-header">
      <AuthHeader />
      <div className="video-background-container">
        <video autoPlay loop muted playsInline className="video-background">
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="video-overlay" />
      </div>

      <form onSubmit={handleSubmit} className="auth-card auth-card--narrow">
        <div className="auth-header auth-header--left">
          <h1 className="auth-title auth-title--left">Single Sign-On</h1>
          <p className="auth-subtitle auth-subtitle--left">
            Enter your email and we'll redirect you to Google sign-in.
          </p>
        </div>

        <button type="button" className="auth-ghost-btn" onClick={handleGoogleLogin}>
          <GoogleLogo />
          Continue with Google
        </button>

        <div className="auth-divider-with-text"><span>or</span></div>

        {!useCompanyId ? (
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourcompany.com"
              autoComplete="email"
              required
              className="auth-input"
            />
          </div>
        ) : (
          <div className="auth-field">
            <label htmlFor="companyId" className="auth-label">Company ID</label>
            <input
              id="companyId"
              type="text"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="Enter your company ID"
              autoComplete="organization"
              required
              className="auth-input"
            />
          </div>
        )}

        <button type="submit" className="auth-primary-btn" disabled={isSubmitDisabled}>
          {isSubmitting ? 'Starting SSO...' : 'Continue'}
        </button>

        {message && <div className="auth-success">{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-divider auth-divider--tight" />

        <div className="auth-footer-row">
          <Link to="/login" className="auth-link">Return to Login</Link>
          <button
            type="button"
            className="auth-link auth-link-button"
            onClick={() => setUseCompanyId((prev) => !prev)}
          >
            {useCompanyId ? 'Use email instead' : 'Use company ID instead'}
          </button>
        </div>
      </form>
    </div>
  );
}
