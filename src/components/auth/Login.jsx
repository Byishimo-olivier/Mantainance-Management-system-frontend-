
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        // Role-based redirect
        if (data.user && data.user.role === 'admin') {
          navigate('/manager-dashboard', { replace: true });
        } else if (data.user && data.user.role === 'manager') {
          navigate('/manager-dashboard', { replace: true });
        } else if (data.user && data.user.role === 'technician') {
          navigate('/technician-dashboard', { replace: true });
        } else if (data.user && data.user.role === 'client') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-indigo-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg min-w-[320px] max-w-[360px] w-full"
      >
        <h2 className="text-center mb-6 text-gray-800 font-bold text-2xl">Sign In</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-gray-600 font-medium">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full p-3 rounded-md border border-gray-300 text-base outline-none box-border"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-gray-600 font-medium">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full p-3 rounded-md border border-gray-300 text-base outline-none box-border"
          />
        </div>
        <div className="text-right mt-4 mb-6">
          <a href="/forgot-password" className="text-blue-600 font-medium mr-4 hover:underline">Forgot password?</a>
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white border-none rounded-md font-semibold text-base cursor-pointer mb-2 shadow-md hover:from-indigo-600 hover:to-blue-700 transition-colors"
        >Login</button>
        {error && <div className="text-red-500 text-center mt-2 font-medium">{error}</div>}
        <div className="text-center mt-4">
          <a href="/register" className="text-indigo-500 font-medium hover:underline">If you don't have an account, Sign up</a>
        </div>
      </form>
    </div>
  );
}
