import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '50%', label: 'MTTR Improvement' },
  { value: '40%', label: 'Emergency Repair Reduction' },
  { value: '98%', label: 'PM Compliance (avg)' },
  { value: '30%', label: 'Maintenance Cost Savings' },
];

const features = [
  { icon: '📋', title: 'Quick Work Order Creation', desc: 'Create detailed work orders in seconds with mobile access. AI auto-classifies priority and assigns to the best available technician instantly.', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=480&h=220&fit=crop' },
  { icon: '👤', title: 'Smart Assignment & Routing', desc: 'Automatically assign jobs to the best technician based on skills, current workload, and location — no dispatcher or coordinator needed.', img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=480&h=220&fit=crop' },
  { icon: '📊', title: 'Real-Time Tracking', desc: 'Monitor all open work orders across every team and site in real time. Requesters see their ticket status without calling the maintenance office.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=220&fit=crop' },
  { icon: '⏱️', title: 'Time & Labor Tracking', desc: 'Track labor hours, parts consumed, and actual repair costs per work order — driving accurate job costing without any manual timesheets.', img: 'https://images.unsplash.com/photo-1504908576619-be6571358ce1?w=480&h=220&fit=crop' },
  { icon: '📱', title: 'Mobile-First Platform', desc: 'Every technician accesses the full system from their phone. Offline mode ensures remote sites stay connected even without reliable internet.', img: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=480&h=220&fit=crop' },
  { icon: '📈', title: 'Performance Insights', desc: 'Get actionable data on team performance, KPIs, and cost trends. AI surfaces your biggest improvement opportunities automatically.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=220&fit=crop' },
];

export default function MaintenanceSolution() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1400&h=420&fit=crop" alt="Maintenance Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,20,50,0.87),rgba(20,80,160,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '16px' }}>Streamline Your Team's Operations</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>Reduce downtime, cut costs, and improve compliance with real-time visibility, AI triage, and mobile-first tools for your entire maintenance programme.</p>
          <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Go to Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '13px 28px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#1d4ed8)', padding: '26px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
          {stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '30px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '13px', color: '#93c5fd' }}>{s.label}</div></div>)}
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '26px', marginBottom: '50px' }}>
          {features.map(f => (
            <div key={f.title} style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 4px 18px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              <img src={f.img} alt={f.title} style={{ width: '100%', height: '170px', objectFit: 'cover' }} />
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{f.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.7' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', backgroundColor: 'transparent', color: '#2563EB', border: '2px solid #2563EB', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
