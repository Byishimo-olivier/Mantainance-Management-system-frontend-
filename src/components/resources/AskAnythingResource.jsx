import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const suggestions = [
  'How do I create a preventive maintenance schedule?',
  'What is the difference between MTBF and MTTR?',
  'How do I set up IoT sensor alerts?',
  'Can I import assets from a spreadsheet?',
  'How do I generate an OSHA 300 log?',
];

const answers = [
  { q: 'How do I reduce equipment downtime?', icon: '⚡', img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=480&h=220&fit=crop', a: 'Implement a preventive maintenance programme using FixNest CMMS. Set recurring PM tasks based on usage or calendar intervals, assign them automatically to technicians, and track completion rates. AI triage ensures any reactive issues are handled before they escalate.' },
  { q: 'What is OEE and how do I track it?', icon: '📊', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=220&fit=crop', a: 'OEE (Overall Equipment Effectiveness) = Availability × Performance × Quality. FixNest Intelligence calculates OEE automatically from work order data, sensor readings, and production inputs, and shows trends on your analytics dashboard.' },
  { q: 'How do I manage contractor compliance?', icon: '🤝', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=480&h=220&fit=crop', a: 'Use FixNest Providers to track contractor certifications, insurance documents, and SLA terms. The system automatically flags expired credentials before a work order can be assigned to that contractor.' },
  { q: 'How do I set up mobile work order closing?', icon: '📱', img: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=480&h=220&fit=crop', a: 'Technicians access FixNest on any device without installing an app. From the mobile browser, they can view assigned work orders, update status, add photos, capture signatures, and close tasks — all in offline mode if needed.' },
];

export default function AskAnythingResource() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1400&h=380&fit=crop" alt="Ask Anything Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,10,45,0.88),rgba(37,99,235,0.45))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Ask FixNest Anything</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '560px', lineHeight: '1.6' }}>Maintenance questions answered instantly by our AI knowledge base — no support ticket needed.</p>
          <div style={{ display: 'flex', gap: '0', marginTop: '24px', width: '100%', maxWidth: '600px' }}>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask a maintenance question..." style={{ flex: 1, padding: '14px 20px', borderRadius: '8px 0 0 8px', border: 'none', fontSize: '16px', outline: 'none' }} />
            <button style={{ padding: '14px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '0 8px 8px 0', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>Ask →</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#374151', marginBottom: '16px' }}>Popular Questions</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {suggestions.map(s => <button key={s} onClick={() => setQuery(s)} style={{ padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '20px', fontSize: '14px', color: '#374151', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>{s}</button>)}
          </div>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Featured Answers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '60px' }}>
          {answers.map((a) => (
            <div key={a.q} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              <img src={a.img} alt={a.q} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>{a.icon} {a.q}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.7' }}>{a.a}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', backgroundColor: 'transparent', color: '#2563EB', border: '2px solid #2563EB', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
