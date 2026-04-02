import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

export default function ROICalculatorResource() {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState(10);
  const [avgSalary, setAvgSalary] = useState(24000);
  const [currentPMRate, setCurrentPMRate] = useState(40);
  const [avgRepairCost, setAvgRepairCost] = useState(800);
  const [repairsPerMonth, setRepairsPerMonth] = useState(20);

  const wrenchTimeGain = 0.25;
  const pmComplianceGain = 0.45;
  const repairReduction = 0.35;

  const laborSavings = technicians * avgSalary * wrenchTimeGain;
  const repairSavings = repairsPerMonth * 12 * avgRepairCost * repairReduction;
  const totalSavings = laborSavings + repairSavings;
  const fixnestCostEstimate = technicians * 1200;
  const netROI = totalSavings - fixnestCostEstimate;
  const roiPct = fixnestCostEstimate > 0 ? Math.round((netROI / fixnestCostEstimate) * 100) : 0;

  const fmt = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=1400&h=380&fit=crop" alt="ROI Calculator Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,25,5,0.87),rgba(20,100,50,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>ROI Calculator</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>See your personalized return on investment from switching to FixNest in under 60 seconds.</p>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '28px' }}>Your Numbers</h2>
            {[
              { label: 'Maintenance Technicians', value: technicians, setter: setTechnicians, min: 1, max: 500, step: 1 },
              { label: 'Avg Annual Salary / Technician ($)', value: avgSalary, setter: setAvgSalary, min: 5000, max: 150000, step: 1000 },
              { label: 'Current PM Compliance Rate (%)', value: currentPMRate, setter: setCurrentPMRate, min: 0, max: 100, step: 5 },
              { label: 'Avg Repair Cost / Incident ($)', value: avgRepairCost, setter: setAvgRepairCost, min: 50, max: 50000, step: 50 },
              { label: 'Unplanned Repairs / Month', value: repairsPerMonth, setter: setRepairsPerMonth, min: 1, max: 500, step: 1 },
            ].map(({ label, value, setter, min, max, step }) => (
              <div key={label} style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{label}</label>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a' }}>{value.toLocaleString()}</span>
                </div>
                <input type="range" min={min} max={max} step={step} value={value} onChange={e => setter(Number(e.target.value))} style={{ width: '100%', accentColor: '#16a34a' }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#f0fdf4', borderRadius: '16px', padding: '24px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', marginBottom: '4px' }}>Labor Savings</div>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#16a34a' }}>{fmt(laborSavings)}</div>
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>From 25% wrench-time improvement</div>
            </div>
            <div style={{ background: '#eff6ff', borderRadius: '16px', padding: '24px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', marginBottom: '4px' }}>Repair Cost Savings</div>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#2563EB' }}>{fmt(repairSavings)}</div>
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>From 35% fewer unplanned breakdowns</div>
            </div>
            <div style={{ background: netROI >= 0 ? 'linear-gradient(135deg,#052e16,#166534)' : 'linear-gradient(135deg,#450a0a,#991b1b)', borderRadius: '16px', padding: '24px', color: 'white' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: netROI >= 0 ? '#86efac' : '#fca5a5', textTransform: 'uppercase', marginBottom: '4px' }}>Net Annual ROI</div>
              <div style={{ fontSize: '42px', fontWeight: '900' }}>{fmt(netROI)}</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>{roiPct}% return on FixNest investment</div>
            </div>
            <button onClick={() => navigate('/pricing')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>Get Full Custom ROI Report →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
