import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../../auth/AuthHeader';

const stats = [{ value: '50%', label: 'Faster Guest Response' }, { value: '40%', label: 'PM Compliance Gain' }, { value: '35%', label: 'Maintenance Cost Down' }, { value: '4.9★', label: 'Avg Guest Satisfaction' }];
const features = [
  { icon: '🏨', title: 'Guest Request Portal', desc: 'Guests scan a room QR code to report issues instantly — work order created automatically and routed to the nearest available technician.', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=480&h=180&fit=crop' },
  { icon: '🔧', title: 'Room & Asset PMs', desc: 'Scheduled PMs for HVAC, plumbing, electrical, and in-room equipment ensure every room is always in perfect condition.', img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=480&h=180&fit=crop' },
  { icon: '📊', title: 'Occupancy-Aware Scheduling', desc: 'FixNest reads your PMS system and schedules maintenance only during planned vacancies — no more disruptive mid-stay repairs.', img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=480&h=180&fit=crop' },
  { icon: '⚡', title: 'Energy Efficiency', desc: 'Monitor HVAC and electrical consumption and trigger maintenance when anomalies suggest equipment degradation before costs spike.', img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=480&h=180&fit=crop' },
  { icon: '📋', title: 'Brand Standards Compliance', desc: 'Brand audit checklists for room quality, fixture conditions, and cleanliness standards — digitised and scheduled automatically.', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=480&h=180&fit=crop' },
  { icon: '🍽️', title: 'F&B Equipment Management', desc: 'Keep kitchen equipment compliant and performing. Schedule health department inspections and commercial kitchen PMs automatically.', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=180&fit=crop' },
];

export default function HospitalitySolution() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&h=400&fit=crop" alt="Hospitality Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(10,5,30,0.87),rgba(120,37,99,0.52))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(249,168,212,0.2)', border: '1px solid rgba(249,168,212,0.4)', color: '#f9a8d4', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Hospitality</span>
          <h1 style={{ fontSize: '44px', fontWeight: '900', color: 'white', marginBottom: '14px' }}>Perfect Stays Start with Flawless Maintenance</h1>
          <p style={{ fontSize: '17px', color: '#e2e8f0', maxWidth: '560px', lineHeight: '1.6' }}>Faster guest request resolution, guest-invisible PMs, and equipment compliance that keeps your star rating and your sanity.</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '22px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 26px', background: 'linear-gradient(135deg,#9d174d,#be185d)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Go to Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '12px 26px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#831843,#9d174d)', padding: '24px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '14px' }}>
          {stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '12px', color: '#f9a8d4' }}>{s.label}</div></div>)}
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {features.map(f => (<div key={f.title} style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 4px 18px rgba(0,0,0,0.07)', overflow: 'hidden' }}><img src={f.img} alt={f.title} style={{ width: '100%', height: '155px', objectFit: 'cover' }} /><div style={{ padding: '18px' }}><div style={{ fontSize: '22px', marginBottom: '6px' }}>{f.icon}</div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{f.title}</h3><p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.7' }}>{f.desc}</p></div></div>))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 30px', background: 'linear-gradient(135deg,#9d174d,#be185d)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '13px 30px', backgroundColor: 'transparent', color: '#9d174d', border: '2px solid #9d174d', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
