import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '99.9%', label: 'Asset Uptime' },
  { value: '60%', label: 'Fewer Breakdowns' },
  { value: '30%', label: 'Cost Reduction' },
  { value: '100%', label: 'Lifecycle Visibility' },
];

const features = [
  { icon: '📊', title: 'Asset Registry', desc: 'Maintain a comprehensive database of all assets with specs, serial numbers, photos, locations, and custom fields — all searchable in seconds.', img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=480&h=240&fit=crop' },
  { icon: '🏷️', title: 'Barcode & QR Tracking', desc: 'Scan any asset with a phone camera to instantly pull up its full profile, maintenance history, and open work orders — no manual lookup needed.', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=480&h=240&fit=crop' },
  { icon: '💰', title: 'Total Cost of Ownership', desc: 'Track purchase price, maintenance spend, parts costs, and depreciation in one view so you can make data-driven repair vs. replace decisions.', img: 'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=480&h=240&fit=crop' },
  { icon: '📈', title: 'Depreciation Management', desc: 'Automatic straight-line and declining-balance depreciation calculations keep your asset valuations accurate for financial reporting.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=240&fit=crop' },
  { icon: '🔄', title: 'Lifecycle Management', desc: 'Track every asset from acquisition through operation, upgrades, and disposal — with full maintenance history attached at each stage.', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=240&fit=crop' },
  { icon: '⚠️', title: 'Health Alerts', desc: 'Receive proactive alerts for equipment failures, overdue maintenance, approaching end-of-life, and warranty expirations before they become problems.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=240&fit=crop' },
];

export default function AssetManagementFeature() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '440px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&h=440&fit=crop" alt="Asset Management Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,20,50,0.87),rgba(20,80,160,0.52))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(147,197,253,0.2)', border: '1px solid rgba(147,197,253,0.4)', color: '#93c5fd', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '18px', textTransform: 'uppercase' }}>Asset Management</span>
          <h1 style={{ fontSize: '50px', fontWeight: '900', color: 'white', marginBottom: '16px', lineHeight: '1.1', maxWidth: '720px' }}>Full Control Over Every Asset You Own</h1>
          <p style={{ fontSize: '19px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>Track, manage, and optimize every piece of equipment from acquisition to disposal — all in one system.</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/dashboard?tab=assets')} style={{ padding: '13px 30px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}>View Assets</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '13px 30px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563EB)', padding: '28px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
          {stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '13px', color: '#93c5fd', marginTop: '3px' }}>{s.label}</div></div>)}
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '14px' }}>From spreadsheets to a single source of truth</h2>
          <p style={{ fontSize: '17px', color: '#6b7280', maxWidth: '720px', lineHeight: '1.7', margin: '0 auto' }}>FixNest Asset Management gives you a live, searchable inventory of everything your team maintains — with full history, cost data, and health alerts built in from day one.</p>
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
        <div style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius: '18px', padding: '44px', textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '19px', fontStyle: 'italic', color: '#1e40af', maxWidth: '680px', margin: '0 auto 20px', lineHeight: '1.7' }}>"We had 800 assets tracked in 4 different spreadsheets. FixNest consolidated everything in a week. Now we know exactly where every piece of equipment is and when it was last serviced."</p>
          <div style={{ fontWeight: '700', color: '#1e3a8a' }}>Bernard O. — Maintenance Director, Regional Energy Group</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard?tab=assets')} style={{ padding: '14px 36px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginRight: '14px' }}>View Assets</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 36px', backgroundColor: 'transparent', color: '#2563EB', border: '2px solid #2563EB', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
