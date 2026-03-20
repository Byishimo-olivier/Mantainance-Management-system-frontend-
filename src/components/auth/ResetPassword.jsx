import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import backgroundVideo from '../../assets/136906-765457769_small.mp4';
import AuthHeader from './AuthHeader';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/api/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Eye icon toggle component
  const EyeToggle = ({ show, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        color: '#9ca3af',
        display: 'flex',
        alignItems: 'center',
      }}
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );

  return (
    <div className="auth-shell auth-shell--with-header">
      <AuthHeader />
      <div className="video-background-container">
        <video autoPlay loop muted playsInline className="video-background">
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="video-overlay" />
      </div>

      {message ? (
        <div className="auth-card auth-card--narrow">
          <div className="auth-header auth-header--left">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                marginBottom: 8,
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h1 className="auth-title" style={{ textAlign: 'center' }}>Password Reset!</h1>
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>
              {message}
            </p>
            <p style={{ textAlign: 'center', color: 'var(--auth-text-muted, #9ca3af)', fontSize: 13, marginTop: 4 }}>
              Redirecting you to login in a moment…
            </p>
          </div>
          <div className="auth-footer" style={{ marginTop: 24 }}>
            <Link to="/login" className="auth-primary-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Go to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-card auth-card--narrow">
          <div className="auth-header auth-header--left">
            <h1 className="auth-title auth-title--left">Reset Password</h1>
            <p className="auth-subtitle auth-subtitle--left">
              Choose a strong new password for your account.
            </p>
          </div>

          <div className="auth-field">
            <label htmlFor="new-password" className="auth-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                className="auth-input"
                style={{ paddingRight: 40 }}
              />
              <EyeToggle show={showPassword} onToggle={() => setShowPassword(v => !v)} />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="confirm-password" className="auth-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                autoComplete="new-password"
                required
                className="auth-input"
                style={{ paddingRight: 40 }}
              />
              <EyeToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword(v => !v)} />
            </div>
          </div>

          <button
            type="submit"
            className="auth-primary-btn"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-footer">
            <Link to="/forgot-password" className="auth-link">Request a new link</Link>
          </div>
        </form>
      )}
    </div>
  );
}
