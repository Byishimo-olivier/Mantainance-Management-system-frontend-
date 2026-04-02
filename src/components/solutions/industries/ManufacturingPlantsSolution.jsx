import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../../auth/AuthHeader';

const stats = [{ value: '45%', label: 'Downtime Reduction' }, { value: '98%', label: 'OEE Improvement' }, { value: '30%', label: 'Maintenance Cost Savings' }, { value: '0', label: 'Regulatory Violations' }];
const features = [
  { icon: '🤖', title: 'Production Integration', desc: 'Sync maintenance with your production schedules so planned downtime never conflicts with critical runs.', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=480&h=200&fit=crop' },
  { icon: '📊', title: 'OEE Optimisation', desc: 'Monitor Overall Equipment Effectiveness automatically from sensor and work order data — with drill-down by line, shift, and asset.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=200&fit=crop' },
  { icon: '🔧', title: 'Multi-Site Management', desc: 'Manage maintenance across multiple plant locations from one unified dashboard. Compare performance by site instantly.', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=200&fit=crop' },
  { icon: '📈', title: 'Predictive Maintenance', desc: 'IoT sensors and AI predict failures before they halt production — cutting emergency repair costs by up to 60%.', img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=480&h=200&fit=crop' },
  { icon: '📋', title: 'Compliance & Safety', desc: 'Automated tracking of inspections, certifications, and OSHA logs — keeping you audit-ready every day of the year.', img: 'https://images.unsplash.com/photo-1530811761207-8d9d22f0a141?w=480&h=200&fit=crop' },
  { icon: '⚙️', title: 'ERP Integration', desc: 'Seamless integration with SAP, Oracle, and Microsoft Dynamics for unified asset and cost management.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=200&fit=crop' },
];

export default function ManufacturingPlantsSolution() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1400&h=400&fit=crop" alt="Manufacturing Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,20,50,0.87),rgba(20,80,160,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(147,197,253,0.2)', border: '1px solid rgba(147,197,253,0.4)', color: '#93c5fd', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Manufacturing & Plants</span>
          <h1 style={{ fontSize: '46px', fontWeight: '900', color: 'white', marginBottom: '14px' }}>Maximise Production Uptime</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>Reduce downtime, improve OEE, and maintain compliance across all your manufacturing facilities.</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '22px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 26px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Go to Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '12px 26px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#1d4ed8)', padding: '24px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '14px' }}>
          {stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '12px', color: '#93c5fd' }}>{s.label}</div></div>)}
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {features.map(f => (
            <div key={f.title} style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 4px 18px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              <img src={f.img} alt={f.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
              <div style={{ padding: '18px' }}><div style={{ fontSize: '22px', marginBottom: '6px' }}>{f.icon}</div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{f.title}</h3><p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.7' }}>{f.desc}</p></div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 30px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '13px 30px', backgroundColor: 'transparent', color: '#2563EB', border: '2px solid #2563EB', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
