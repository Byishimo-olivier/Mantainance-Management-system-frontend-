import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const categories = ['Vibration', 'Temperature', 'Pressure', 'Electrical', 'Mechanical', 'Hydraulic'];

const items = [
  { title: 'Unusual Vibration in Motor Bearing', symptom: 'High frequency vibration at startup', root_cause: 'Bearing wear / misalignment', action: 'Schedule bearing inspection and alignment check', icon: '⚙️', img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=480&h=220&fit=crop', category: 'Vibration' },
  { title: 'Overheating Hydraulic System', symptom: 'Fluid temperature > 80°C during operation', root_cause: 'Contaminated fluid or clogged filter', action: 'Replace hydraulic fluid and inspect filter', icon: '🌡️', img: 'https://images.unsplash.com/photo-1504908576619-be6571358ce1?w=480&h=220&fit=crop', category: 'Hydraulic' },
  { title: 'Intermittent Electrical Fault', symptom: 'Random tripped circuit breakers', root_cause: 'Loose wiring or faulty breaker', action: 'Infrared scan and continuity test all connections', icon: '⚡', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=480&h=220&fit=crop', category: 'Electrical' },
  { title: 'Pressure Drop in Compressed Air', symptom: 'Drop > 10 PSI from compressor to end-use', root_cause: 'Leaks in distribution piping', action: 'Ultrasonic leak detection audit', icon: '💨', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=220&fit=crop', category: 'Pressure' },
  { title: 'Chiller Not Reaching Setpoint', symptom: 'Cooling coil leaving air 5°F above target', root_cause: 'Low refrigerant or dirty condenser coils', action: 'Refrigerant charge check and condenser cleaning', icon: '❄️', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=220&fit=crop', category: 'Temperature' },
  { title: 'Conveyor Belt Slipping', symptom: 'Belt tension loss, uneven load movement', root_cause: 'Worn drive roller or loose tensioner', action: 'Inspect drive roller and adjust tensioner', icon: '🏭', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=480&h=220&fit=crop', category: 'Mechanical' },
];

export default function AIAssessmentsResource() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('All');
  const filtered = selected === 'All' ? items : items.filter(i => i.category === selected);
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1400&h=380&fit=crop" alt="AI Assessments Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(15,5,50,0.88),rgba(80,30,180,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>AI Maintenance Assessments</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>Describe a symptom. Get a diagnosis, root cause, and recommended action — instantly, powered by AI.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '36px' }}>
          {['All', ...categories].map(c => (
            <button key={c} onClick={() => setSelected(c)} style={{ padding: '8px 18px', borderRadius: '20px', border: selected === c ? '2px solid #7c3aed' : '1px solid #e5e7eb', background: selected === c ? '#f5f3ff' : 'white', color: selected === c ? '#7c3aed' : '#374151', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '60px' }}>
          {filtered.map((item) => (
            <div key={item.title} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <img src={item.img} alt={item.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '20px' }}>
                <span style={{ background: '#f5f3ff', color: '#7c3aed', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '700' }}>{item.category}</span>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '10px 0 6px' }}>{item.icon} {item.title}</h3>
                <div style={{ marginBottom: '6px' }}><span style={{ fontWeight: '600', fontSize: '13px', color: '#374151' }}>Symptom: </span><span style={{ fontSize: '13px', color: '#6b7280' }}>{item.symptom}</span></div>
                <div style={{ marginBottom: '6px' }}><span style={{ fontWeight: '600', fontSize: '13px', color: '#374151' }}>Root Cause: </span><span style={{ fontSize: '13px', color: '#6b7280' }}>{item.root_cause}</span></div>
                <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '8px 12px', marginTop: '10px' }}><span style={{ fontWeight: '600', fontSize: '13px', color: '#1e40af' }}>✅ Action: </span><span style={{ fontSize: '13px', color: '#1e40af' }}>{item.action}</span></div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginRight: '12px' }}>Try AI Assessments</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', backgroundColor: 'transparent', color: '#7c3aed', border: '2px solid #7c3aed', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
