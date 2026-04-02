import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '75%', label: 'Incident Reduction' },
  { value: '100%', label: 'OSHA Log Automation' },
  { value: '0', label: 'Violations (avg client)' },
  { value: '4x', label: 'Faster CAPA Closure' },
];

const features = [
  { icon: '⚠️', title: 'Incident Reporting', desc: 'Capture safety events in under 30 seconds using voice-to-text. Workers scan a QR code — no app needed.', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=220&fit=crop' },
  { icon: '📋', title: 'OSHA Log Automation', desc: 'Every incident auto-filled into OSHA 300, 300A, and 301 logs — keeping you audit-ready year-round without manual work.', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=480&h=220&fit=crop' },
  { icon: '🔍', title: 'AI-Powered CAPAs', desc: 'AI analyses incident patterns and suggests corrective actions by root cause — so you eliminate hazards, not just symptoms.', img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=480&h=220&fit=crop' },
  { icon: '🗺️', title: 'Hazard Mapping', desc: 'Pin hazards on facility floor plans so every team member knows danger zones before entering — linked to safety briefings.', img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=480&h=220&fit=crop' },
  { icon: '📊', title: 'Leading & Lagging KPIs', desc: 'Track recordable incidents and near misses to measure your true safety culture health in real time.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=220&fit=crop' },
  { icon: '🏋️', title: 'Safety Training', desc: 'Roll out toolbox talks and compliance training through FixNest Learn, linked directly to incident types.', img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=480&h=220&fit=crop' },
];

export default function SafetyComplianceFeature() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1530811761207-8d9d22f0a141?w=1400&h=420&fit=crop" alt="Safety Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(60,5,5,0.87),rgba(180,30,30,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '16px' }}>Protect Your People. Stay Compliant, Always.</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>Instant incident reporting, automated OSHA logs, and AI-powered CAPAs — everything for a proactive safety culture.</p>
          <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
            <button onClick={() => navigate('/dashboard?tab=safety')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>View Safety Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '13px 28px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#7f1d1d,#991b1b)', padding: '26px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
          {stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '30px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '13px', color: '#fca5a5' }}>{s.label}</div></div>)}
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
          <button onClick={() => navigate('/dashboard?tab=safety')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>View Safety Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', backgroundColor: 'transparent', color: '#dc2626', border: '2px solid #dc2626', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
