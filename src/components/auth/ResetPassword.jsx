import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword({ token }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f6fa',
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff',
        padding: '2rem 2.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
        minWidth: 320,
        maxWidth: 400,
        width: '100%'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#2d3436' }}>Reset Password</h2>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#636e72' }}>New Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #dfe6e9' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#636e72' }}>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #dfe6e9' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px 0',
            background: '#0984e3',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontWeight: 600,
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: 12
          }}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        {message && <div style={{ color: 'green', textAlign: 'center', marginBottom: 8 }}>{message}<br/>Redirecting to login...</div>}
        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</div>}
      </form>
    </div>
  );
}
