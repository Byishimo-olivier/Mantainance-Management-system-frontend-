import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const features = [
  { icon: '📋', title: 'Real-Time Work Order Tracking', desc: 'Every task, every technician, every status — visible in real time on a live dashboard so nothing slips through the cracks.', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=480&h=200&fit=crop' },
  { icon: '📊', title: 'MTTR & MTBF Reporting', desc: 'Measure mean time to repair and mean time between failures automatically from closed work orders — no spreadsheet needed.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=200&fit=crop' },
  { icon: '📱', title: 'Mobile Status Updates', desc: 'Technicians update work order status, add notes, and upload photos from any smartphone — even without an internet connection.', img: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=480&h=200&fit=crop' },
  { icon: '🔔', title: 'Automated Escalations', desc: 'If a high-priority work order isn\'t picked up within your SLA window, FixNest automatically escalates to the next manager level.', img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=480&h=200&fit=crop' },
  { icon: '🗓️', title: 'Scheduled Maintenance Calendar', desc: 'See every planned PM across all assets, teams, and locations on a shared maintenance calendar so nothing overlaps or gets skipped.', img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=480&h=200&fit=crop' },
  { icon: '💰', title: 'Cost Per Work Order', desc: 'Track parts, labor, and vendor costs per work order and roll them up by asset, team, or site to find your biggest cost drivers.', img: 'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=480&h=200&fit=crop' },
];

export default function MaintenanceTrackingResource() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1400&h=380&fit=crop" alt="Tracking Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,20,50,0.87),rgba(20,80,160,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Maintenance Tracking</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>See every asset, every task, and every technician in real-time. Never lose visibility into your maintenance programme again.</p>
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
