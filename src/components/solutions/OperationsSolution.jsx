import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '35%', label: 'Operational Cost Savings' },
  { value: 'Live', label: 'Visibility Across Sites' },
  { value: '200+', label: 'Integrations' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const features = [
  { icon: '🏭', title: 'Multi-Site Oversight', desc: 'Monitor maintenance KPIs, open work orders, and asset health across every site from one unified dashboard — no switching between systems.', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=480&h=220&fit=crop' },
  { icon: '🔗', title: 'ERP & Sensor Integration', desc: 'Connect FixNest to SAP, Oracle, IoT sensors, and telematics platforms so all your operational data feeds into one consistent picture.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=220&fit=crop' },
  { icon: '⚙️', title: 'Workflow Automation', desc: 'Build no-code automation rules that trigger work orders, escalations, purchase requests, and notifications based on real-time events.', img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=480&h=220&fit=crop' },
  { icon: '📊', title: 'Operations Analytics', desc: 'Executive-level reports on OEE, wrench time, cost variance, and team productivity — scheduled to your inbox automatically.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=220&fit=crop' },
  { icon: '🤖', title: 'AI Operations Insights', desc: 'AI continuously analyses your operational data and surfaces your top 3 cost reduction and efficiency opportunities — updated weekly.', img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=480&h=220&fit=crop' },
  { icon: '🛡️', title: 'Enterprise Security', desc: 'SOC 2 Type II compliant, with RBAC, SSO, audit logs, and configurable data retention policies that meet enterprise security standards.', img: 'https://images.unsplash.com/photo-1563986768609-7f64142e38de?w=480&h=220&fit=crop' },
];

export default function OperationsSolution() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1400&h=420&fit=crop" alt="Operations Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(10,5,30,0.87),rgba(59,20,130,0.52))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '16px' }}>Unify Your Operations</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>Connect every site, system, and team into one real-time operational platform — with AI insights, automation, and enterprise-grade security built in.</p>
          <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Go to Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '13px 28px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#3b0764,#6d28d9)', padding: '26px 24px' }}>
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
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', backgroundColor: 'transparent', color: '#7c3aed', border: '2px solid #7c3aed', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
