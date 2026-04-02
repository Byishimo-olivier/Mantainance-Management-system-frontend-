import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../../auth/AuthHeader';

const stats = [{ value: '35%', label: 'Fuel Cost Savings' }, { value: '98%', label: 'PM Compliance' }, { value: '0', label: 'Unexpected Breakdowns' }, { value: '50%', label: 'DVIR Time Saved' }];
const features = [
  { icon: '📡', title: 'Telematics Integration', desc: 'Pull live GPS, mileage, engine hours, and fault codes from Geotab or Samsara directly into FixNest Fleet to trigger automatic PMs.', img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=480&h=200&fit=crop' },
  { icon: '🚛', title: 'Digital DVIR', desc: 'Replace paper pre-trip inspection forms with mobile digital DVIRs. Defects are automatically flagged and a work order is created instantly.', img: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=480&h=200&fit=crop' },
  { icon: '🔧', title: 'PM Scheduling', desc: 'Schedule preventive maintenance by distance, engine hours, or calendar — and receive automatic alerts before each service is due.', img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=480&h=200&fit=crop' },
  { icon: '📊', title: 'Fleet Cost Analytics', desc: 'See total cost of ownership per vehicle including fuel, repairs, and parts — and benchmark your fleet against industry standards.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=200&fit=crop' },
  { icon: '📋', title: 'DOT Compliance', desc: 'Automated documentation for DOT inspections and regulatory filings — keeping your fleet compliant without manual record-keeping.', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=480&h=200&fit=crop' },
  { icon: '📍', title: 'Roadside Assistance', desc: 'Drivers report breakdowns from a simple mobile form. The nearest mobile technician is auto-dispatched with full vehicle history.', img: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=480&h=200&fit=crop' },
];

export default function FleetManagementSolution() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=1400&h=400&fit=crop" alt="Fleet Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,30,10,0.87),rgba(20,100,50,0.52))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(167,243,208,0.2)', border: '1px solid rgba(167,243,208,0.4)', color: '#6ee7b7', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Fleet Management</span>
          <h1 style={{ fontSize: '46px', fontWeight: '900', color: 'white', marginBottom: '14px' }}>Keep Every Vehicle on the Road</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>From telematics-triggered PMs to digital DVIRs — FixNest Fleet eliminates unexpected breakdowns and keeps your vehicles compliant.</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '22px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 26px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Go to Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '12px 26px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
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
          {features.map(f => (
            <div key={f.title} style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 4px 18px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              <img src={f.img} alt={f.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
              <div style={{ padding: '18px' }}><div style={{ fontSize: '22px', marginBottom: '6px' }}>{f.icon}</div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{f.title}</h3><p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.7' }}>{f.desc}</p></div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 30px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '13px 30px', backgroundColor: 'transparent', color: '#16a34a', border: '2px solid #16a34a', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
