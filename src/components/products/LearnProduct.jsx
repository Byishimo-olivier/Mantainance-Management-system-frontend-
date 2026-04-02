import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '95%', label: 'Course Completion' },
  { value: '70%', label: 'Training Time Saved' },
  { value: '100%', label: 'Compliance Coverage' },
  { value: '50+', label: 'Ready-Made Courses' },
];

const features = [
  {
    icon: '📚',
    title: 'Job-Relevant Training',
    desc: 'Deliver bite-sized training modules directly linked to each technician\'s role, asset type, and upcoming work orders — right on their phone.',
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=480&h=280&fit=crop',
    alt: 'Online Learning Training',
  },
  {
    icon: '🏅',
    title: 'Certification Tracking',
    desc: 'Track every certification, expiry date, and renewal requirement automatically. Get alerts before certifications lapse so you stay audit-ready.',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=480&h=280&fit=crop',
    alt: 'Certification Tracking',
  },
  {
    icon: '🎓',
    title: 'Custom Course Builder',
    desc: 'Create courses tailored to your SOPs using videos, quizzes, and interactive checklists — no instructional design background required.',
    img: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=480&h=280&fit=crop',
    alt: 'Custom Course Building',
  },
  {
    icon: '📊',
    title: 'Learning Analytics',
    desc: 'See who has completed what, identify skill gaps by team or role, and correlate training progress with maintenance quality metrics.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=280&fit=crop',
    alt: 'Learning Analytics',
  },
  {
    icon: '📱',
    title: 'Mobile-First Delivery',
    desc: 'Technicians access training from any device, including offline mode for field workers without reliable connectivity.',
    img: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=480&h=280&fit=crop',
    alt: 'Mobile Learning',
  },
  {
    icon: '🔗',
    title: 'Integrated with Work Orders',
    desc: 'Assign mandatory training before a technician can close a work order — ensuring compliance is baked into the workflow, not added after.',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=480&h=280&fit=crop',
    alt: 'Work Order Learning Integration',
  },
];

export default function LearnProduct() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />

      {/* Hero */}
      <div style={{ position: 'relative', width: '100%', height: '460px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1400&h=460&fit=crop"
          alt="Learn Hero"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,30,10,0.85) 0%, rgba(30,120,80,0.5) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(167,243,208,0.15)', border: '1px solid rgba(167,243,208,0.4)', color: '#6ee7b7', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase' }}>LMS · Training · Compliance</span>
          <h1 style={{ fontSize: '52px', fontWeight: '800', color: 'white', marginBottom: '16px', lineHeight: '1.15', maxWidth: '750px' }}>
            Upskill Your Team. Prove Your Compliance.
          </h1>
          <p style={{ fontSize: '20px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>
            Enable your frontline team to access job-relevant training, track certifications, and stay compliant — no spreadsheets.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(22,163,74,0.4)' }}>
              Start Free Trial
            </button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
              See Pricing
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: 'linear-gradient(135deg, #14532d, #166534)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '24px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>{s.value}</div>
              <div style={{ fontSize: '14px', color: '#86efac', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px' }}>
        <div style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
            Training that fits into the workflow, not apart from it
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '760px', lineHeight: '1.7', margin: '0 auto' }}>
            FixNest Learn is built for maintenance teams, not classrooms. Training is delivered in the field, on any device, connected directly to the work orders and assets your team works on every day.
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
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: '20px', padding: '48px', marginBottom: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>💬</div>
          <p style={{ fontSize: '20px', fontStyle: 'italic', color: '#166534', maxWidth: '700px', margin: '0 auto 24px', lineHeight: '1.7' }}>
            "We used to hire a trainer every quarter. Now the FixNest Learn library covers everything and our team completes modules during slow shifts."
          </p>
          <div style={{ fontWeight: '700', color: '#14532d' }}>Priya N. — Training & Development Lead</div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: '700', cursor: 'pointer', marginRight: '16px', boxShadow: '0 4px 15px rgba(22,163,74,0.3)' }}>
            Go to Dashboard
          </button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '16px 40px', backgroundColor: 'transparent', color: '#16a34a', border: '2px solid #16a34a', borderRadius: '10px', fontSize: '17px', fontWeight: '600', cursor: 'pointer' }}>
            View Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
