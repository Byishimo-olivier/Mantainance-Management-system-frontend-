import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const plans = [
  { name: 'Essential', price: 'Free to Try', color: '#6b7280', features: ['Unlimited Work order', 'Request', 'AI'], img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=480&h=200&fit=crop', cta: 'Start Free' },
  { name: 'Premium', price: 'From $45/mo', color: '#2563EB', features: ['Unlimited work Order', 'Requests', 'Asset', 'Location', 'PM', 'Over AI', 'Analytics', 'Material Request', 'Purchase Order'], img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=200&fit=crop', cta: 'Try Free', popular: false },
  { name: 'Professional', price: 'From $75/mo', color: '#7c3aed', features: ['Unlimited work Order', 'Requests', 'Asset', 'Location', 'PM', 'Over AI'], img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=200&fit=crop', cta: 'Schedule Demo', popular: true },
  { name: 'Enterprise', price: 'Custom Pricing', color: '#111827', features: ['Unlimited work Order', 'Requests', 'Asset', 'Location', 'PM', 'Over AI', 'Analytics', 'Material Request'], img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=480&h=200&fit=crop', cta: 'Contact Sales' },
];

export default function IntuitivePricingResource() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=1400&h=380&fit=crop" alt="Pricing Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,20,50,0.87),rgba(20,80,160,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Simple, Transparent Pricing</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>No hidden fees. No per-feature add-ons. Just the plan that fits your team — and you can change anytime.</p>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '60px' }}>
          {plans.map((p) => (
            <div key={p.name} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: p.popular ? `0 8px 30px rgba(124,58,237,0.2)` : '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', border: p.popular ? '2px solid #7c3aed' : '1px solid #e5e7eb', position: 'relative' }}>
              {p.popular && <div style={{ background: '#7c3aed', color: 'white', textAlign: 'center', padding: '6px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px' }}>MOST POPULAR</div>}
              <img src={p.img} alt={p.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: p.color, marginBottom: '4px' }}>{p.name}</h3>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>{p.price}</div>
                <ul style={{ margin: '0 0 20px', paddingLeft: '16px', color: '#6b7280', fontSize: '13px', lineHeight: '2' }}>
                  {p.features.map(f => <li key={f} style={{ color: '#374151' }}>{f}</li>)}
                </ul>
                <button onClick={() => navigate('/pricing')} style={{ width: '100%', padding: '10px', background: p.popular ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#eff6ff', color: p.popular ? 'white' : '#2563EB', border: p.popular ? 'none' : '1px solid #bfdbfe', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>{p.cta}</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', backgroundColor: 'transparent', color: '#2563EB', border: '2px solid #2563EB', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>Full Pricing Page</button>
        </div>
      </div>
    </div>
  );
}
