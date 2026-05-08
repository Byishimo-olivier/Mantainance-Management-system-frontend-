import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

export default function CMSSProduct() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <AuthHeader />
      
      {/* Hero Section with Image */}
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden', backgroundColor: '#1f2937' }}>
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop" 
          alt="CMMS Hero"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'rgba(0,0,0,0.5)' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>CMMS System</h1>
          <p style={{ fontSize: '18px', color: '#e5e7eb', maxWidth: '600px' }}>Transform your maintenance operations</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            Computerized Maintenance Management System
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '800px', lineHeight: '1.6' }}>
            Mobile-first maintenance management that turns reactive firefighting into proactive operations. 
            Create work orders in seconds, automate preventive maintenance, and give your team real-time visibility from any device.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '60px' }}>
          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop" 
              alt="Work Orders"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
            />
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Work Order Management</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Create, assign, and track maintenance tasks in real-time with complete visibility across your team.</p>
          </div>

          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=250&fit=crop" 
              alt="Asset Tracking"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
            />
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔧</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Asset Tracking</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Maintain detailed asset records, track maintenance history, and optimize asset lifecycle management.</p>
          </div>

          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&h=250&q=80" 
              alt="Preventive Maintenance"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
            />
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Preventive Maintenance</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Schedule automated preventive maintenance to reduce downtime and extend asset lifespan.</p>
          </div>

          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop" 
              alt="Analytics Dashboard"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
            />
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Analytics Dashboard</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Get actionable insights with customizable reports and real-time performance metrics.</p>
          </div>

          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=250&fit=crop" 
              alt="Mobile Access"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
            />
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📱</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Mobile Access</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Access maintenance data from anywhere with our mobile-first application design.</p>
          </div>

          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=400&h=250&q=80" 
              alt="Security & Compliance"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
            />
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Security & Compliance</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Enterprise-grade security with audit trails and regulatory compliance features.</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '40px', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '14px 32px',
              backgroundColor: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginRight: '12px'
            }}
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/pricing')}
            style={{
              padding: '14px 32px',
              backgroundColor: 'transparent',
              color: '#2563EB',
              border: '2px solid #2563EB',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            View Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
