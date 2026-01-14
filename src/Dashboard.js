import React from 'react';

export default function Dashboard({ user }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome, {user?.name || 'User'}!</h1>
      <p>Your role: {user?.role}</p>
      <p>This is your dashboard.</p>
    </div>
  );
}
