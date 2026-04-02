import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../../auth/AuthHeader';

const stats = [{ value: '100%', label: 'Equipment Compliance Rate' }, { value: '60%', label: 'Documentation Time Saved' }, { value: '0', label: 'Missed Inspections' }, { value: '24/7', label: 'Asset Monitoring' }];
const features = [
  { icon: '🏥', title: 'Medical Equipment Tracking', desc: 'Track every piece of clinical equipment from ventilators to infusion pumps — with manufacturer specs, service schedules, and warranty records in one place.', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=480&h=200&fit=crop' },
  { icon: '📋', title: 'TJC & DNV Compliance', desc: 'Automate scheduling for annual and biannual equipment inspections required by The Joint Commission and DNV — with zero-miss audit trails.', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=480&h=200&fit=crop' },
  { icon: '🚨', title: 'Facility Downtime Prevention', desc: 'HVAC, electrical, and plumbing failures in healthcare settings are critical. FixNest predictive PMs protect patient environment systems 24/7.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=200&fit=crop' },
  { icon: '📱', title: 'Mobile Biomedical Rounds', desc: 'Biomed technicians complete equipment inspection rounds on mobile — with checklists, measurements, and signature capture at the point of care.', img: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=480&h=200&fit=crop' },
  { icon: '🔐', title: 'HIPAA-Compliant Platform', desc: 'PHI-safe, SOC 2 Type II compliant infrastructure with full audit logs keeping your maintenance operations in line with healthcare privacy requirements.', img: 'https://images.unsplash.com/photo-1563986768609-7f64142e38de?w=480&h=200&fit=crop' },
  { icon: '🔔', title: 'Equipment Recall Alerts', desc: 'Automatically match manufacturer recall notices against your asset registry and create urgent work orders for affected equipment.', img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=480&h=200&fit=crop' },
];

export default function HealthcareSolution() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&h=400&fit=crop" alt="Healthcare Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,15,40,0.88),rgba(14,116,144,0.52))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(165,243,252,0.2)', border: '1px solid rgba(165,243,252,0.4)', color: '#67e8f9', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Healthcare</span>
          <h1 style={{ fontSize: '46px', fontWeight: '900', color: 'white', marginBottom: '14px' }}>Equipment Compliance You Can Count On</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>From medical devices to facility systems — FixNest keeps every regulated asset compliant, inspected, and running safely.</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '22px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 26px', background: 'linear-gradient(135deg,#0e7490,#0891b2)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Go to Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '12px 26px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#164e63,#0e7490)', padding: '24px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '14px' }}>
          {stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '12px', color: '#67e8f9' }}>{s.label}</div></div>)}
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
          <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 30px', background: 'linear-gradient(135deg,#0e7490,#0891b2)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '13px 30px', backgroundColor: 'transparent', color: '#0e7490', border: '2px solid #0e7490', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
