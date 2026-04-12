import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '60%', label: 'Fewer Unplanned Failures' },
  { value: '3x', label: 'Asset Life Extension' },
  { value: '28%', label: 'MTTR Improvement' },
  { value: '99.9%', label: 'Data Accuracy' },
];

const features = [
  { icon: '🤖', title: 'Predictive Failure Alerts', desc: "AI analyses trend data and alerts your team when an asset's readings deviate from healthy baselines — days before a failure occurs.", img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=480&h=220&fit=crop' },
  { icon: '📊', title: 'Reliability Analytics', desc: 'Track MTBF, MTTR, OEE, and failure mode frequency across every asset with automatic trending — no manual data collection.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=220&fit=crop' },
  { icon: '🔧', title: 'RCM Workflows', desc: 'Build Reliability Centered Maintenance workflows that link failure modes to specific PM tasks — ensuring maintenance effort is always focused where it matters most.', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=220&fit=crop' },
  { icon: '📋', title: 'Condition-Based PM', desc: 'Replace time-based PMs with condition-based triggers. Work orders are generated automatically when usage counters or thresholds are met.', img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=480&h=220&fit=crop' },
  { icon: '🔍', title: 'Root Cause Analysis', desc: 'Structured RCA templates guide your team from incident to root cause, with AI-generated CAPA suggestions that close the reliability loop.', img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=480&h=220&fit=crop' },
];

export default function ReliabilitySolution() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1400&h=420&fit=crop" alt="Reliability Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,25,5,0.87),rgba(20,100,60,0.52))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '16px' }}>Predict Failures. Maximise Reliability.</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>AI-powered predictive alerts, reliability-centred workflows, and comprehensive analytics that keep your most critical assets running at peak performance.</p>
          <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Go to Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '13px 28px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#14532d,#166534)', padding: '26px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
          {stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '30px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '13px', color: '#86efac' }}>{s.label}</div></div>)}
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
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', backgroundColor: 'transparent', color: '#16a34a', border: '2px solid #16a34a', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
