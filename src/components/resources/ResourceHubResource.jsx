import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const resources = [
  { category: 'Calculators & Tools', icon: '🧮', items: ['Maintenance Cost Calculator', 'ROI Calculator', 'Asset QR Generator', 'Checklist Generator'], img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=480&h=200&fit=crop', color: '#2563EB' },
  { category: 'Learning & Training', icon: '🎓', items: ['Learning Center', 'Courses Library', 'Getting Started Guides', 'Video Tutorials'], img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=480&h=200&fit=crop', color: '#16a34a' },
  { category: 'Insights & Content', icon: '📰', items: ['FixNest Blog', 'Customer Stories', 'Webinars & Events', 'Product Releases'], img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=480&h=200&fit=crop', color: '#7c3aed' },
  { category: 'Support & Success', icon: '🤝', items: ['Support Center', 'Customer Success', 'Partnerships', 'Ask Anything AI'], img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=480&h=200&fit=crop', color: '#d97706' },
  { category: 'Product Intelligence', icon: '🤖', items: ['AI Assessments', 'Work Order Management', 'Maintenance Tracking', 'Intuitive Pricing'], img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=480&h=200&fit=crop', color: '#0891b2' },
  { category: 'Community & Reviews', icon: '⭐', items: ['Customer Reviews', 'G2 & Capterra Ratings', 'Community Forum', 'Partner Network'], img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=480&h=200&fit=crop', color: '#dc2626' },
];

export default function ResourceHubResource() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1400&h=380&fit=crop" alt="Resource Hub Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,15,45,0.88),rgba(30,60,150,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Resource Hub</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>Everything FixNest has built to help you learn, grow, and get the most out of your maintenance programme.</p>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '60px' }}>
          {resources.map((r) => (
            <div key={r.category} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <img src={r.img} alt={r.category} style={{ width: '100%', height: '170px', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6))` }} />
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{r.icon}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{r.category}</h3>
                </div>
                <ul style={{ marginTop: 0, paddingLeft: '18px', color: '#6b7280', fontSize: '13px', lineHeight: '2' }}>
                  {r.items.map(item => <li key={item} style={{ color: '#374151' }}>{item}</li>)}
                </ul>
                <button style={{ marginTop: '12px', padding: '8px 16px', background: r.color, color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Explore →</button>
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
