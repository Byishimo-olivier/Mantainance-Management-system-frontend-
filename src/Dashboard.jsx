import React from 'react';
import { Navigate } from 'react-router-dom';
import ClientDashboard from './components/ClientDashboard';

export default function Dashboard({ user }) {
  const normalizedRole = String(user?.role || '').trim().toLowerCase();

  if (normalizedRole === 'technician') {
    return <Navigate to="/technician-dashboard" replace />;
  } else if (normalizedRole === 'superadmin' || normalizedRole === 'super-admin') {
    return <Navigate to="/manager-dashboard" replace />;
  } else if (normalizedRole === 'admin' || normalizedRole === 'manager' || normalizedRole === 'client' || normalizedRole === 'requestor') {
    return <ClientDashboard user={user} />;
  }
  return <ClientDashboard user={user} />;
}
