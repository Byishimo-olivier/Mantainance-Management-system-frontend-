import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '200+', label: 'Integrations' },
  { value: '<5 min', label: 'Setup Time' },
  { value: '99.9%', label: 'Sync Reliability' },
  { value: '0', label: 'Code Required' },
];

const features = [
  { icon: '🏭', title: 'ERP Integration', desc: 'Connect FixNest to SAP, Oracle, or Microsoft Dynamics to sync assets, purchase orders, and maintenance costs automatically — no manual bridging.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=240&fit=crop' },
  { icon: '📡', title: 'IoT & Sensor Connectivity', desc: 'Pull live readings from any BLE, LoRaWAN, or Wi-Fi sensor directly into work orders and PM triggers — no middleware required.', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=480&h=240&fit=crop' },
  { icon: '🔗', title: 'REST API', desc: 'Full REST API with webhook support lets your developers build custom integrations, sync data, and trigger FixNest actions from any external system.', img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=480&h=240&fit=crop' },
  { icon: '💬', title: 'Slack & Teams', desc: 'Route work order alerts, escalations, and AI summaries into your existing Slack or Microsoft Teams channels so your team never misses a critical update.', img: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=480&h=240&fit=crop' },
  { icon: '📊', title: 'BI & Analytics Tools', desc: 'Stream FixNest data directly into Power BI, Tableau, or Google Looker to build custom executive dashboards without any data exports.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=240&fit=crop' },
  { icon: '🔐', title: 'SSO & Identity Providers', desc: 'Connect to Azure AD, Okta, or Google Workspace so your team signs in with existing credentials — no new passwords, full enterprise security.', img: 'https://images.unsplash.com/photo-1563986768609-7f64142e38de?w=480&h=240&fit=crop' },
];

export default function IntegrationsFeature() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '440px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&h=440&fit=crop" alt="Integrations Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,10,40,0.88),rgba(14,165,233,0.45))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(125,211,252,0.2)', border: '1px solid rgba(125,211,252,0.4)', color: '#7dd3fc', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '18px', textTransform: 'uppercase' }}>Integrations</span>
          <h1 style={{ fontSize: '50px', fontWeight: '900', color: 'white', marginBottom: '16px', lineHeight: '1.1', maxWidth: '720px' }}>Connect Everything. Silo Nothing.</h1>
          <p style={{ fontSize: '19px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>200+ plug-and-play integrations — from ERPs and sensors to Slack and BI tools — all without writing a single line of code.</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 30px', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>Explore Integrations</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '13px 30px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#0c4a6e,#0284c7)', padding: '28px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
          {stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '13px', color: '#7dd3fc', marginTop: '3px' }}>{s.label}</div></div>)}
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '14px' }}>Your tech stack, all talking to each other</h2>
          <p style={{ fontSize: '17px', color: '#6b7280', maxWidth: '720px', lineHeight: '1.7', margin: '0 auto' }}>Stop copying data between systems. FixNest connects to your existing ERP, sensors, identity providers, and communication tools so every team always has the same up-to-date information.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '60px' }}>
          {features.map(f => (
            <div key={f.title} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <img src={f.img} alt={f.title} style={{ width: '100%', height: '185px', objectFit: 'cover' }} />
              <div style={{ padding: '22px' }}>
                <div style={{ fontSize: '26px', marginBottom: '8px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.7' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)', borderRadius: '18px', padding: '44px', textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '19px', fontStyle: 'italic', color: '#0369a1', maxWidth: '680px', margin: '0 auto 20px', lineHeight: '1.7' }}>"We connected FixNest to SAP and our SCADA sensor network in one weekend. The data flows automatically now — our weekly data reconciliation meetings no longer exist."</p>
          <div style={{ fontWeight: '700', color: '#0c4a6e' }}>Thomas N. — IT Director, Industrial Processing Group</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 36px', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginRight: '14px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 36px', backgroundColor: 'transparent', color: '#0ea5e9', border: '2px solid #0ea5e9', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
