import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const sections = [
  {
    label: '🧮 Tools & Calculators',
    items: [
      { name: 'Maintenance Cost Calculator', desc: 'Estimate your annual downtime costs and see projected savings', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&h=160&fit=crop', path: '/resource/maintenance-calculator' },
      { name: 'ROI Calculator', desc: 'Calculate your personalized return on investment with FixNest', img: 'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=300&h=160&fit=crop', path: '/resource/roi-calculator' },
      { name: 'Asset QR Generator', desc: 'Generate and print QR codes for every asset in your facility', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=160&fit=crop', path: '/resource/qr-generator' },
    ],
  },
  {
    label: '📚 Learning & Training',
    items: [
      { name: 'Learning Center', desc: '500+ guides, videos, and documentation for every feature', img: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=300&h=160&fit=crop', path: '/resource/learning-center' },
      { name: 'Courses Library', desc: 'Expert-led courses from beginner to advanced maintenance', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=160&fit=crop', path: '/resource/courses' },
      { name: 'Checklist Generator', desc: 'Download or import pre-built maintenance checklists', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=160&fit=crop', path: '/resource/checklist-generator' },
    ],
  },
  {
    label: '💡 Content & Insights',
    items: [
      { name: 'Blog', desc: 'Maintenance insights, best practices, and industry trends', img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&h=160&fit=crop', path: '/resource/blog' },
      { name: 'Customer Stories', desc: 'Real transformations from companies using FixNest', img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=300&h=160&fit=crop', path: '/resource/customer-stories' },
      { name: 'Webinars & Events', desc: 'Live sessions, conferences, and virtual events', img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300&h=160&fit=crop', path: '/resource/webinars-events' },
    ],
  },
  {
    label: '🤝 Support & Community',
    items: [
      { name: 'Support Center', desc: 'Live chat, email, and phone support for all plans', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=160&fit=crop', path: '/resource/support-center' },
      { name: 'Customer Success', desc: 'Dedicated success managers, onboarding, and QBRs', img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=160&fit=crop', path: '/resource/customer-success' },
      { name: 'Partnerships', desc: 'Technology integrations and partner programme', img: 'https://images.unsplash.com/photo-1531546680769-a1d79b57de5c?w=300&h=160&fit=crop', path: '/resource/partnerships' },
    ],
  },
];

export default function ResourcesHub() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=400&fit=crop" alt="Resources Hub Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,10,40,0.90),rgba(30,60,150,0.52))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(147,197,253,0.2)', border: '1px solid rgba(147,197,253,0.4)', color: '#93c5fd', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '16px', textTransform: 'uppercase' }}>FixNest Resources</span>
          <h1 style={{ fontSize: '52px', fontWeight: '900', color: 'white', marginBottom: '16px', lineHeight: '1.1' }}>Everything You Need to Succeed</h1>
          <p style={{ fontSize: '20px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>Tools, learning, content, and community — organized so you can find exactly what you need, fast.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px' }}>
        {sections.map((section) => (
          <div key={section.label} style={{ marginBottom: '64px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '28px' }}>{section.label}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {section.items.map((item) => (
                <div key={item.name} onClick={() => navigate(item.path)} style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s', }}>
                  <img src={item.img} alt={item.name} style={{ width: '100%', height: '145px', objectFit: 'cover' }} />
                  <div style={{ padding: '18px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{item.name}</h3>
                    <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.6', marginBottom: '12px' }}>{item.desc}</p>
                    <span style={{ color: '#2563EB', fontSize: '13px', fontWeight: '700' }}>Explore →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 36px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginRight: '16px', boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 36px', backgroundColor: 'transparent', color: '#2563EB', border: '2px solid #2563EB', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
