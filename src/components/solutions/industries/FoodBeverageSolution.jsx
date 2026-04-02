import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../../auth/AuthHeader';

const industryData = {
  FoodBeverage: {
    title: 'Food & Beverage',
    hero: 'Keep Every Line Running & Every Audit Passing',
    sub: 'Automated HACCP checks, equipment PMs, and hygiene compliance — so your production line never stops for avoidable equipment failures.',
    heroImg: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1400&h=400&fit=crop',
    accent: '#d97706',
    accentDark: '#b45309',
    statColor: '#fcd34d',
    stats: [{ value: '0', label: 'Regulatory Violations' }, { value: '99%', label: 'PM Compliance' }, { value: '40%', label: 'Downtime Reduction' }, { value: '100%', label: 'HACCP Audit Ready' }],
    features: [
      { icon: '🍽️', title: 'HACCP Compliance', desc: 'Automate hygiene inspections and critical control point checks — all documented and audit-ready.', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=180&fit=crop' },
      { icon: '🧽', title: 'Sanitation Work Orders', desc: 'Schedule and track all CIP cleaning cycles, linked to equipment records for full traceability.', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=480&h=180&fit=crop' },
      { icon: '⚙️', title: 'Line PM Scheduling', desc: 'Sync preventive maintenance with production windows so every PM is done without disrupting output.', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=480&h=180&fit=crop' },
      { icon: '🌡️', title: 'Temperature Monitoring', desc: 'Sensor alerts for cold chain and pasteurisation equipment — protecting both quality and compliance.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=180&fit=crop' },
      { icon: '📊', title: 'Quality Analytics', desc: 'Track equipment downtime impact on quality metrics and reduce batch failures from maintenance gaps.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=180&fit=crop' },
      { icon: '📋', title: 'Supplier Compliance', desc: 'Manage contractor certifications and service records for all third-party maintenance vendors.', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=480&h=180&fit=crop' },
    ],
  },
};

function IndustrySolutionPage({ data, navigateTo }) {
  const navigate = useNavigate();
  const d = data;
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
        <img src={d.heroImg} alt={d.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg,rgba(20,10,5,0.87),rgba(160,60,10,0.5))`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(253,230,138,0.2)', border: '1px solid rgba(253,230,138,0.4)', color: '#fde68a', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>{d.title}</span>
          <h1 style={{ fontSize: '44px', fontWeight: '900', color: 'white', marginBottom: '14px' }}>{d.hero}</h1>
          <p style={{ fontSize: '17px', color: '#e2e8f0', maxWidth: '560px', lineHeight: '1.6' }}>{d.sub}</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '22px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 26px', background: `linear-gradient(135deg,${d.accent},${d.accentDark})`, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Go to Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '12px 26px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: `linear-gradient(135deg,${d.accentDark},${d.accent})`, padding: '24px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '14px' }}>
          {d.stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '12px', color: d.statColor }}>{s.label}</div></div>)}
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {d.features.map(f => (
            <div key={f.title} style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 4px 18px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              <img src={f.img} alt={f.title} style={{ width: '100%', height: '155px', objectFit: 'cover' }} />
              <div style={{ padding: '18px' }}><div style={{ fontSize: '22px', marginBottom: '6px' }}>{f.icon}</div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{f.title}</h3><p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.7' }}>{f.desc}</p></div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 30px', background: `linear-gradient(135deg,${d.accent},${d.accentDark})`, color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '13px 30px', backgroundColor: 'transparent', color: d.accent, border: `2px solid ${d.accent}`, borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}

export default function FoodBeverageSolution() {
  return <IndustrySolutionPage data={industryData.FoodBeverage} />;
}
