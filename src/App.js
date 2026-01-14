import React, { useState } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './Dashboard';

function ResetPasswordWrapper() {
  const { token } = useParams();
  return <ResetPassword token={token} />;
}

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user ? { token, user: JSON.parse(user) } : null;
  });
  const navigate = useNavigate();

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({ token, user });
    navigate('/dashboard');
  };

  return (
    <Routes>
      <Route path="/" element={auth ? <Dashboard user={auth.user} /> : <Login onLogin={handleLogin} />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={auth ? <Dashboard user={auth.user} /> : <Login onLogin={handleLogin} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPasswordWrapper />} />
    </Routes>
  );
}

export default App;
