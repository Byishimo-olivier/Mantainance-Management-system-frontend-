import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import backgroundVideo from '../../assets/136906-765457769_small.mp4';
import AuthHeader from './AuthHeader';

const roleLabelFromInvite = (role, accessLevel) => {
  const lvl = String(accessLevel || '').toLowerCase();
  const base = String(role || '').toLowerCase();
  if (base === 'manager') return lvl === 'limited' ? 'Limited Administrator' : 'Administrator';
  if (base === 'technician') return lvl === 'limited' ? 'Limited Technician' : 'Technician';
  if (base === 'requestor') return 'Requester';
  if (base === 'client') return 'View Only';
  if (base === 'admin') return lvl === 'limited' ? 'Limited Administrator' : 'Administrator';
  if (!base) return 'User';
  return lvl === 'limited' ? `Limited ${base}` : base;
};

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => String(searchParams.get('token') || '').trim(), [searchParams]);

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' });

  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setError('');
      setInvite(null);
      if (!token) {
        setLoading(false);
        setError('Missing invite token.');
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/api/users/invite/${token}`);
        if (!alive) return;
        setInvite(res.data || null);
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.error || err?.response?.data?.message || err.message || 'Failed to load invite.');
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [token]);

  const submitDisabled =
    loading ||
    isSubmitting ||
    !invite ||
    !String(form.name || '').trim() ||
    !String(form.phone || '').trim() ||
    !form.password ||
    form.password !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitDisabled) return;
    setError('');
    setIsSubmitting(true);
    try {
      await api.post('/api/users/accept-invite', {
        token,
        name: String(form.name || '').trim(),
        phone: String(form.phone || '').trim(),
        password: form.password
      });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || err.message || 'Failed to accept invite.');
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
          <h1 className="auth-title auth-title--left">Accept Invitation</h1>
          <p className="auth-subtitle auth-subtitle--left">
            {loading ? 'Loading invite…' : invite ? 'Create your account to continue.' : 'Invite not available.'}
          </p>
        </div>

        {invite && (
          <div className="auth-field">
            <div className="text-sm text-slate-700">
              <div><strong>Email:</strong> {invite.email}</div>
              <div><strong>Role:</strong> {roleLabelFromInvite(invite.role, invite.accessLevel)}</div>
            </div>
          </div>
        )}

        <div className="auth-field">
          <label className="auth-label" htmlFor="name">Full Name</label>
          <input
            id="name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Enter your name"
            required
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="phone">Phone</label>
          <input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="Enter your phone number"
            required
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="Create a password"
            autoComplete="new-password"
            required
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            placeholder="Repeat your password"
            autoComplete="new-password"
            required
            className="auth-input"
          />
        </div>

        <button type="submit" className="auth-primary-btn" disabled={submitDisabled}>
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </button>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Log in</Link>
        </div>
      </form>
    </div>
  );
}

