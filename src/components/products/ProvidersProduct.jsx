import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '30%', label: 'Vendor Cost Savings' },
  { value: '48hr', label: 'Avg Contractor Onboard' },
  { value: '99%', label: 'Contract Visibility' },
  { value: '5x', label: 'Faster PO Processing' },
];

const features = [
  {
    icon: '🤝',
    title: 'Vendor Directory',
    desc: 'Maintain a centralised directory of approved vendors and contractors with contact details, specialties, insurance, and certifications all in one place.',
    img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=480&h=280&fit=crop',
    alt: 'Vendor Directory Management',
  },
  {
    icon: '🔗',
    title: 'Work Order Assignment',
    desc: 'Dispatch work orders directly to external contractors from your CMMS. Providers receive, update, and close tasks in a dedicated portal so there is no phone tag.',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=480&h=280&fit=crop',
    alt: 'Work Order Contractor Assignment',
  },
  {
    icon: '🧾',
    title: 'Purchase Order Integration',
    desc: 'Convert approved service requests into POs in one click. Route POs through your approval chain and track spending against budget in real time.',
    img: 'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=480&h=280&fit=crop',
    alt: 'Purchase Order Integration',
  },
];

export default function ProvidersProduct() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />

      <div style={{ position: 'relative', width: '100%', height: '460px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1400&h=460&fit=crop"
          alt="Providers Hero"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(20,10,5,0.87) 0%, rgba(150,70,10,0.5) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(253,186,116,0.15)', border: '1px solid rgba(253,186,116,0.4)', color: '#fbbf24', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase' }}>Vendors · Contractors · Procurement</span>
          <h1 style={{ fontSize: '52px', fontWeight: '800', color: 'white', marginBottom: '16px', lineHeight: '1.15', maxWidth: '750px' }}>
            Manage Every Partner. Control Every Contract.
          </h1>
          <p style={{ fontSize: '20px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>
            Vendor and contractor management integrated with your maintenance workflow from onboarding to PO processing.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #d97706, #b45309)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(217,119,6,0.4)' }}>
              Start Free Trial
            </button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
              See Pricing
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #78350f, #92400e)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '24px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>{s.value}</div>
              <div style={{ fontSize: '14px', color: '#fcd34d', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px' }}>
        <div style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
            Your external workforce, fully in view
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '760px', lineHeight: '1.7', margin: '0 auto' }}>
            Providers eliminates the friction of managing contractors. From onboarding to invoicing, every external interaction is tracked, measured, and visible so you spend less time chasing and more time building.
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

        <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', borderRadius: '20px', padding: '48px', marginBottom: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>💬</div>
          <p style={{ fontSize: '20px', fontStyle: 'italic', color: '#92400e', maxWidth: '700px', margin: '0 auto 24px', lineHeight: '1.7' }}>
            "We cut vendor onboarding from weeks to 48 hours and now have full visibility into every contract and SLA. Providers paid for itself in month one."
          </p>
          <div style={{ fontWeight: '700', color: '#78350f' }}>Fatima O. · Procurement Manager</div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #d97706, #b45309)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: '700', cursor: 'pointer', marginRight: '16px', boxShadow: '0 4px 15px rgba(217,119,6,0.3)' }}>
            Go to Dashboard
          </button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '16px 40px', backgroundColor: 'transparent', color: '#d97706', border: '2px solid #d97706', borderRadius: '10px', fontSize: '17px', fontWeight: '600', cursor: 'pointer' }}>
            View Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
