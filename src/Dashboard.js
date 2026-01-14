import React from 'react';
import ClientDashboard from './components/ClientDashboard';
import ManagerDashboard from './components/ManagerDashboard';

export default function Dashboard({ user }) {
  if (user?.role === 'admin' || user?.role === 'manager') {
    return <ManagerDashboard user={user} />;
  }
  return <ClientDashboard user={user} />;
}
