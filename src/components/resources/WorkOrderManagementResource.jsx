import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const features = [
  { icon: '📝', title: 'Create in Seconds', desc: 'Submit a work order with a description, photo, and priority level in under 30 seconds from any device — no training required.', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=480&h=200&fit=crop' },
  { icon: '👷', title: 'Smart Technician Assignment', desc: 'AI assigns work orders to the right technician based on skills, location, and current workload — no dispatcher needed.', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=200&fit=crop' },
  { icon: '📊', title: 'Real-Time Status Tracking', desc: 'Requesters see exactly where their work order stands at all times. Managers see all open work across every team and site.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=200&fit=crop' },
  { icon: '📸', title: 'Photo & Video Attachments', desc: 'Capture evidence at the work site, attach to the work order, and build a visual history of every asset\'s maintenance record.', img: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=480&h=200&fit=crop' },
  { icon: '✅', title: 'Digital Checklists', desc: 'Attach step-by-step inspection checklists to any work order so technicians follow the right procedure every time — with signature capture.', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=480&h=200&fit=crop' },
  { icon: '💰', title: 'Cost Tracking', desc: 'Log labor hours and parts consumed on every work order. See true cost-per-asset data without any manual data entry.', img: 'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=480&h=200&fit=crop' },
];

export default function WorkOrderManagementResource() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1400&h=380&fit=crop" alt="Work Orders Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,20,50,0.87),rgba(20,80,160,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Work Order Management</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>From request to resolution — every maintenance task tracked, assigned, and closed with full visibility.</p>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginBottom: '60px' }}>
          {features.map((f) => (
            <div key={f.title} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <img src={f.img} alt={f.title} style={{ width: '100%', height: '165px', objectFit: 'cover' }} />
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '26px', marginBottom: '8px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.7' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', backgroundColor: 'transparent', color: '#2563EB', border: '2px solid #2563EB', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
