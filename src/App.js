import React, { useState } from 'react';
import { Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './Dashboard';
import LandingPage from './components/LandingPage';
import AllIssues from './components/AllIssues';
import NewIssue from './components/NewIssue';
import ManagerDashboard from './components/ManagerDashboard';
import Analytics from './components/Analytics';
import TechnicianManagement from './components/TechnicianManagement';
import TechnicianDashboard from './components/TechnicianDashboard';
import Technicianissue from './components/ManagementIssues';
import ManagementIssues, { initialIssues as managementInitialIssues } from './components/ManagementIssues';

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
  const [issues, setIssues] = useState(managementInitialIssues);
  const navigate = useNavigate();

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({ token, user });
    if (user.role === 'admin' || user.role === 'manager') {
      navigate('/manager-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={auth ? (
        (auth.user?.role === 'admin' || auth.user?.role === 'manager') ? (
          <Navigate to="/manager-dashboard" replace />
        ) : <Dashboard user={auth.user} />
      ) : <Login onLogin={handleLogin} />} />
      <Route path="/issues" element={auth ? <AllIssues /> : <Login onLogin={handleLogin} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPasswordWrapper />} />
      <Route path="/new-issue" element={auth ? <NewIssue /> : <Login onLogin={handleLogin} />} />
      <Route path="/manager-dashboard" element={auth ? <ManagerDashboard /> : <Login onLogin={handleLogin} />} />
      <Route path="/analytics" element={auth ? <Analytics /> : <Login onLogin={handleLogin} />} />
      <Route path="/technicians" element={auth ? <TechnicianManagement /> : <Login onLogin={handleLogin} />} />
      <Route path="/technician-dashboard" element={auth ? <TechnicianDashboard /> : <Login onLogin={handleLogin} />} />
      <Route path="/manager-issues" element={auth ? <ManagementIssues issues={issues} setIssues={setIssues} /> : <Login onLogin={handleLogin} />} />
    </Routes>
  );
}

export default App;
