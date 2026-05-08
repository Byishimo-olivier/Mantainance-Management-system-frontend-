import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '35%', label: 'Fuel Cost Savings' },
  { value: '50%', label: 'Faster Inspections' },
  { value: '99%', label: 'VIN Lookup Accuracy' },
  { value: '2x', label: 'Vehicle Lifespan' },
];

const features = [
  {
    icon: '🚛',
    title: 'Vehicle Maintenance Tracking',
    desc: 'Every service event, repair, and inspection is logged automatically. View complete vehicle history in one click and make smarter decisions about your fleet.',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=280&fit=crop',
    alt: 'Fleet Vehicle Tracking',
  },
  {
    icon: '📋',
    title: 'Digital Inspections',
    desc: 'Replace paper DVIRs with digital checklists built in minutes. Drivers submit from any phone, photos attach automatically, and defects become work orders instantly.',
    img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=480&h=280&fit=crop',
    alt: 'Digital Vehicle Inspections',
  },
  {
    icon: '⚙️',
    title: 'Automated PM Scheduling',
    desc: 'Set mileage, hours, or calendar-based triggers and let Fleet handle the rest. PMs are created before due dates so your vehicles stay road-ready.',
    img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=480&h=280&fit=crop',
    alt: 'Preventive Maintenance Schedule',
  },
  {
    icon: '💰',
    title: 'Cost & Fuel Analytics',
    desc: 'See your true cost-per-mile, compare fuel efficiency across vehicles, and pinpoint which assets are costing you the most so you can act.',
    img: 'https://images.unsplash.com/photo-1561414927-6d86591d0c4f?w=480&h=280&fit=crop',
    alt: 'Fleet Cost Analytics',
  },
];

export default function FleetProduct() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />

      <div style={{ position: 'relative', width: '100%', height: '460px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=1400&h=460&fit=crop"
          alt="Fleet Hero"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,20,50,0.85) 0%, rgba(15,80,150,0.5) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(167,243,208,0.15)', border: '1px solid rgba(167,243,208,0.4)', color: '#6ee7b7', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase' }}>Vehicle · Fleet Management</span>
          <h1 style={{ fontSize: '52px', fontWeight: '800', color: 'white', marginBottom: '16px', lineHeight: '1.15', maxWidth: '750px' }}>
            Keep Every Vehicle Running, Efficiently
          </h1>
          <p style={{ fontSize: '20px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>
            Connect telematics to work orders, automate PM scheduling, and manage your entire fleet from one dashboard.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(5,150,105,0.4)' }}>
              Start Free Trial
            </button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
              See Pricing
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #064e3b, #065f46)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '24px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>{s.value}</div>
              <div style={{ fontSize: '14px', color: '#6ee7b7', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px' }}>
        <div style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
            From the garage to the open road all in one system
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '760px', lineHeight: '1.7', margin: '0 auto' }}>
            Fleet connects telematics data, digital inspections, VIN lookups, and preventive maintenance into a single workflow, eliminating spreadsheets, paperwork, and missed service windows.
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

        <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', borderRadius: '20px', padding: '48px', marginBottom: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>💬</div>
          <p style={{ fontSize: '20px', fontStyle: 'italic', color: '#065f46', maxWidth: '700px', margin: '0 auto 24px', lineHeight: '1.7' }}>
            "We manage 120 vehicles across 5 depots. Fleet keeps every vehicle serviced on time and has cut our unplanned breakdowns by half."
          </p>
          <div style={{ fontWeight: '700', color: '#064e3b' }}>Sarah M. · Fleet Operations Manager</div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: '700', cursor: 'pointer', marginRight: '16px', boxShadow: '0 4px 15px rgba(5,150,105,0.3)' }}>
            Go to Dashboard
          </button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '16px 40px', backgroundColor: 'transparent', color: '#059669', border: '2px solid #059669', borderRadius: '10px', fontSize: '17px', fontWeight: '600', cursor: 'pointer' }}>
            View Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
