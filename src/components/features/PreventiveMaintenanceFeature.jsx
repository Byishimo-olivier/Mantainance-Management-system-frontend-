import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '45%', label: 'Downtime Reduction' },
  { value: '3x', label: 'Asset Lifespan' },
  { value: '60%', label: 'Fewer Emergency Repairs' },
  { value: '100%', label: 'Schedule Compliance (avg)' },
];

const features = [
  { icon: '📅', title: 'Flexible Schedules', desc: 'Create PMs by calendar date, usage hours, mileage, or sensor readings. FixNest automatically generates the next work order when a trigger is met.', img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=480&h=240&fit=crop' },
  { icon: '✅', title: 'Guided Checklists', desc: 'Attach step-by-step inspection checklists with photos, measurements, and pass/fail criteria so technicians follow the same procedure every time.', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=480&h=240&fit=crop' },
  { icon: '🤖', title: 'AI-Optimised Scheduling', desc: "FixNest Intelligence analyses your asset health data and suggests optimised PM intervals — scheduling before a failure is likely, not on a fixed calendar.", img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=480&h=240&fit=crop' },
  { icon: '📊', title: 'PM Compliance Tracking', desc: 'See your PM completion rate across every asset, technician, and site on a live dashboard. Never discover a missed PM during an audit again.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=240&fit=crop' },
  { icon: '📱', title: 'Mobile PM Execution', desc: "Technicians receive, complete, and close PM work orders from their phones — including offline mode for remote sites without reliable connectivity.", img: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=480&h=240&fit=crop' },
  { icon: '💰', title: 'Cost Benchmarking', desc: 'Track the actual cost of each PM and compare to industry benchmarks. Find the assets that are costing too much to maintain and justify replacements.', img: 'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=480&h=240&fit=crop' },
];

export default function PreventiveMaintenanceFeature() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '440px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1400&h=440&fit=crop" alt="Preventive Maintenance Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,30,10,0.87),rgba(20,110,60,0.52))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(167,243,208,0.2)', border: '1px solid rgba(167,243,208,0.4)', color: '#6ee7b7', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '18px', textTransform: 'uppercase' }}>Preventive Maintenance</span>
          <h1 style={{ fontSize: '50px', fontWeight: '900', color: 'white', marginBottom: '16px', lineHeight: '1.1', maxWidth: '720px' }}>Stop Fires Before They Start</h1>
          <p style={{ fontSize: '19px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>Shift from reactive firefighting to proactive maintenance. AI-powered scheduling, guided checklists, and 100% PM compliance — built in.</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/dashboard?tab=preventiveMaintenance')} style={{ padding: '13px 30px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>View PM Schedule</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '13px 30px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#14532d,#166534)', padding: '28px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
          {stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '13px', color: '#86efac', marginTop: '3px' }}>{s.label}</div></div>)}
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '14px' }}>From reactive to proactive in weeks — not months</h2>
          <p style={{ fontSize: '17px', color: '#6b7280', maxWidth: '720px', lineHeight: '1.7', margin: '0 auto' }}>FixNest Preventive Maintenance automates every part of your PM programme — from scheduling and assignment to guided execution and compliance reporting — so your team can focus on doing the work, not administering it.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '60px' }}>
          {features.map(f => (
            <div key={f.title} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <img src={f.img} alt={f.title} style={{ width: '100%', height: '185px', objectFit: 'cover' }} />
              <div style={{ padding: '22px' }}>
                <div style={{ fontSize: '26px', marginBottom: '8px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.7' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: '18px', padding: '44px', textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '19px', fontStyle: 'italic', color: '#166534', maxWidth: '680px', margin: '0 auto 20px', lineHeight: '1.7' }}>"We went from 40% PM completion to 97% in two months. Our emergency repair costs dropped by 58% in the first year. The ROI was undeniable."</p>
          <div style={{ fontWeight: '700', color: '#14532d' }}>Eric K. — VP of Maintenance, Industrial Holdings</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard?tab=preventiveMaintenance')} style={{ padding: '14px 36px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginRight: '14px' }}>View PM Schedule</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 36px', backgroundColor: 'transparent', color: '#16a34a', border: '2px solid #16a34a', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
