import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const webinars = [
  { title: 'From Reactive to Preventive: A Live Masterclass', date: 'April 18, 2025 · 2:00 PM EAT', type: 'Webinar', img: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=480&h=260&fit=crop', desc: 'Join our lead product specialist for an in-depth session on building a PM programme from scratch — live Q&A included.' },
  { title: 'FixNest Spring 2025 Product Launch Event', date: 'April 25, 2025 · 11:00 AM EAT', type: 'Virtual Event', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=480&h=260&fit=crop', desc: 'Watch the live reveal of our Spring 2025 updates including AI triage, new Studio apps, and Fleet telematics.' },
  { title: 'IoT in Maintenance: A Practical Guide', date: 'May 7, 2025 · 3:00 PM EAT', type: 'Webinar', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=260&fit=crop', desc: 'How to choose, deploy, and make sense of wireless sensors in your maintenance programme — no IT department needed.' },
  { title: 'Maintenance Africa Summit 2025', date: 'June 10–11, 2025 · Nairobi', type: 'Conference', img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=480&h=260&fit=crop', desc: 'Africa\'s premier maintenance and reliability conference. FixNest is a Platinum Sponsor — meet us at Booth 12.' },
  { title: 'Safety & Compliance in Action', date: 'May 22, 2025 · 2:00 PM EAT', type: 'Webinar', img: 'https://images.unsplash.com/photo-1530811761207-8d9d22f0a141?w=480&h=260&fit=crop', desc: 'How to automate OSHA logs, build a near-miss culture, and use FixNest Safety to reduce recordable incidents.' },
  { title: 'Fleet Maintenance Deep Dive', date: 'June 5, 2025 · 10:00 AM EAT', type: 'Webinar', img: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=480&h=260&fit=crop', desc: 'Everything you need to know to connect telematics, digitise DVIRs, and run automated PMs for your entire fleet.' },
];

const typeColor = { Webinar: '#2563EB', 'Virtual Event': '#7c3aed', Conference: '#dc2626' };

export default function WebinarsEventsResource() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1400&h=380&fit=crop" alt="Webinars Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(10,5,30,0.87),rgba(60,20,120,0.52))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Webinars & Events</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>Live sessions, expert talks, and industry events. Learn from the best and connect with the FixNest community.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '60px' }}>
          {webinars.map((w) => (
            <div key={w.title} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <img src={w.img} alt={w.title} style={{ width: '100%', height: '195px', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '12px', left: '12px', background: typeColor[w.type] || '#2563EB', color: 'white', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>{w.type}</span>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>📅 {w.date}</div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '8px', lineHeight: '1.4' }}>{w.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>{w.desc}</p>
                <button style={{ padding: '8px 20px', background: '#eff6ff', color: '#2563EB', border: '1px solid #bfdbfe', borderRadius: '6px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Register Free</button>
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
