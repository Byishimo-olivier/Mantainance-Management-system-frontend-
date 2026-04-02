import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../../auth/AuthHeader';

const stats = [{ value: '28%', label: 'Generation Cost Reduction' }, { value: '99.99%', label: 'Asset Uptime' }, { value: '60%', label: 'Fewer Outages' }, { value: '100%', label: 'NERC CIP Compliance' }];
const features = [
  { icon: '⚡', title: 'Critical Asset Monitoring', desc: 'Real-time sensor data from transformers, turbines, and pumps — with AI alerts before a failure causes a service interruption.', img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=480&h=180&fit=crop' },
  { icon: '📋', title: 'NERC CIP Compliance', desc: 'Automate all required NERC CIP maintenance and documentation for electrical generation and transmission assets.', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=480&h=180&fit=crop' },
  { icon: '🌊', title: 'Predictive Grid Maintenance', desc: 'AI-driven predictions for transmission infrastructure maintenance — prioritised by asset criticality and load impact.', img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=480&h=180&fit=crop' },
  { icon: '🔧', title: 'Multi-Site Coordination', desc: 'Manage maintenance teams across substations, generation plants, and remote field sites from a single unified platform.', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=180&fit=crop' },
  { icon: '📊', title: 'OEE for Utilities', desc: 'Track Overall Equipment Effectiveness for generation assets and benchmark against your fleet to identify your lowest performers.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=180&fit=crop' },
  { icon: '🏗️', title: 'Capital Planning', desc: 'Asset depreciation tracking and failure cost analytics help you build a compelling capital replacement business case.', img: 'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=480&h=180&fit=crop' },
];

export default function EnergyUtilitiesSolution() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1400&h=400&fit=crop" alt="Energy Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(10,5,30,0.87),rgba(59,20,130,0.52))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(196,181,253,0.2)', border: '1px solid rgba(196,181,253,0.4)', color: '#c4b5fd', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Energy & Utilities</span>
          <h1 style={{ fontSize: '44px', fontWeight: '900', color: 'white', marginBottom: '14px' }}>Power That Never Goes Down</h1>
          <p style={{ fontSize: '17px', color: '#e2e8f0', maxWidth: '560px', lineHeight: '1.6' }}>AI-driven predictive maintenance for generation, transmission, and distribution assets — keeping the lights on and regulators satisfied.</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '22px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 26px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Go to Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '12px 26px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#3b0764,#6d28d9)', padding: '24px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '14px' }}>
          {stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '12px', color: '#c4b5fd' }}>{s.label}</div></div>)}
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {features.map(f => (
            <div key={f.title} style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 4px 18px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              <img src={f.img} alt={f.title} style={{ width: '100%', height: '155px', objectFit: 'cover' }} />
              <div style={{ padding: '18px' }}><div style={{ fontSize: '22px', marginBottom: '6px' }}>{f.icon}</div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{f.title}</h3><p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.7' }}>{f.desc}</p></div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 30px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '13px 30px', backgroundColor: 'transparent', color: '#7c3aed', border: '2px solid #7c3aed', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
