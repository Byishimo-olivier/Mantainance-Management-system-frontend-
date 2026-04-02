import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

export default function QRGeneratorResource() {
  const navigate = useNavigate();
  const [assetName, setAssetName] = useState('Pump Unit A-12');
  const [assetId, setAssetId] = useState('AST-2025-001');
  const [location, setLocation] = useState('Plant 1 - Floor B');

  const qrValue = `Asset: ${assetName} | ID: ${assetId} | Location: ${location}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrValue)}`;

  const useCases = [
    { icon: '🔍', title: 'Instant Asset Lookup', desc: 'Scan the QR on any asset with a phone camera. FixNest opens the asset profile, history, and open work orders — no app download.', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=480&h=180&fit=crop' },
    { icon: '📋', title: 'Work Order Creation', desc: 'Scanning an asset QR from the field creates a pre-filled work order linked to that asset in one tap.', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=480&h=180&fit=crop' },
    { icon: '🛡️', title: 'Safety Event Reporting', desc: 'Place QR codes near hazardous areas so workers and visitors can report safety events instantly without an account.', img: 'https://images.unsplash.com/photo-1530811761207-8d9d22f0a141?w=480&h=180&fit=crop' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '340px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1400&h=340&fit=crop" alt="QR Generator Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,15,40,0.87),rgba(20,70,160,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>Asset QR Code Generator</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '560px', lineHeight: '1.6' }}>Generate scannable QR codes for every asset in seconds. Stick, scan, done.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '40px', marginBottom: '60px', alignItems: 'start' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>Asset Details</h2>
            {[
              { label: 'Asset Name', value: assetName, setter: setAssetName, placeholder: 'e.g. Pump Unit A-12' },
              { label: 'Asset ID', value: assetId, setter: setAssetId, placeholder: 'e.g. AST-2025-001' },
              { label: 'Location', value: location, setter: setLocation, placeholder: 'e.g. Plant 1 - Floor B' },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label} style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>{label}</label>
                <input value={value} onChange={e => setter(e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <button style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>⬇ Download QR Code</button>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center', minWidth: '280px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '16px' }}>Preview</div>
            <img src={qrUrl} alt="Generated QR Code" style={{ width: '220px', height: '220px', borderRadius: '8px' }} />
            <div style={{ marginTop: '16px', fontSize: '13px', color: '#374151', fontWeight: '600' }}>{assetName}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{assetId} · {location}</div>
          </div>
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>How Teams Use QR Codes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '50px' }}>
          {useCases.map((u) => (
            <div key={u.title} style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              <img src={u.img} alt={u.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <div style={{ padding: '18px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{u.icon} {u.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.6' }}>{u.desc}</p>
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
