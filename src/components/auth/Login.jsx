import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import backgroundVideo from '../../assets/136906-765457769_small.mp4';
import AuthHeader from './AuthHeader';

const getHomeRouteForRole = (role) => {
  const normalizedRole = String(role || '').trim().toLowerCase();
  // Fixed: Changed 'super-admin' to 'superadmin' for consistency
  if (normalizedRole === 'superadmin') return '/manager-dashboard';
  if (normalizedRole === 'admin' || normalizedRole === 'manager') return '/dashboard';
  if (normalizedRole === 'technician') return '/technician-dashboard';
  return '/dashboard';
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

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const isSubmitDisabled = isSubmitting || !email || !password;

  const handleGoogleLogin = () => {
    window.location.href = getBackendAuthUrl('/api/auth/google');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const data = res.data;
      if (res.status === 200) {
        if (onLogin && typeof onLogin === 'function') {
          onLogin(data.token, data.user);
        }
        navigate(getHomeRouteForRole(data.user?.role), { replace: true });
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.');
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
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay" />
      </div>
      <form
        onSubmit={handleSubmit}
        className="auth-card auth-card--narrow"
        noValidate
      >
        <div className="auth-header auth-header--left">
          <h1 className="auth-title auth-title--left">Log In</h1>
          <p className="auth-subtitle auth-subtitle--left">Continue to Fixnest</p>
        </div>

        <div className="auth-field">
          <label htmlFor="email" className="auth-label">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <div className="auth-label-row">
            <label htmlFor="password" className="auth-label">Password</label>
            <Link to="/forgot-password" className="auth-link auth-link--sm">Forgot Password?</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="auth-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle-btn"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '18px',
              }}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="auth-primary-btn"
          disabled={isSubmitDisabled}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <div className="auth-divider-with-text"><span>or</span></div>

        <div className="auth-provider-stack">
          <button type="button" className="auth-ghost-btn" onClick={handleGoogleLogin}>
            <GoogleLogo />
            Continue with Google
          </button>

          <Link to="/sso-login" className="auth-ghost-btn auth-ghost-link">Continue with company SSO</Link>
        </div>

        <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div>New to Fixnest? <Link to="/register" className="auth-link">Sign up</Link></div>
          <div style={{ fontSize: '0.85em', opacity: 0.8 }}>Interested in our plans? <Link to="/pricing" className="auth-link">See Pricing</Link></div>
        </div>
      </form>
    </div>
  );
}
