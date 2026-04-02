import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const channels = [
  { icon: '💬', title: 'Live Chat', desc: 'Get answers in real-time from our support team — average first response under 2 minutes during business hours.', hours: 'Mon–Fri, 8am–8pm EAT', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=480&h=200&fit=crop', cta: 'Start Chat' },
  { icon: '📧', title: 'Email Support', desc: 'Send detailed questions with screenshots and our team will respond with a thorough solution, typically within 4 hours.', hours: '24/7 response within 4hrs', img: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=480&h=200&fit=crop', cta: 'Send Email' },
  { icon: '📞', title: 'Phone Support', desc: 'Enterprise customers have access to a dedicated support line with a named account engineer who knows your setup.', hours: 'Enterprise plans only', img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=480&h=200&fit=crop', cta: 'Call Now' },
  { icon: '📖', title: 'Help Center', desc: '500+ articles, step-by-step guides, and video walkthroughs for every FixNest feature. Search and find answers instantly.', hours: 'Always available', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=480&h=200&fit=crop', cta: 'Browse Articles' },
  { icon: '🎓', title: 'Training & Onboarding', desc: 'Get your team up to speed fast with a dedicated onboarding specialist who guides your setup from day one.', hours: 'All plans included', img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=480&h=200&fit=crop', cta: 'Book Session' },
  { icon: '🏘️', title: 'Community Forum', desc: 'Connect with 10,000+ FixNest users worldwide. Share tips, ask questions, and learn how others solve similar challenges.', hours: '24/7 community', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=480&h=200&fit=crop', cta: 'Join Community' },
];

export default function SupportCenterResource() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&h=380&fit=crop" alt="Support Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,20,50,0.87),rgba(20,80,160,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Support Center</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>Real humans. Fast responses. Always on your side. We're here whenever you need us.</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
            {[{ v: '< 2 min', l: 'Chat Response' }, { v: '< 4 hrs', l: 'Email Response' }, { v: '500+', l: 'Help Articles' }].map(s => (
              <div key={s.l} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 18px', backdropFilter: 'blur(6px)' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{s.v}</div>
                <div style={{ fontSize: '11px', color: '#93c5fd' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginBottom: '60px' }}>
          {channels.map((c) => (
            <div key={c.title} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <img src={c.img} alt={c.title} style={{ width: '100%', height: '165px', objectFit: 'cover' }} />
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '26px', marginBottom: '6px' }}>{c.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{c.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.6', marginBottom: '10px' }}>{c.desc}</p>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>🕐 {c.hours}</div>
                <button style={{ padding: '8px 18px', background: '#eff6ff', color: '#2563EB', border: '1px solid #bfdbfe', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>{c.cta}</button>
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
