import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import backgroundVideo from '../../assets/136906-765457769_small.mp4';
import AuthHeader from './AuthHeader';

export default function SsoLogin() {
  const [email, setEmail] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [useCompanyId, setUseCompanyId] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmitDisabled = isSubmitting || (useCompanyId ? !companyId.trim() : !email.trim());

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
        setError('SSO is not configured for this environment yet.');
      } else {
        setError(apiMessage || 'Unable to find SSO configuration for that domain.');
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
            Enter your email and we'll redirect you to your company's SSO provider.
          </p>
        </div>

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
