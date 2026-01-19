import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import ClientDashboard from './components/ClientDashboard';

export default function Dashboard({ user }) {
  if (user?.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  } else if (user?.role === 'manager') {
    return <Navigate to="/manager-dashboard" replace />;
  } else if (user?.role === 'technician') {
    return <Navigate to="/technician-dashboard" replace />;
  } else if (user?.role === 'client') {
    return <ClientDashboard user={user} />;
  }
  return <ClientDashboard user={user} />;
}
