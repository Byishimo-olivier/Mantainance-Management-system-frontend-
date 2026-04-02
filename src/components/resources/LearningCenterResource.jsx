import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const topics = [
  { icon: '📖', title: 'Getting Started Guides', desc: 'Step-by-step onboarding articles that take you from signup to your first work order in under an hour.', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=480&h=200&fit=crop', count: '24 articles' },
  { icon: '🎥', title: 'Video Tutorials', desc: 'Short, focused video walkthroughs for every major feature — from PM scheduling to custom dashboards.', img: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=480&h=200&fit=crop', count: '60+ videos' },
  { icon: '📋', title: 'Best Practice Guides', desc: 'Deep-dive guides on maintenance strategy written by our in-house reliability engineers.', img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=480&h=200&fit=crop', count: '18 guides' },
  { icon: '🔧', title: 'Feature Documentation', desc: 'Detailed technical documentation for every FixNest feature, including APIs and integrations.', img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=480&h=200&fit=crop', count: '150+ docs' },
  { icon: '💡', title: 'Maintenance Glossary', desc: 'Definitions for 200+ maintenance, reliability, and EHS terms — from MTBF to condition-based monitoring.', img: 'https://images.unsplash.com/photo-1526628953301-3cd25d7ef046?w=480&h=200&fit=crop', count: '200+ terms' },
  { icon: '🌍', title: 'Industry Playbooks', desc: 'Role and industry-specific playbooks for manufacturing, facilities, healthcare, fleet, and more.', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=200&fit=crop', count: '12 playbooks' },
];

export default function LearningCenterResource() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1400&h=380&fit=crop" alt="Learning Center Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,30,10,0.87),rgba(16,100,80,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Learning Center</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>Everything you need to become a FixNest power user and a maintenance expert — all in one place.</p>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginBottom: '60px' }}>
          {topics.map((t) => (
            <div key={t.title} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', cursor: 'pointer' }}>
              <img src={t.img} alt={t.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '26px', marginBottom: '8px' }}>{t.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{t.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.6', marginBottom: '12px' }}>{t.desc}</p>
                <span style={{ background: '#eff6ff', color: '#2563EB', borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: '700' }}>{t.count}</span>
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
