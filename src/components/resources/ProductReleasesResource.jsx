import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const releases = [
  { version: 'v3.8', date: 'March 2025', title: 'AI Triage & Smart Work Order Routing', type: 'Major', img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=480&h=200&fit=crop', highlights: ['AI automatically classifies and routes incoming work orders', 'Skill-based technician assignment', 'Priority prediction based on asset criticality'], },
  { version: 'v3.7', date: 'February 2025', title: 'Fleet Telematics Integration', type: 'Major', img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=480&h=200&fit=crop', highlights: ['Geotab and Samsara live GPS sync', 'Mileage-triggered PM automation', 'Digital DVIR on any mobile browser'], },
  { version: 'v3.6', date: 'January 2025', title: 'Studio App Marketplace Launch', type: 'Major', img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=480&h=200&fit=crop', highlights: ['30+ pre-built Studio apps available', 'One-click app installation', 'Custom app publishing for partners'], },
  { version: 'v3.5', date: 'December 2024', title: 'PesaPal & Mobile Money Payments', type: 'Feature', img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&h=200&fit=crop', highlights: ['PesaPal V3 subscription gateway', 'Mobile Money support (MTN, Airtel)', 'Multi-currency billing (USD & RWF)'], },
  { version: 'v3.4', date: 'November 2024', title: 'Advanced Analytics & OEE Dashboard', type: 'Feature', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=200&fit=crop', highlights: ['OEE calculated automatically from sensor data', 'Drill-down by site, team, and asset type', 'Scheduled PDF report delivery'], },
  { version: 'v3.3', date: 'October 2024', title: 'Safety Module — OSHA 300 Automation', type: 'Major', img: 'https://images.unsplash.com/photo-1530811761207-8d9d22f0a141?w=480&h=200&fit=crop', highlights: ['Auto-populated OSHA 300/300A/301 logs', 'AI-generated CAPA suggestions', 'Voice-to-text incident reporting'], },
];

const typeColors = { Major: '#7c3aed', Feature: '#2563EB', Fix: '#16a34a' };

export default function ProductReleasesResource() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&h=380&fit=crop" alt="Releases Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(10,5,40,0.87),rgba(60,20,120,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Product Releases</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>Every feature, improvement, and fix — detailed, transparent, and always up to date.</p>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '60px' }}>
          {releases.map((r) => (
            <div key={r.version} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <img src={r.img} alt={r.title} style={{ width: '100%', height: '165px', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '12px', left: '12px', background: typeColors[r.type] || '#374151', color: 'white', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>{r.type} Release</span>
                <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>{r.version}</span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>📅 {r.date}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{r.title}</h3>
                <ul style={{ margin: 0, paddingLeft: '18px', color: '#6b7280', fontSize: '13px', lineHeight: '1.9' }}>
                  {r.highlights.map(h => <li key={h}>{h}</li>)}
                </ul>
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
