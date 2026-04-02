import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const partners = [
  { name: 'SAP', type: 'ERP Integration', desc: 'Bi-directional sync of assets, purchase orders, and maintenance costs between FixNest and SAP S/4HANA or ECC.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=200&fit=crop', badge: 'Certified' },
  { name: 'Microsoft Azure', type: 'Cloud & AI', desc: 'FixNest Intelligence is powered by Azure OpenAI — enterprise-grade AI security and compliance built in.', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=480&h=200&fit=crop', badge: 'Official' },
  { name: 'Twilio', type: 'Notifications', desc: 'SMS and WhatsApp alerts for work orders, escalations, and safety events via Twilio\'s global messaging network.', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=480&h=200&fit=crop', badge: 'Partner' },
  { name: 'Zebra Technologies', type: 'Scanning & Labelling', desc: 'Enterprise barcode and QR scanning for asset identification using Zebra handheld scanners and mobile computers.', img: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=480&h=200&fit=crop', badge: 'Hardware' },
  { name: 'Geotab', type: 'Fleet Telematics', desc: 'Pull live GPS, mileage, and engine data from Geotab into FixNest Fleet to trigger automated preventive maintenance.', img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=480&h=200&fit=crop', badge: 'Certified' },
  { name: 'Slack', type: 'Collaboration', desc: 'Deliver work order notifications, urgent alerts, and AI summaries directly into your team\'s Slack channels.', img: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=480&h=200&fit=crop', badge: 'App' },
];

export default function PartnershipsResource() {
  const navigate = useNavigate();
  const badgeColors = { Certified: '#2563EB', Official: '#7c3aed', Partner: '#16a34a', Hardware: '#d97706', App: '#0891b2' };
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1400&h=380&fit=crop" alt="Partnerships Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,15,40,0.87),rgba(20,60,140,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Technology Partners</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>FixNest connects seamlessly with the systems you already use — no rip-and-replace, no re-training.</p>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginBottom: '60px' }}>
          {partners.map((p) => (
            <div key={p.name} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <img src={p.img} alt={p.name} style={{ width: '100%', height: '165px', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '12px', right: '12px', background: badgeColors[p.badge] || '#374151', color: 'white', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>{p.badge}</span>
              </div>
              <div style={{ padding: '20px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{p.type}</span>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', margin: '4px 0 8px' }}>{p.name}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.7' }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius: '16px', padding: '40px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af', marginBottom: '12px' }}>Become a FixNest Partner</h2>
          <p style={{ color: '#3b82f6', marginBottom: '20px' }}>Join our global network of technology and implementation partners. Access co-marketing, deal registration, and dedicated partner support.</p>
          <button style={{ padding: '12px 28px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>Apply to Partner Program</button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', backgroundColor: 'transparent', color: '#2563EB', border: '2px solid #2563EB', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
