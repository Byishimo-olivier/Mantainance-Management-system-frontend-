import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import backgroundVideo from '../../assets/136906-765457769_small.mp4';
import AuthHeader from './AuthHeader';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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

      {message ? (
        <div className="auth-card auth-card--narrow">
          <div className="auth-header auth-header--left">
            {/* Success icon */}
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
            <h1 className="auth-title" style={{ textAlign: 'center' }}>Check your email</h1>
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>
              {message}
            </p>
            <p style={{ textAlign: 'center', color: 'var(--auth-text-muted, #9ca3af)', fontSize: 13, marginTop: 4 }}>
              Didn't get it? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => setMessage('')}
                style={{ background: 'none', border: 'none', color: 'var(--auth-link-color, #2563eb)', cursor: 'pointer', fontWeight: 600, padding: 0, fontSize: 'inherit' }}
              >
                try again
              </button>
              .
            </p>
          </div>
          <div className="auth-footer" style={{ marginTop: 24 }}>
            <Link to="/login" className="auth-link">← Back to Login</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-card auth-card--narrow">
          <div className="auth-header auth-header--left">
            <h1 className="auth-title auth-title--left">Forgot Password</h1>
            <p className="auth-subtitle auth-subtitle--left">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          <div className="auth-field">
            <label htmlFor="forgot-email" className="auth-label">Email Address</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="auth-input"
            />
          </div>

          <button
            type="submit"
            className="auth-primary-btn"
            disabled={loading || !email}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-footer">
            Remember your password?{' '}
            <Link to="/login" className="auth-link">Log in</Link>
          </div>
        </form>
      )}
    </div>
  );
}
