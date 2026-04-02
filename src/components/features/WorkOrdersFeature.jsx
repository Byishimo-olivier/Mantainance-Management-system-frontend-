import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

export default function WorkOrdersFeature() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <AuthHeader />
      
      {/* Hero Section with Image */}
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden', backgroundColor: '#1f2937' }}>
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop" 
          alt="Work Orders Hero"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'rgba(0,0,0,0.5)' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Work Orders Dashboard</h1>
          <p style={{ fontSize: '18px', color: '#e5e7eb', maxWidth: '600px' }}>Streamlined task management and tracking</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            Work Orders: Streamlined Task Management
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '800px', lineHeight: '1.6' }}>
            Create, assign, and track work orders efficiently. From creation to completion, 
            manage every maintenance task with full visibility and accountability.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '60px' }}>
          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop" 
              alt="Dynamic Forms"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
            />
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Dynamic Forms</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Create customizable work order forms with required fields, templates, and validation rules.</p>
          </div>

          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop" 
              alt="Smart Assignment"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
            />
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>👤</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Smart Assignment</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Automatically assign work orders based on technician skills, availability, and location.</p>
          </div>

          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=250&fit=crop" 
              alt="Mobile Access"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
            />
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📱</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Mobile Access</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Technicians can view and update work orders on mobile devices with offline capability.</p>
          </div>

          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1549923746-c53f14dd9d78?w=400&h=250&fit=crop" 
              alt="Time Tracking"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
            />
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏱️</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Time Tracking</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Track labor hours, parts used, and actual costs for accurate job costing.</p>
          </div>

          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1460925895917-adf4e565db1d?w=400&h=250&fit=crop" 
              alt="Status Tracking"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
            />
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✓</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Status Tracking</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Monitor work order progression through multiple status stages from creation to closure.</p>
          </div>

          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=250&fit=crop" 
              alt="Documentation"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
            />
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📸</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Documentation</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Attach photos, notes, and signatures to work orders for complete service documentation.</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '40px', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={() => navigate('/dashboard?tab=workOrders')}
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
            Create Work Orders
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
