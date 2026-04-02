import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../../auth/AuthHeader';

const stats = [{ value: '100%', label: 'Safety Compliance' }, { value: '50%', label: 'Admin Time Saved' }, { value: '40%', label: 'Maintenance Costs Down' }, { value: '0', label: 'Missed Inspections' }];
const features = [
  { icon: '🏫', title: 'Multi-Campus Oversight', desc: 'Manage maintenance across all school buildings, sports facilities, and portables from one platform — with site-level reporting.', img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=480&h=160&fit=crop' },
  { icon: '📋', title: 'Fire & Safety Compliance', desc: 'Automate fire extinguisher, sprinkler, and emergency lighting inspection schedules to stay fully compliant year-round.', img: 'https://images.unsplash.com/photo-1530811761207-8d9d22f0a141?w=480&h=160&fit=crop' },
  { icon: '📚', title: 'Classroom Equipment Tracking', desc: 'Track projectors, lab equipment, and technology assets across all classrooms with full maintenance and warranty history.', img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=480&h=160&fit=crop' },
  { icon: '🌡️', title: 'HVAC & Air Quality', desc: 'Schedule HVAC filter changes and air quality checks to maintain a healthy learning environment for students and staff.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=160&fit=crop' },
  { icon: '👷', title: 'Custodian Work Orders', desc: 'Custodial staff receive and complete work orders on mobile — tracking time, materials, and completion status automatically.', img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=480&h=160&fit=crop' },
  { icon: '📊', title: 'District Reporting', desc: 'Roll up maintenance costs and compliance metrics across all schools in the district for leadership and board reporting.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=160&fit=crop' },
];

export default function SchoolsEducationSolution() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&h=400&fit=crop" alt="Schools Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,20,50,0.87),rgba(20,80,160,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(147,197,253,0.2)', border: '1px solid rgba(147,197,253,0.4)', color: '#93c5fd', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Schools & Education</span>
          <h1 style={{ fontSize: '44px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>Safe Schools. Supported Learning.</h1>
          <p style={{ fontSize: '17px', color: '#e2e8f0', maxWidth: '560px', lineHeight: '1.6' }}>Keep every campus safe, every classroom operational, and every inspection passing — without the admin burden.</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Go to Dashboard</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#1d4ed8)', padding: '24px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '14px' }}>
          {stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '12px', color: '#93c5fd' }}>{s.label}</div></div>)}
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {features.map(f => (<div key={f.title} style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 4px 18px rgba(0,0,0,0.07)', overflow: 'hidden' }}><img src={f.img} alt={f.title} style={{ width: '100%', height: '145px', objectFit: 'cover' }} /><div style={{ padding: '18px' }}><div style={{ fontSize: '22px', marginBottom: '6px' }}>{f.icon}</div><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{f.title}</h3><p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.7' }}>{f.desc}</p></div></div>))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 30px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '13px 30px', backgroundColor: 'transparent', color: '#2563EB', border: '2px solid #2563EB', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
