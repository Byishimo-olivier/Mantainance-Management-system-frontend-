import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const reviews = [
  { name: 'James M.', role: 'Maintenance Manager', company: 'East Africa Breweries', rating: 5, review: 'FixNest transformed how our team operates. Before, we were drowning in paper work orders. Now everything is digital and nothing falls through the cracks.', site: 'G2', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&q=80' },
  { name: 'Priya N.', role: 'Facilities Director', company: 'Nairobi Heights Properties', rating: 5, review: 'Incredible platform. The preventive maintenance scheduling alone paid for itself in the first quarter. Our tenant satisfaction scores hit an all-time high.', site: 'Capterra', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&q=80' },
  { name: 'Samuel K.', role: 'Fleet Manager', company: 'TransAfrica Logistics', rating: 5, review: 'The Fleet module connected our GPS trackers to our maintenance schedule. We have not had an unexpected breakdown in 4 months. Remarkable.', site: 'G2', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&q=80' },
  { name: 'Amara J.', role: 'Plant Director', company: 'Rwanda Manufacturing Corp', rating: 5, review: 'The AI triage feature sorts hundreds of incoming requests without us lifting a finger. Our team focuses on actual maintenance, not admin work.', site: 'Capterra', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&q=80' },
  { name: 'Daniel R.', role: 'EHS Manager', company: 'Accra Mining Solutions', rating: 5, review: 'FixNest Safety helped us get to zero OSHA violations for the first time in company history. The AI CAPA suggestions are genuinely useful, not generic.', site: 'G2', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&q=80' },
  { name: 'Fatima O.', role: 'Operations Lead', company: 'Mombasa Port Authority', rating: 4, review: 'Onboarding took a bit of time with a 200-asset operation, but once set up, the dashboards and reporting are outstanding. Well worth it.', site: 'Capterra', img: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=80&h=80&fit=crop&q=80' },
];

const stars = (n) => '⭐'.repeat(n);
const siteColors = { G2: '#ff492c', Capterra: '#ff9d28' };

export default function ReviewsResource() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&h=380&fit=crop" alt="Reviews Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,20,50,0.87),rgba(20,80,160,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>Customer Reviews</h1>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 20px' }}><div style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>4.8/5</div><div style={{ fontSize: '12px', color: '#93c5fd' }}>G2 Rating</div></div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 20px' }}><div style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>4.7/5</div><div style={{ fontSize: '12px', color: '#93c5fd' }}>Capterra Rating</div></div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 20px' }}><div style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>1,200+</div><div style={{ fontSize: '12px', color: '#93c5fd' }}>Total Reviews</div></div>
          </div>
          <p style={{ fontSize: '16px', color: '#e2e8f0', maxWidth: '500px', lineHeight: '1.5' }}>Don't take our word for it — here's what real maintenance teams say.</p>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '60px' }}>
          {reviews.map((r) => (
            <div key={r.name} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={r.img} alt={r.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>{r.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{r.role}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{r.company}</div>
                  </div>
                </div>
                <span style={{ background: siteColors[r.site], color: 'white', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '700' }}>{r.site}</span>
              </div>
              <div style={{ fontSize: '16px', marginBottom: '10px' }}>{stars(r.rating)}</div>
              <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.7', fontStyle: 'italic' }}>"{r.review}"</p>
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
