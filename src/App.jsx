import React, { useState } from 'react'; // Deployment trigger commit
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import SsoLogin from './components/auth/SsoLogin';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AcceptInvite from './components/auth/AcceptInvite';
import Dashboard from './Dashboard';
import Pricing from './components/Pricing';
import Subscribe from './components/Subscribe';
import PaymentSelection from './components/PaymentSelection';
import PaymentConfirmation from './components/PaymentConfirmation';
import SubscriptionPlan from './components/SubscriptionPlan';
import LandingPage from './components/LandingPage';
import AllIssues from './components/AllIssues';
import NewIssue from './components/NewIssue';
import WorkOrder from './components/WorkOrder';
import ManagerDashboard from './components/ManagerDashboard';
import ClientDashboard from './components/ClientDashboard';
import Analytics from './components/Analytics';
import TechnicianManagement from './components/TechnicianManagement';
import TechnicianDashboard from './components/TechnicianDashboard';
import Technicianissue from './components/ManagementIssues';
import ManagementIssues from './components/ManagementIssues';
import PropertiesPage from './components/PropertiesPage';
import PropertyPublicView from './components/PropertyPublicView';
import PropertiesCards from './components/PropertiesCards';
import PropertyDetails from './components/PropertyDetails';
import PublicRequestForm from './components/PublicRequestForm';

import RequestsPage from './components/RequestsPage';

import Feedback from './components/Feedback';
import ManagerFeedback from './components/ManagerFeedback';
import AIChatbot from './components/AIChatbot';
import { LanguageProvider } from './i18n/LanguageContext';

const getHomeRouteForRole = (role) => {
  const normalizedRole = String(role || '').trim().toLowerCase();
  if (normalizedRole === 'superadmin' || normalizedRole === 'super-admin') return '/manager-dashboard';
  if (normalizedRole === 'admin' || normalizedRole === 'manager') return '/dashboard';
  if (normalizedRole === 'technician') return '/technician-dashboard';
  return '/dashboard';
};

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user ? { token, user: JSON.parse(user) } : null;
  });
  const [issues, setIssues] = useState([]); // State for issues, required by ManagementIssues
  const navigate = useNavigate();

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({ token, user });
    navigate(getHomeRouteForRole(user?.role));
  };

  return (
    <LanguageProvider>
      <div className="glass-app glass-theme-blue">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard user={auth?.user} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/sso-login" element={<SsoLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/payment-selection" element={<PaymentSelection />} />
          <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
          <Route path="/subscription" element={auth ? (
            <SubscriptionPlan userId={auth.user?.id} />
          ) : <Subscribe />} />
          <Route path="/dashboard" element={auth ? (
            <Dashboard user={auth.user} />
          ) : <Login onLogin={handleLogin} />} />
          <Route path="/dashboard/:view" element={auth ? (
            <Dashboard user={auth.user} />
          ) : <Login onLogin={handleLogin} />} />
          <Route path="/issues" element={auth ? <AllIssues /> : <Login onLogin={handleLogin} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/new-issue" element={<NewIssue />} />
          <Route path="/requests" element={auth ? <RequestsPage /> : <Login onLogin={handleLogin} />} />
          <Route path="/admin-dashboard" element={auth ? <Navigate to={getHomeRouteForRole(auth.user?.role)} replace /> : <Login onLogin={handleLogin} />} />
          <Route path="/manager-dashboard" element={auth ? (
            (String(auth.user?.role || '').toLowerCase() === 'superadmin' || String(auth.user?.role || '').toLowerCase() === 'super-admin')
              ? <ManagerDashboard />
              : <Navigate to={getHomeRouteForRole(auth.user?.role)} replace />
          ) : <Login onLogin={handleLogin} />} />
          <Route path="/analytics" element={auth ? <Analytics /> : <Login onLogin={handleLogin} />} />
          <Route path="/technicians" element={auth ? <TechnicianManagement /> : <Login onLogin={handleLogin} />} />
          <Route path="/technician-dashboard" element={auth ? <TechnicianDashboard /> : <Login onLogin={handleLogin} />} />
          <Route path="/manager-issues" element={auth ? <ManagementIssues issues={issues} setIssues={setIssues} /> : <Login onLogin={handleLogin} />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties-cards" element={<PropertiesCards />} />
          <Route path="/property-details/:id" element={<PropertyDetails />} />
          <Route path="/property/:id" element={<PropertyPublicView />} />
          <Route path="/property/:id" element={<PropertyPublicView />} />
          <Route path="/public-request/:companySlug" element={<PublicRequestForm />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/manager-feedback" element={auth ? <ManagerFeedback /> : <Login onLogin={handleLogin} />} />
        </Routes>
        <AIChatbot />
      </div>
    </LanguageProvider>
  );
}

export default App;
