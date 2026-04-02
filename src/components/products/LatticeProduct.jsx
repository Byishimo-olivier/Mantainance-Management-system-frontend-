import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '200+', label: 'Integrations' },
  { value: '99.95%', label: 'Data Uptime' },
  { value: '<100ms', label: 'Sync Latency' },
  { value: '5x', label: 'Faster Reporting' },
];

const features = [
  {
    icon: '🔗',
    title: 'Universal Data Layer',
    desc: 'Lattice serves as the single source of truth that unifies maintenance, safety, IoT, and ERP data across your entire technology stack.',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=480&h=280&fit=crop',
    alt: 'Data Integration Layer',
  },
  {
    icon: '🔄',
    title: 'Real-Time Data Sync',
    desc: 'Changes in any connected system propagate instantly through Lattice — no stale dashboards, no mismatched reports, no manual reconciliation.',
    img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=480&h=280&fit=crop',
    alt: 'Real-time Data Sync',
  },
  {
    icon: '🏗️',
    title: 'No-Code Connectors',
    desc: 'Point-and-click integrations with SAP, Oracle, Salesforce, and 200+ other platforms. No custom ETL development or IT involvement needed.',
    img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=480&h=280&fit=crop',
    alt: 'No-Code Integration Connectors',
  },
  {
    icon: '🛡️',
    title: 'Data Governance',
    desc: 'Role-based field-level access control, full audit logs, and GDPR/SOC 2 compliance built into every data flow so your team never exposes sensitive information.',
    img: 'https://images.unsplash.com/photo-1563986768609-7f64142e38de?w=480&h=280&fit=crop',
    alt: 'Data Governance Security',
  },
  {
    icon: '📐',
    title: 'Custom Data Models',
    desc: 'Extend the standard schema with custom fields, relationships, and entities that reflect how your business actually works — without writing a line of code.',
    img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=480&h=280&fit=crop',
    alt: 'Custom Data Models',
  },
  {
    icon: '📡',
    title: 'API & Webhooks',
    desc: 'Full REST API and event-driven webhooks let developers extend Lattice to build custom applications on top of your unified operational data.',
    img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=480&h=280&fit=crop',
    alt: 'API and Webhooks',
  },
];

export default function LatticeProduct() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />

      {/* Hero */}
      <div style={{ position: 'relative', width: '100%', height: '460px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&h=460&fit=crop"
          alt="Lattice Hero"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(5,10,30,0.88) 0%, rgba(20,80,160,0.55) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(147,197,253,0.15)', border: '1px solid rgba(147,197,253,0.4)', color: '#93c5fd', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase' }}>Data · Integration · Connectivity</span>
          <h1 style={{ fontSize: '52px', fontWeight: '800', color: 'white', marginBottom: '16px', lineHeight: '1.15', maxWidth: '750px' }}>
            One Data Foundation for Your Entire Operation
          </h1>
          <p style={{ fontSize: '20px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>
            Lattice is the connectivity layer that unifies maintenance, safety, and asset data across all platforms.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(14,165,233,0.4)' }}>
              Start Free Trial
            </button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
              See Pricing
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: 'linear-gradient(135deg, #0c4a6e, #0284c7)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '24px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>{s.value}</div>
              <div style={{ fontSize: '14px', color: '#7dd3fc', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px' }}>
        <div style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
            Connect everything. Silo nothing.
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '760px', lineHeight: '1.7', margin: '0 auto' }}>
            Lattice breaks down data silos by connecting your CMMS, ERP, sensor networks, and business intelligence tools into a single governed data layer — giving every team accurate, real-time information they can trust.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '80px' }}>
          {features.map((f) => (
            <div key={f.title} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <img src={f.img} alt={f.alt} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.7' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', borderRadius: '20px', padding: '48px', marginBottom: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>💬</div>
          <p style={{ fontSize: '20px', fontStyle: 'italic', color: '#0369a1', maxWidth: '700px', margin: '0 auto 24px', lineHeight: '1.7' }}>
            "Lattice connected our SAP and FixNest environments in a single weekend. Our maintenance reports are now 5x faster to produce and always accurate."
          </p>
          <div style={{ fontWeight: '700', color: '#0c4a6e' }}>Byishimo O. — IT Director, Regional Manufacturing Group</div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: '700', cursor: 'pointer', marginRight: '16px', boxShadow: '0 4px 15px rgba(14,165,233,0.3)' }}>
            Go to Dashboard
          </button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '16px 40px', backgroundColor: 'transparent', color: '#0ea5e9', border: '2px solid #0ea5e9', borderRadius: '10px', fontSize: '17px', fontWeight: '600', cursor: 'pointer' }}>
            View Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
