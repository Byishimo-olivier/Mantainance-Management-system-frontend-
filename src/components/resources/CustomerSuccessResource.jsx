import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const services = [
  { icon: '🚀', title: 'Dedicated Onboarding', desc: 'A dedicated success manager walks your team through implementation, data migration, and user training over your first 60 days.', img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=480&h=220&fit=crop' },
  { icon: '📞', title: '24/7 Priority Support', desc: 'Reach our maintenance experts via live chat, email, or phone any time. Enterprise plans get a dedicated Slack channel.', img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=480&h=220&fit=crop' },
  { icon: '📊', title: 'Quarterly Business Reviews', desc: 'Regular reviews with your success manager to assess adoption, optimize configurations, and plan next phases.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=220&fit=crop' },
  { icon: '🎓', title: 'Custom Training Programs', desc: 'Live virtual or on-site training tailored to your team\'s roles — from technicians to executives.', img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=480&h=220&fit=crop' },
  { icon: '⚙️', title: 'Configuration Services', desc: 'Our team helps you configure workflows, custom fields, permissions, and integrations so FixNest works exactly for your operation.', img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=480&h=220&fit=crop' },
  { icon: '📈', title: 'Adoption Analytics', desc: 'Real-time dashboards showing which features your team uses, who needs more training, and where you have the biggest impact opportunities.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=220&fit=crop' },
];

export default function CustomerSuccessResource() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&h=380&fit=crop" alt="Customer Success Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,25,50,0.87),rgba(20,80,160,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Customer Success</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>We don't just hand you software. We partner with you to ensure your team succeeds from day one to year five.</p>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '60px' }}>
          {services.map((s) => (
            <div key={s.title} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <img src={s.img} alt={s.title} style={{ width: '100%', height: '170px', objectFit: 'cover' }} />
              <div style={{ padding: '22px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.7' }}>{s.desc}</p>
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
