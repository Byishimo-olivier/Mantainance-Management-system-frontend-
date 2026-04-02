import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '75%', label: 'Incident Reduction' },
  { value: '<30s', label: 'Incident Report Time' },
  { value: '100%', label: 'OSHA Log Automation' },
  { value: '4x', label: 'Faster CAPA Closure' },
];

const features = [
  {
    icon: '⚠️',
    title: 'Instant Incident Reporting',
    desc: 'Voice-to-text reporting in any language lets workers capture safety events in under 30 seconds from any device — even without an account or app download.',
    img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=280&fit=crop',
    alt: 'Incident Reporting',
  },
  {
    icon: '📋',
    title: 'OSHA Log Automation',
    desc: 'Safety events are automatically categorised and filed into OSHA 300, 300A, and 301 logs — keeping you audit-ready every day of the year.',
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=480&h=280&fit=crop',
    alt: 'OSHA Automated Compliance Logs',
  },
  {
    icon: '🔍',
    title: 'AI-Powered CAPAs',
    desc: 'AI analyses incident patterns and auto-suggests corrective and preventive actions (CAPAs) ranked by impact — so you fix the root cause, not just the symptom.',
    img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=480&h=280&fit=crop',
    alt: 'AI CAPA Analysis',
  },
  {
    icon: '🗺️',
    title: 'Hazard Mapping',
    desc: 'Pin hazards directly onto facility floor plans and equipment diagrams. Every team member can see danger zones before setting foot in the area.',
    img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=480&h=280&fit=crop',
    alt: 'Hazard Mapping',
  },
  {
    icon: '🏋️',
    title: 'Safety Training Integration',
    desc: 'Roll out safety briefings, toolbox talks, and compliance training through FixNest Learn — all tracked and reported from one dashboard.',
    img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=480&h=280&fit=crop',
    alt: 'Safety Training',
  },
  {
    icon: '📊',
    title: 'EHS Analytics',
    desc: 'Track lagging indicators (incidents) and leading indicators (near misses, inspections) to measure the true health of your safety culture over time.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=280&fit=crop',
    alt: 'EHS Safety Analytics',
  },
];

export default function SafetyProduct() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />

      {/* Hero */}
      <div style={{ position: 'relative', width: '100%', height: '460px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1530811761207-8d9d22f0a141?w=1400&h=460&fit=crop"
          alt="Safety Hero"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(60,5,5,0.87) 0%, rgba(180,30,30,0.5) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(252,165,165,0.15)', border: '1px solid rgba(252,165,165,0.4)', color: '#fca5a5', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase' }}>EHS · Safety · Compliance</span>
          <h1 style={{ fontSize: '52px', fontWeight: '800', color: 'white', marginBottom: '16px', lineHeight: '1.15', maxWidth: '750px' }}>
            Protect Your People. Prove Your Compliance.
          </h1>
          <p style={{ fontSize: '20px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>
            Capture safety events in seconds, automate OSHA logs, and turn every incident into preventive action with AI-powered CAPAs.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(220,38,38,0.4)' }}>
              Start Free Trial
            </button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
              See Pricing
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: 'linear-gradient(135deg, #7f1d1d, #991b1b)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '24px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>{s.value}</div>
              <div style={{ fontSize: '14px', color: '#fca5a5', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px' }}>
        <div style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
            From reactive to preventive — automatically
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '760px', lineHeight: '1.7', margin: '0 auto' }}>
            FixNest Safety turns every incident report into structured data, uses AI to find the root cause, and automatically creates preventive actions linked to work orders — closing the loop before the next event.
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
        <div style={{ background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', borderRadius: '20px', padding: '48px', marginBottom: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>💬</div>
          <p style={{ fontSize: '20px', fontStyle: 'italic', color: '#991b1b', maxWidth: '700px', margin: '0 auto 24px', lineHeight: '1.7' }}>
            "Our recordable incident rate dropped 75% in 8 months. FixNest Safety didn't just help us report incidents — it helped us stop them."
          </p>
          <div style={{ fontWeight: '700', color: '#7f1d1d' }}>James W. — EHS Director, Industrial Group</div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: '700', cursor: 'pointer', marginRight: '16px', boxShadow: '0 4px 15px rgba(220,38,38,0.3)' }}>
            Go to Dashboard
          </button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '16px 40px', backgroundColor: 'transparent', color: '#dc2626', border: '2px solid #dc2626', borderRadius: '10px', fontSize: '17px', fontWeight: '600', cursor: 'pointer' }}>
            View Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
