import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '50+', label: 'Standard KPIs' },
  { value: 'Live', label: 'Dashboard Updates' },
  { value: '8x', label: 'Faster Decisions' },
  { value: '100%', label: 'Data Accuracy' },
];

const features = [
  { icon: '📊', title: 'Live Dashboards', desc: 'Fully customisable dashboards showing MTTR, MTBF, OEE, PM compliance, and cost-per-asset — updated in real time from your field data.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=220&fit=crop' },
  { icon: '📈', title: 'Trend Analysis', desc: 'See how your KPIs are trending week over week and month over month. Spot early warning signs before they become expensive problems.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=220&fit=crop' },
  { icon: '🤖', title: 'AI Insights', desc: 'FixNest Intelligence surfaces your top cost drivers, most failure-prone assets, and best-performing technicians automatically — no analysis required.', img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=480&h=220&fit=crop' },
  { icon: '📅', title: 'Scheduled Reports', desc: 'Automatically email PDF or Excel reports to your leadership team on a daily, weekly, or monthly basis — without anyone manually pulling data.', img: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=480&h=220&fit=crop' },
  { icon: '🔗', title: 'BI Integration', desc: 'Stream your FixNest data live into Power BI, Tableau, or Google Looker via REST API or direct connector — no CSV exports needed.', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=480&h=220&fit=crop' },
  { icon: '🏆', title: 'Benchmarking', desc: 'Compare your KPIs to industry peers in your sector. See where you are ahead and where the biggest improvement opportunities lie.', img: 'https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9?w=480&h=220&fit=crop' },
];

export default function AnalyticsReportingFeature() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=420&fit=crop" alt="Analytics Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(15,5,50,0.87),rgba(80,20,180,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '16px' }}>Data-Driven Maintenance Decisions</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>Live dashboards, AI insights, and scheduled reports — turning maintenance data into executive decisions automatically.</p>
          <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
            <button onClick={() => navigate('/dashboard?tab=analytics')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>View Analytics</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '13px 28px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#4c1d95,#6d28d9)', padding: '26px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
          {stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '30px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '13px', color: '#c4b5fd' }}>{s.label}</div></div>)}
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
          <button onClick={() => navigate('/dashboard?tab=analytics')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>View Analytics</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', backgroundColor: 'transparent', color: '#7c3aed', border: '2px solid #7c3aed', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
