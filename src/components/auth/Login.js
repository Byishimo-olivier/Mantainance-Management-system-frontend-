import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin && onLogin(data.token, data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #f0f4f8 0%, #e0e7ff 100%)'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          padding: '2rem 2.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          minWidth: '320px',
          maxWidth: '360px',
          width: '100%'
        }}
      >
        <h2 style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: '#3b3b3b',
          fontWeight: 700
        }}>Sign In</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: '0.5rem',
            boxShadow: '0 2px 8px rgba(99,102,241,0.08)'
          }}
        >Login</button>
        {error && <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '0.5rem', fontWeight: 500 }}>{error}</div>}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a href="/forgot-password" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500, marginRight: '1rem' }}>Forgot password?</a>
          <a href="/register" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>Sign up</a>
        </div>
      </form>
    </div>
  );
}
