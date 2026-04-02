import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '30+', label: 'Ready-Made Apps' },
  { value: '0', label: 'Lines of Code Needed' },
  { value: '10x', label: 'Faster App Delivery' },
  { value: '100%', label: 'On Existing Data' },
];

const features = [
  {
    icon: '🏗️',
    title: 'Drag-and-Drop Builder',
    desc: 'Build entirely custom maintenance apps using a visual drag-and-drop interface. Forms, checklists, dashboards, and workflows — no developers required.',
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=480&h=280&fit=crop',
    alt: 'No-Code App Builder',
  },
  {
    icon: '📦',
    title: 'App Marketplace',
    desc: 'Install 30+ pre-built apps instantly — from downtime trackers to permit-to-work forms — and customise them to match your exact processes.',
    img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=480&h=280&fit=crop',
    alt: 'App Marketplace',
  },
  {
    icon: '🔐',
    title: 'Inherits Your Permissions',
    desc: 'Every Studio app automatically runs on your existing FixNest roles, sites, and data access controls — no separate security configuration needed.',
    img: 'https://images.unsplash.com/photo-1563986768609-7f64142e38de?w=480&h=280&fit=crop',
    alt: 'Permissions and Security',
  },
  {
    icon: '📊',
    title: 'Live Data Dashboards',
    desc: 'Embed charts, KPIs, and live tables that pull from your operational data and refresh in real-time — without exporting to spreadsheets.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=280&fit=crop',
    alt: 'Live Dashboards Studio',
  },
  {
    icon: '🔄',
    title: 'Custom Workflows',
    desc: 'Build multi-step approval processes, escalation paths, and notification rules that wire directly into your existing work order and asset data.',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=480&h=280&fit=crop',
    alt: 'Custom Workflow Builder',
  },
  {
    icon: '📱',
    title: 'Offline Capable',
    desc: 'Studio apps work in the field without a connection. Data syncs automatically when connectivity is restored — no data loss, no delays.',
    img: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=480&h=280&fit=crop',
    alt: 'Offline Mobile App',
  },
];

export default function StudioProduct() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />

      {/* Hero */}
      <div style={{ position: 'relative', width: '100%', height: '460px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&h=460&fit=crop"
          alt="Studio Hero"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,10,40,0.88) 0%, rgba(60,20,100,0.55) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(216,180,254,0.15)', border: '1px solid rgba(216,180,254,0.4)', color: '#e9d5ff', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase' }}>No-Code · Custom Apps · Platform</span>
          <h1 style={{ fontSize: '52px', fontWeight: '800', color: 'white', marginBottom: '16px', lineHeight: '1.15', maxWidth: '750px' }}>
            Build the Exact Tools Your Team Needs
          </h1>
          <p style={{ fontSize: '20px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>
            Custom app platform that lets anyone on your team build the tools they need — no code, no IT, no limits.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #9333ea, #7c3aed)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(147,51,234,0.5)' }}>
              Start Free Trial
            </button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
              See Pricing
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: 'linear-gradient(135deg, #4c1d95, #6d28d9)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '24px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>{s.value}</div>
              <div style={{ fontSize: '14px', color: '#d8b4fe', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px' }}>
        <div style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
            Every team's toolkit. One platform.
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '760px', lineHeight: '1.7', margin: '0 auto' }}>
            Studio empowers operations managers, maintenance supervisors, and safety leads to build the apps they've always wanted — running on your real data, respecting your permissions, and available on any device.
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
        <div style={{ background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', borderRadius: '20px', padding: '48px', marginBottom: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>💬</div>
          <p style={{ fontSize: '20px', fontStyle: 'italic', color: '#6d28d9', maxWidth: '700px', margin: '0 auto 24px', lineHeight: '1.7' }}>
            "We built a custom permit-to-work app in a single afternoon. It would have taken our IT team 3 months and $50K. Studio is remarkable."
          </p>
          <div style={{ fontWeight: '700', color: '#4c1d95' }}>Lisa R. — Digital Transformation Lead</div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #9333ea, #7c3aed)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: '700', cursor: 'pointer', marginRight: '16px', boxShadow: '0 4px 15px rgba(147,51,234,0.3)' }}>
            Go to Dashboard
          </button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '16px 40px', backgroundColor: 'transparent', color: '#9333ea', border: '2px solid #9333ea', borderRadius: '10px', fontSize: '17px', fontWeight: '600', cursor: 'pointer' }}>
            View Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
