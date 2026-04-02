import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const templates = [
  { title: 'HVAC Preventive Maintenance Checklist', items: ['Check air filters – replace if dirty', 'Inspect belts and pulleys', 'Check refrigerant levels', 'Test thermostat calibration', 'Clean condenser and evaporator coils'], icon: '❄️', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=200&fit=crop', category: 'Facilities' },
  { title: 'Vehicle Pre-Trip Inspection (DVIR)', items: ['Check tire pressure and tread depth', 'Test all lights (head, tail, brake)', 'Inspect fluid levels', 'Check mirrors and windshield', 'Test horn and wipers'], icon: '🚛', img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=480&h=200&fit=crop', category: 'Fleet' },
  { title: 'Electrical Panel Safety Inspection', items: ['Visual check for heat damage', 'Test circuit breakers', 'Verify proper labeling', 'Check grounding connections', 'Infrared scan (annual)'], icon: '⚡', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=480&h=200&fit=crop', category: 'Electrical' },
  { title: 'Pump & Motor Weekly Inspection', items: ['Listen for unusual vibration or noise', 'Check coupling alignment', 'Measure motor temperature', 'Inspect packing gland or seal', 'Log running hours'], icon: '⚙️', img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=480&h=200&fit=crop', category: 'Mechanical' },
  { title: 'Fire Safety Monthly Checklist', items: ['Test smoke detectors', 'Inspect fire extinguishers', 'Check emergency exits', 'Test emergency lighting', 'Review evacuation plan accessibility'], icon: '🔥', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=200&fit=crop', category: 'Safety' },
  { title: 'Boiler Annual Service Checklist', items: ['Clean combustion chamber', 'Test pressure relief valve', 'Inspect heat exchanger', 'Check water treatment levels', 'Calibrate controls and safeties'], icon: '🌡️', img: 'https://images.unsplash.com/photo-1504908576619-be6571358ce1?w=480&h=200&fit=crop', category: 'Mechanical' },
];

export default function ChecklistGeneratorResource() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1400&h=380&fit=crop" alt="Checklist Generator Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,30,20,0.87),rgba(16,100,70,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Maintenance Checklist Generator</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>Browse, download, or import pre-built checklists directly into your FixNest CMMS — no rebuilding from scratch.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '60px' }}>
          {templates.map((t, i) => (
            <div key={t.title} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <img src={t.img} alt={t.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
              <div style={{ padding: '20px' }}>
                <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '700' }}>{t.category}</span>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '10px 0 12px' }}>{t.icon} {t.title}</h3>
                {expanded === i && (
                  <ul style={{ margin: '0 0 12px', paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: '2' }}>
                    {t.items.map(item => <li key={item}>{item}</li>)}
                  </ul>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setExpanded(expanded === i ? null : i)} style={{ flex: 1, padding: '8px', background: '#f3f4f6', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>{expanded === i ? 'Hide' : 'Preview'}</button>
                  <button style={{ flex: 1, padding: '8px', background: '#eff6ff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#2563EB', cursor: 'pointer' }}>Import to CMMS</button>
                </div>
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
