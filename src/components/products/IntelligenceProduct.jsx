import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '60%', label: 'Faster Decisions' },
  { value: '3x', label: 'Productivity Boost' },
  { value: '80%', label: 'Report Automation' },
  { value: '<5 min', label: 'Avg Response Time' },
];

const features = [
  {
    icon: '🤖',
    title: 'AI Work Order Triage',
    desc: 'AI reads incoming requests, classifies priority, suggests technicians based on skill and location, and routes tickets instantly — no dispatcher required.',
    img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=480&h=280&fit=crop',
    alt: 'AI Work Order Triage',
  },
  {
    icon: '📊',
    title: 'Predictive Analytics',
    desc: 'Surface hidden failure patterns from historical work order data. Know which assets are likely to fail next week, not next breakdown.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=280&fit=crop',
    alt: 'Predictive Analytics Dashboard',
  },
  {
    icon: '🗣️',
    title: 'Natural Language Reports',
    desc: 'Ask questions in plain English: "What was our MTTR last month?" and get instant charts and summaries — no SQL, no BI tools needed.',
    img: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=480&h=280&q=80',
    alt: 'Natural Language AI Reports',
  },
  {
    icon: '⚡',
    title: 'Smart Scheduling',
    desc: 'Intelligence optimises PM schedules based on actual usage, asset health scores, and technician availability rather than fixed calendar intervals.',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=480&h=280&fit=crop',
    alt: 'AI Smart Scheduling',
  },
  {
    icon: '🔮',
    title: 'Anomaly Detection',
    desc: 'Continuous monitoring flags unusual patterns in work orders, costs, and sensor readings before they spiral into expensive incidents.',
    img: 'https://images.unsplash.com/photo-1527430253228-e93688616381?w=480&h=280&fit=crop',
    alt: 'Anomaly Detection AI',
  },
  {
    icon: '📝',
    title: 'Auto-Generated Summaries',
    desc: 'Shift reports, compliance summaries, and executive dashboards are drafted automatically and ready to share with one click.',
    img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=480&h=280&fit=crop',
    alt: 'Auto Generated Reports',
  },
];

export default function IntelligenceProduct() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />

      {/* Hero */}
      <div style={{ position: 'relative', width: '100%', height: '460px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1400&h=460&fit=crop"
          alt="Intelligence Hero"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,10,50,0.87) 0%, rgba(90,30,200,0.55) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(196,181,253,0.15)', border: '1px solid rgba(196,181,253,0.4)', color: '#c4b5fd', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase' }}>AI · Machine Learning</span>
          <h1 style={{ fontSize: '52px', fontWeight: '800', color: 'white', marginBottom: '16px', lineHeight: '1.15', maxWidth: '750px' }}>
            Intelligence That Works While You Do
          </h1>
          <p style={{ fontSize: '20px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>
            Embedded AI tools that eliminate busywork and surface insights your team would never find manually.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(124,58,237,0.5)' }}>
              Start Free Trial
            </button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
              See Pricing
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: 'linear-gradient(135deg, #3b0764, #5b21b6)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '24px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>{s.value}</div>
              <div style={{ fontSize: '14px', color: '#c4b5fd', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px' }}>
        <div style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
            AI that actually understands maintenance
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '760px', lineHeight: '1.7', margin: '0 auto' }}>
            FixNest Intelligence is purpose-built for asset operations — not a generic chatbot bolted on. It reads your work orders, learns from your assets, and helps every person on your team move faster and smarter.
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
        <div style={{ background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', borderRadius: '20px', padding: '48px', marginBottom: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>💬</div>
          <p style={{ fontSize: '20px', fontStyle: 'italic', color: '#5b21b6', maxWidth: '700px', margin: '0 auto 24px', lineHeight: '1.7' }}>
            "Intelligence automatically prioritizes our 300+ daily work orders. We cut triage time from 45 minutes to under 3 minutes per shift."
          </p>
          <div style={{ fontWeight: '700', color: '#3b0764' }}>Daniel K. — Director of Operations</div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: '700', cursor: 'pointer', marginRight: '16px', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}>
            Go to Dashboard
          </button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '16px 40px', backgroundColor: 'transparent', color: '#7c3aed', border: '2px solid #7c3aed', borderRadius: '10px', fontSize: '17px', fontWeight: '600', cursor: 'pointer' }}>
            View Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
