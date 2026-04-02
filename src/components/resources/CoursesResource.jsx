import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const courses = [
  { title: 'CMMS Fundamentals', level: 'Beginner', duration: '2h 30min', enrolled: '4,200+', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=480&h=260&fit=crop', desc: 'Master the essentials of Computerized Maintenance Management — from work orders to asset tracking.' },
  { title: 'Preventive Maintenance Planning', level: 'Intermediate', duration: '3h 00min', enrolled: '2,800+', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=480&h=260&fit=crop', desc: 'Build data-driven PM programmes that extend asset life and reduce unplanned failures.' },
  { title: 'IoT & Sensor Integration', level: 'Advanced', duration: '4h 15min', enrolled: '1,500+', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=480&h=260&fit=crop', desc: 'Connect edge sensors to your CMMS and build automated maintenance triggers from real-time data.' },
  { title: 'Safety & EHS Management', level: 'Intermediate', duration: '2h 45min', enrolled: '3,100+', img: 'https://images.unsplash.com/photo-1530811761207-8d9d22f0a141?w=480&h=260&fit=crop', desc: 'Implement EHS frameworks, automate OSHA logs, and build a culture of proactive safety reporting.' },
  { title: 'Analytics & Reporting Mastery', level: 'Intermediate', duration: '2h 00min', enrolled: '2,200+', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=260&fit=crop', desc: 'Turn maintenance data into executive dashboards and KPI reports that drive real decisions.' },
  { title: 'Fleet Management Best Practices', level: 'Beginner', duration: '1h 45min', enrolled: '1,800+', img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=480&h=260&fit=crop', desc: 'Manage your vehicle fleet from telematics to inspections and preventive maintenance scheduling.' },
];

const levelColor = { Beginner: '#16a34a', Intermediate: '#d97706', Advanced: '#7c3aed' };

export default function CoursesResource() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1400&h=380&fit=crop" alt="Courses Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,40,10,0.87),rgba(16,100,60,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Maintenance Courses</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>Structured, expert-led courses that turn your team into maintenance professionals — at their own pace.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '60px' }}>
          {courses.map((c) => (
            <div key={c.title} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <img src={c.img} alt={c.title} style={{ width: '100%', height: '195px', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '12px', left: '12px', background: levelColor[c.level], color: 'white', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>{c.level}</span>
              </div>
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{c.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>{c.desc}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#9ca3af' }}>
                  <span>⏱ {c.duration}</span>
                  <span>👥 {c.enrolled} enrolled</span>
                </div>
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
