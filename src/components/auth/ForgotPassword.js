import React, { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
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
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Forgot Password</h2>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
      <button type="submit">Send Reset Link</button>
      {message && <div style={{color:'green'}}>{message}</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <a href="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>Back to Login</a>
      </div>
    </form>
  );
}
