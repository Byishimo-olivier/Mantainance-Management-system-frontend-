import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stories = [
  { company: 'East Africa Manufacturing Ltd', industry: 'Manufacturing', metric: '42% downtime reduction', quote: 'FixNest gave our maintenance team the visibility they needed to go from reactive to predictive in just 60 days.', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=480&h=260&fit=crop', person: 'Marcus T., Plant Manager' },
  { company: 'Kigali Commercial Properties', industry: 'Facilities Management', metric: '55% faster work order close', quote: 'We manage 12 buildings. FixNest reduced tenant complaints by half and our team loves the mobile app.', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=480&h=260&fit=crop', person: 'Grace N., FM Director' },
  { company: 'TransAfrica Logistics', industry: 'Fleet & Transport', metric: '35% fuel savings', quote: 'Our vehicle PM compliance went from 60% to 98%. Fleet maintenance has never been this smooth.', img: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=480&h=260&fit=crop', person: 'Samuel K., Fleet Manager' },
  { company: 'Nairobi Hospital Group', industry: 'Healthcare Facilities', metric: '100% equipment compliance', quote: 'Medical equipment compliance is non-negotiable. FixNest ensures every PM is done on time, every time.', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=480&h=260&fit=crop', person: 'Dr. Amara J., Facility Director' },
  { company: 'Accra Food Processing', industry: 'Food & Beverage', metric: '0 regulatory violations', quote: 'FixNest Safety helped us eliminate OSHA violations for the first time in our company history.', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=260&fit=crop', person: 'Kwame A., EHS Manager' },
  { company: 'Great Lakes Hydro', industry: 'Energy & Utilities', metric: '28% MTTR improvement', quote: 'Predictive maintenance insights from FixNest Intelligence have transformed how we respond to equipment issues.', img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=480&h=260&fit=crop', person: 'Ingrid M., Operations Lead' },
];

export default function CustomerStoriesResource() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1400&h=380&fit=crop" alt="Customer Stories Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,20,50,0.88),rgba(10,60,120,0.52))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Customer Stories</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6' }}>Real transformations from companies across Africa and beyond that chose FixNest to modernize their operations.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', marginBottom: '60px' }}>
          {stories.map((s) => (
            <div key={s.company} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <img src={s.img} alt={s.company} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '24px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase' }}>{s.industry}</span>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '8px 0 4px' }}>{s.company}</h3>
                <div style={{ display: 'inline-block', background: '#dbeafe', color: '#1e40af', borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>{s.metric}</div>
                <p style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic', lineHeight: '1.6', marginBottom: '12px' }}>"{s.quote}"</p>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>— {s.person}</div>
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
