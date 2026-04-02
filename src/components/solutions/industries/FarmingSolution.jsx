import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../../auth/AuthHeader';

const stats = [{ value: '100%', label: 'Equipment Compliance' }, { value: '50%', label: 'Downtime Reduction' }, { value: '90%', label: 'Faster Work Orders' }, { value: '0', label: 'Missed Inspections' }];
const features = [
  { icon: '🌾', title: 'Agricultural Equipment PMs', desc: 'Schedule tractor, combine, and irrigation system PMs by engine hours or seasonal calendar — never enter harvest with a breakdown.', img: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=480&h=180&fit=crop' },
  { icon: '💧', title: 'Irrigation System Monitoring', desc: 'Sensor-based monitoring of pumps, valves, and pivot systems with automatic alerts when flow rates or pressures deviate.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=180&fit=crop' },
  { icon: '🐄', title: 'Livestock Facility Management', desc: 'Schedule maintenance on feeding systems, ventilation, and environmental controls critical to animal welfare compliance.', img: 'https://images.unsplash.com/photo-1486308510493-aa64833637bc?w=480&h=180&fit=crop' },
  { icon: '📱', title: 'Field Mobile Access', desc: 'Technicians update work orders from any field location — even in areas with limited connectivity using offline mode.', img: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=480&h=180&fit=crop' },
  { icon: '📊', title: 'Seasonal Cost Tracking', desc: 'Track maintenance costs by crop season and equipment type to optimise your annual farm maintenance budget.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=180&fit=crop' },
  { icon: '⚙️', title: 'Parts & Consumables', desc: 'Manage lubricants, filters, and wear parts inventory for all farm equipment — with auto-reorder when stock runs low before planting.', img: 'https://images.unsplash.com/photo-1553341640-6ebc7d6a77e9?w=480&h=180&fit=crop' },
];

export default function FarmingSolution() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1400&h=400&fit=crop" alt="Farming Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,30,5,0.87),rgba(30,100,20,0.52))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(187,247,208,0.2)', border: '1px solid rgba(187,247,208,0.4)', color: '#bbf7d0', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Farming & Agriculture</span>
          <h1 style={{ fontSize: '44px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>Never Miss a Harvest Because of Equipment</h1>
          <p style={{ fontSize: '17px', color: '#e2e8f0', maxWidth: '560px', lineHeight: '1.6' }}>Keep tractors, irrigation, and livestock systems running through every critical season — with predictive maintenance tailored for agriculture.</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Go to Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#14532d,#166534)', padding: '24px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '14px' }}>
          {stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '12px', color: '#86efac' }}>{s.label}</div></div>)}
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {features.map(f => (<div key={f.title} style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 4px 18px rgba(0,0,0,0.07)', overflow: 'hidden' }}><img src={f.img} alt={f.title} style={{ width: '100%', height: '155px', objectFit: 'cover' }} /><div style={{ padding: '18px' }}><div style={{ fontSize: '22px', marginBottom: '6px' }}>{f.icon}</div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{f.title}</h3><p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.7' }}>{f.desc}</p></div></div>))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 30px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '13px 30px', backgroundColor: 'transparent', color: '#16a34a', border: '2px solid #16a34a', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
