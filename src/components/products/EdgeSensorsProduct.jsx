import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '99.9%', label: 'Uptime' },
  { value: '<2s', label: 'Alert Latency' },
  { value: '10,000+', label: 'Sensors Deployed' },
  { value: '40%', label: 'Downtime Reduction' },
];

const features = [
  {
    icon: '🛰️',
    title: 'Real-Time Monitoring',
    desc: 'Monitor equipment status, temperature, vibration, pressure, and more 24/7. Get a live view of every asset in your facility on a single screen.',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=280&fit=crop',
    alt: 'Real-Time IoT Monitoring Dashboard',
  },
  {
    icon: '⚡',
    title: 'Energy Efficiency',
    desc: 'Track energy consumption in real-time and automatically flag anomalies. Identify savings opportunities worth thousands per year without manual audits.',
    img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=480&h=280&fit=crop',
    alt: 'Energy Efficiency Tracking',
  },
  {
    icon: '🔔',
    title: 'Smart Alerts',
    desc: 'AI-driven threshold alerts warn your team before a sensor reading points to imminent failure — no more reacting to breakdowns after the fact.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=280&fit=crop',
    alt: 'Smart Alerts and Notifications',
  },
  {
    icon: '🔌',
    title: 'Easy Integration',
    desc: 'Wireless installation in hours — not weeks. Our sensors pair with BLE, LoRaWAN, and Wi-Fi networks and connect to your existing CMMS automatically.',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=480&h=280&fit=crop',
    alt: 'Easy IoT Integration',
  },
  {
    icon: '📈',
    title: 'Data Analytics',
    desc: 'Analyze sensor history to detect usage trends, compare performance across sites, and build predictive maintenance schedules grounded in real data.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=280&fit=crop',
    alt: 'IoT Data Analytics',
  },
  {
    icon: '🔒',
    title: 'Secure Connectivity',
    desc: 'End-to-end AES-256 encryption, over-the-air firmware updates, and SOC 2 Type II compliance keep your sensor data safe and your operations protected.',
    img: 'https://images.unsplash.com/photo-1563986768609-7f64142e38de?w=480&h=280&fit=crop',
    alt: 'Secure Data Connectivity',
  },
];

export default function EdgeSensorsProduct() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />

      {/* Hero */}
      <div style={{ position: 'relative', width: '100%', height: '460px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1581092334651-ddf19d571075?w=1400&h=460&fit=crop"
          alt="Edge Sensors Hero"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(5,8,30,0.8) 0%, rgba(0,100,200,0.5) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(99,179,237,0.2)', border: '1px solid rgba(99,179,237,0.5)', color: '#90cdf4', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase' }}>IoT · Edge Computing</span>
          <h1 style={{ fontSize: '52px', fontWeight: '800', color: 'white', marginBottom: '16px', lineHeight: '1.15', maxWidth: '700px' }}>
            Know More. React Faster. Waste Less.
          </h1>
          <p style={{ fontSize: '20px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>
            Wireless IoT sensors that monitor your assets 24/7 and automatically create work orders when conditions change.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #2563EB, #1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}>
              Start Free Trial
            </button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
              See Pricing
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563EB)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '24px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>{s.value}</div>
              <div style={{ fontSize: '14px', color: '#93c5fd', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px' }}>
        {/* Intro */}
        <div style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
            Install in hours. Insights in minutes.
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '760px', lineHeight: '1.7', margin: '0 auto' }}>
            Edge Sensors connects wireless hardware to your FixNest platform without coding or data science staff. Every alert automatically generates a work order so your team acts before breakdowns happen.
          </p>
        </div>

        {/* Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '80px' }}>
          {features.map((f) => (
            <div key={f.title} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', transition: 'transform 0.2s' }}>
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
        <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '20px', padding: '48px', marginBottom: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>💬</div>
          <p style={{ fontSize: '20px', fontStyle: 'italic', color: '#1e40af', maxWidth: '700px', margin: '0 auto 24px', lineHeight: '1.7' }}>
            "After deploying Edge Sensors across our 3 facilities, we cut unplanned downtime by 42% in the first quarter alone."
          </p>
          <div style={{ fontWeight: '700', color: '#1e3a8a' }}>Marcus T. — Plant Manager, East Africa Manufacturing Ltd.</div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #2563EB, #1d4ed8)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: '700', cursor: 'pointer', marginRight: '16px', boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}>
            Go to Dashboard
          </button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '16px 40px', backgroundColor: 'transparent', color: '#2563EB', border: '2px solid #2563EB', borderRadius: '10px', fontSize: '17px', fontWeight: '600', cursor: 'pointer' }}>
            View Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
