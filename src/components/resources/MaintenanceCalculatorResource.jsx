import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

export default function MaintenanceCalculatorResource() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState(50);
  const [avgDowntime, setAvgDowntime] = useState(8);
  const [hourlyLoss, setHourlyLoss] = useState(500);
  const [currentPM, setCurrentPM] = useState(30);

  const potentialReduction = 0.45;
  const annualDowntimeHours = assets * avgDowntime * 12;
  const currentAnnualLoss = annualDowntimeHours * hourlyLoss;
  const projectedSavings = currentAnnualLoss * (potentialReduction * (1 - currentPM / 100));
  const roiMonths = projectedSavings > 0 ? Math.ceil(12 / (projectedSavings / (hourlyLoss * 100))) : 0;

  const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1400&h=380&fit=crop" alt="Calculator Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,20,50,0.87),rgba(20,70,160,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Maintenance Cost Calculator</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>Estimate how much unplanned downtime is costing you — and what FixNest could save.</p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Inputs */}
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '28px' }}>Your Operation</h2>
            {[
              { label: 'Number of Assets', value: assets, setter: setAssets, min: 1, max: 5000, step: 1 },
              { label: 'Avg Unplanned Failures / Asset / Month (hrs)', value: avgDowntime, setter: setAvgDowntime, min: 0.5, max: 100, step: 0.5 },
              { label: 'Hourly Production Loss ($)', value: hourlyLoss, setter: setHourlyLoss, min: 50, max: 100000, step: 50 },
              { label: 'Current PM Compliance (%)', value: currentPM, setter: setCurrentPM, min: 0, max: 100, step: 5 },
            ].map(({ label, value, setter, min, max, step }) => (
              <div key={label} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{label}</label>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#2563EB' }}>{value}</span>
                </div>
                <input type="range" min={min} max={max} step={step} value={value} onChange={e => setter(Number(e.target.value))} style={{ width: '100%', accentColor: '#2563EB' }} />
              </div>
            ))}
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#fff1f2', borderRadius: '16px', padding: '28px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', marginBottom: '6px' }}>Annual Downtime Loss</div>
              <div style={{ fontSize: '42px', fontWeight: '900', color: '#dc2626' }}>{fmt(currentAnnualLoss)}</div>
              <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>{annualDowntimeHours.toLocaleString()} downtime hours/year</div>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', borderRadius: '16px', padding: '28px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', marginBottom: '6px' }}>Projected Annual Savings with FixNest</div>
              <div style={{ fontSize: '42px', fontWeight: '900', color: '#16a34a' }}>{fmt(projectedSavings)}</div>
              <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>Est. ROI in under {roiMonths} months</div>
            </div>
            <button onClick={() => navigate('/pricing')} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}>Get a Custom ROI Report →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
