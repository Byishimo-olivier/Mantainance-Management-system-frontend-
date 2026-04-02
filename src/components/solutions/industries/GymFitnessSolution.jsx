import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../../auth/AuthHeader';

const stats = [{ value: '60%', label: 'Equipment Downtime Cut' }, { value: '100%', label: 'Safety Compliance' }, { value: '40%', label: 'Admin Time Saved' }, { value: '50+', label: 'Equipment Types Tracked' }];
const features = [
  { icon: '🏋️', title: 'Fitness Equipment PMs', desc: 'Schedule treadmill belts, cable replacements, and equipment calibrations automatically — before breakdowns frustrate members.', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=480&h=160&fit=crop' },
  { icon: '🔥', title: 'HVAC & Ventilation', desc: 'Gyms need serious air exchange. Schedule and track HVAC filter changes and ventilation system PMs for optimal air quality.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=160&fit=crop' },
  { icon: '🚿', title: 'Locker Room & Plumbing', desc: 'Track shower, plumbing, and locker maintenance with work order templates — resolving issues before they reach social media.', img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=480&h=160&fit=crop' },
  { icon: '📋', title: 'Pool & Spa Compliance', desc: 'Automate daily water chemistry checks and equipment inspections for pools, saunas, and hot tubs — with digital log books.', img: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=480&h=160&fit=crop' },
  { icon: '📱', title: 'Member Issue Reporting', desc: 'Members scan a QR at broken equipment to report instantly — work order created, member notified when resolved.', img: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=480&h=160&fit=crop' },
  { icon: '📊', title: 'Multi-Location Analytics', desc: 'Compare equipment reliability and maintenance costs across all gym locations — identify your highest-cost assets fast.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=160&fit=crop' },
];

export default function GymFitnessSolution() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&h=400&fit=crop" alt="Gym Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(10,5,30,0.87),rgba(60,10,120,0.52))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(196,181,253,0.2)', border: '1px solid rgba(196,181,253,0.4)', color: '#c4b5fd', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Gym & Fitness</span>
          <h1 style={{ fontSize: '44px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>Keep Every Machine Ready. Every Day.</h1>
          <p style={{ fontSize: '17px', color: '#e2e8f0', maxWidth: '560px', lineHeight: '1.6' }}>Member satisfaction depends on equipment that just works. FixNest keeps every treadmill, pool, and locker room in perfect condition.</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Go to Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
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
          {features.map(f => (<div key={f.title} style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 4px 18px rgba(0,0,0,0.07)', overflow: 'hidden' }}><img src={f.img} alt={f.title} style={{ width: '100%', height: '145px', objectFit: 'cover' }} /><div style={{ padding: '18px' }}><div style={{ fontSize: '22px', marginBottom: '6px' }}>{f.icon}</div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{f.title}</h3><p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.7' }}>{f.desc}</p></div></div>))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 30px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '13px 30px', backgroundColor: 'transparent', color: '#7c3aed', border: '2px solid #7c3aed', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
