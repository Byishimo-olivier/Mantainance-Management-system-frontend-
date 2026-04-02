import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../../auth/AuthHeader';

const stats = [
  { value: '60%', label: 'Faster Service Requests' },
  { value: '100%', label: 'Audit Compliance' },
  { value: '40%', label: 'Cost Transparency' },
  { value: '50%', label: 'PM Completion Gain' },
];

const features = [
  { icon: '🏛️', title: 'Citizen Request Portal', desc: 'Let the public report infrastructure issues via a branded portal — triaged and assigned to the right crew automatically, with real-time status updates.', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=480&h=200&fit=crop' },
  { icon: '📋', title: 'Immutable Audit Trail', desc: 'Every work order, approval, and expenditure is timestamped and immutable — providing the public accountability that government agencies require.', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=480&h=200&fit=crop' },
  { icon: '🚧', title: 'Infrastructure Inspections', desc: 'Schedule and track inspections for roads, bridges, parks, storm drains, and public buildings with compliance checklists and photo capture.', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=200&fit=crop' },
  { icon: '📊', title: 'Budget & Cost Reporting', desc: 'Real-time cost tracking per department and asset category makes it easy to produce transparent public budget reports for stakeholders.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=200&fit=crop' },
  { icon: '🔧', title: 'Multi-Department Coordination', desc: 'Coordinate maintenance across roads, parks, facilities, water, and utilities from one shared platform — no more inter-department email chains.', img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=480&h=200&fit=crop' },
  { icon: '📱', title: 'Field Team Mobile', desc: 'Field crews update work orders, capture photos, and get directions from their phone — even in offline areas with no reliable connectivity.', img: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=480&h=200&fit=crop' },
];

export default function GovernmentPublicWorksSolution() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />

      {/* Hero */}
      <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1465189684280-6a8a9b5d4d24?w=1400&h=420&fit=crop"
          alt="Government & Public Works Hero"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,20,50,0.87),rgba(20,80,160,0.52))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(147,197,253,0.2)', border: '1px solid rgba(147,197,253,0.4)', color: '#93c5fd', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '18px', textTransform: 'uppercase' }}>Government & Public Works</span>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '16px', lineHeight: '1.1', maxWidth: '720px' }}>Maintain Public Infrastructure Reliably</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>Transparent work order management, full audit trails, and a citizen-facing request portal — built for public accountability and operational efficiency.</p>
          <div style={{ display: 'flex', gap: '14px', marginTop: '26px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}>Go to Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '13px 28px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#1d4ed8)', padding: '26px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: '900', color: 'white' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#93c5fd', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '34px', fontWeight: '800', color: '#111827', marginBottom: '14px' }}>From pothole reports to bridge inspections — all in one place</h2>
          <p style={{ fontSize: '17px', color: '#6b7280', maxWidth: '700px', lineHeight: '1.7', margin: '0 auto' }}>FixNest gives public works departments a modern, transparent maintenance platform — with the audit trails, compliance tools, and reporting that government agencies need.</p>
        </div>

        {/* Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '26px', marginBottom: '52px' }}>
          {features.map(f => (
            <div key={f.title} style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <img src={f.img} alt={f.title} style={{ width: '100%', height: '170px', objectFit: 'cover' }} />
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '7px' }}>{f.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.7' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius: '16px', padding: '40px', textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '18px', fontStyle: 'italic', color: '#1e40af', maxWidth: '660px', margin: '0 auto 18px', lineHeight: '1.7' }}>"FixNest transformed how our public works department communicates with citizens. Request-to-completion time dropped 60% and council now has real-time cost reporting at their fingertips."</p>
          <div style={{ fontWeight: '700', color: '#1e3a8a' }}>Director, Municipal Services — Regional City Council</div>
        </div>

        {/* CTAs */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', backgroundColor: 'transparent', color: '#2563EB', border: '2px solid #2563EB', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
