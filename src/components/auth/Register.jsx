import React, { useState } from 'react';

export default function Register() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', role: 'CLIENT' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Registration successful! You can now log in.');
        navigate('/')
        setForm({ name: '', phone: '', email: '', password: '', role: 'CLIENT' });
      } else {
        setError(data.error || 'Registration failed');
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
          maxWidth: '400px',
          width: '100%'
        }}
      >
        <h2 style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: '#3b3b3b',
          fontWeight: 700
        }}>Create Account</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>Phone</label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>Role</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
          >
            <option value="CLIENT">Client</option>
            <option value="TECH">Technician</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginBottom: '0.5rem', boxShadow: '0 2px 8px rgba(99,102,241,0.08)' }}
        >Register</button>
        {success && <div style={{ color: '#22c55e', textAlign: 'center', marginTop: '0.5rem', fontWeight: 500 }}>{success}</div>}
        {error && <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '0.5rem', fontWeight: 500 }}>{error}</div>}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a href="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>Already have an account? Login</a>
        </div>
      </form>
    </div>
  );
}
