import React, { useState } from 'react';

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
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || 'Failed to send reset link');
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
        <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#2d3436' }}>Forgot Password</h2>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#636e72' }}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
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
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        {message && <div style={{ color: 'green', textAlign: 'center', marginBottom: 8 }}>{message}</div>}
        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</div>}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a href="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>Back to Login</a>
        </div>
      </form>
    </div>
  );
}
