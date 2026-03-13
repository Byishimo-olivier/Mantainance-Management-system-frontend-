
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import backgroundVideo from '../../assets/136906-765457769_small.mp4';


export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const data = res.data;
      if (res.status === 200) {
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
      console.error(err);
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center glass-theme-blue relative overflow-hidden">
      <div className="video-background-container">
        <video autoPlay loop muted playsInline>
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="video-overlay" />
      </div>
      <form
        onSubmit={handleSubmit}
        className="glass-surface-strong p-8 rounded-2xl shadow-2xl border border-white/30 min-w-[320px] max-w-[380px] w-full relative z-10"
      >
        <h2 className="text-center mb-6 text-gray-900 font-black text-2xl">Sign In</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-gray-600 font-semibold">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full rounded-xl glass-input px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300/60 focus:border-blue-400 outline-none"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-gray-600 font-semibold">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full rounded-xl glass-input px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300/60 focus:border-blue-400 outline-none"
          />
        </div>
        <div className="text-right mt-4 mb-6">
          <a href="/forgot-password" className="text-blue-600 font-semibold mr-4 hover:underline">Forgot password?</a>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-base cursor-pointer mb-2 shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
        >Login</button>
        {error && <div className="text-rose-500 text-center mt-2 font-semibold">{error}</div>}
        {/* <div className="text-center mt-4">
          <a href="/register" className="text-indigo-500 font-medium hover:underline text-sm italic">If you don't have an account, Sign up</a>
        </div> */}
      </form>
    </div>
  );
}
