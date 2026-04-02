import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../../auth/AuthHeader';

const pages = {
  Restaurants: {
    title: 'Restaurants', accent: '#d97706', accentDark: '#b45309', statColor: '#fcd34d',
    hero: 'Keep Your Kitchen Running. Always.',
    sub: 'Equipment PMs, health inspection checklists, and instant repair requests — so a broken fryer never costs you a service.',
    heroImg: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&h=400&fit=crop',
    stats: [{ value: '0', label: 'Health Violations' }, { value: '40%', label: 'Equipment Downtime Down' }, { value: '90%', label: 'PM Compliance' }, { value: '50%', label: 'Faster Repairs' }],
    features: [
      { icon: '🍳', title: 'Kitchen Equipment PMs', desc: 'Schedule PMs for fryers, hood vents, refrigerators, and dishwashers so every piece is serviced before it fails during service.', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=160&fit=crop' },
      { icon: '📋', title: 'Health Inspection Checklists', desc: 'Digital health department pre-inspection checklists with photo capture — never fail an inspection due to a missed item.', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=480&h=160&fit=crop' },
      { icon: '📱', title: 'Staff Repair Requests', desc: 'Kitchen staff report equipment issues from any device in seconds — automatically dispatched to a technician or vendor.', img: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=480&h=160&fit=crop' },
      { icon: '🌡️', title: 'Cold Chain Monitoring', desc: 'Sensor alerts for refrigerators and walk-in coolers when temperatures drift — protecting food safety and your reputation.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=160&fit=crop' },
      { icon: '💰', title: 'Repair vs Replace', desc: 'See the full maintenance cost history per equipment piece to justify replacement before it becomes an emergency.', img: 'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=480&h=160&fit=crop' },
      { icon: '🏢', title: 'Multi-Location Management', desc: 'Manage maintenance across all restaurant locations from one dashboard — compare performance and share best practices.', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=480&h=160&fit=crop' },
    ],
  },
};

export default function RestaurantsSolution() {
  const navigate = useNavigate();
  const d = pages.Restaurants;
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
        <img src={d.heroImg} alt={d.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(20,10,5,0.87),rgba(160,60,10,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(253,230,138,0.2)', border: '1px solid rgba(253,230,138,0.4)', color: '#fde68a', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{d.title}</span>
          <h1 style={{ fontSize: '44px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>{d.hero}</h1>
          <p style={{ fontSize: '17px', color: '#e2e8f0', maxWidth: '560px', lineHeight: '1.6' }}>{d.sub}</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', background: `linear-gradient(135deg,${d.accent},${d.accentDark})`, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Go to Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: `linear-gradient(135deg,${d.accentDark},${d.accent})`, padding: '24px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '14px' }}>
          {d.stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '12px', color: d.statColor }}>{s.label}</div></div>)}
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {d.features.map(f => (<div key={f.title} style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 4px 18px rgba(0,0,0,0.07)', overflow: 'hidden' }}><img src={f.img} alt={f.title} style={{ width: '100%', height: '145px', objectFit: 'cover' }} /><div style={{ padding: '18px' }}><div style={{ fontSize: '22px', marginBottom: '6px' }}>{f.icon}</div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{f.title}</h3><p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.7' }}>{f.desc}</p></div></div>))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 30px', background: `linear-gradient(135deg,${d.accent},${d.accentDark})`, color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '13px 30px', backgroundColor: 'transparent', color: d.accent, border: `2px solid ${d.accent}`, borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
