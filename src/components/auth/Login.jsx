import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const isSubmitDisabled = isSubmitting || !email || !password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const data = res.data;
      if (res.status === 200) {
        onLogin && onLogin(data.token, data.user);
        navigate(getHomeRouteForRole(data.user?.role), { replace: true });
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Login failed');
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
      <form
        onSubmit={handleSubmit}
        className="auth-card auth-card--narrow"
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
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            className="auth-input"
          />
        </div>

        <button
          type="submit"
          className="auth-primary-btn"
          disabled={isSubmitDisabled}
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-divider-with-text"><span>or</span></div>

        <Link to="/sso-login" className="auth-ghost-btn auth-ghost-link">Continue with SSO</Link>

        <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div>New to Fixnest? <Link to="/register" className="auth-link">Sign up</Link></div>
          <div style={{ fontSize: '0.85em', opacity: 0.8 }}>Interested in our plans? <Link to="/pricing" className="auth-link">See Pricing</Link></div>
        </div>
      </form>
    </div>
  );
}
