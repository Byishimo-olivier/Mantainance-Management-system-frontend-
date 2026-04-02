import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const stats = [
  { value: '40%', label: 'Less Inventory Spend' },
  { value: '99%', label: 'Stock Accuracy' },
  { value: '0', label: 'Stockouts (avg)' },
  { value: '3x', label: 'Faster Reorders' },
];

const features = [
  { icon: '📦', title: 'Parts Catalog', desc: 'Centralized catalog of every spare part with supplier details, lead times, unit costs, and storage locations — searchable from any device.', img: 'https://images.unsplash.com/photo-1553341640-6ebc7d6a77e9?w=480&h=240&fit=crop' },
  { icon: '📊', title: 'Real-Time Stock Levels', desc: 'Live inventory counts across all warehouses and storerooms. Set minimum stock thresholds and get alerts before you run out of critical spares.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=240&fit=crop' },
  { icon: '🔄', title: 'Automatic Reorder Triggers', desc: 'When inventory falls below your minimum threshold, FixNest automatically creates a purchase request or sends directly to your approved supplier.', img: 'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=480&h=240&fit=crop' },
  { icon: '🔗', title: 'Work Order Parts Linking', desc: 'Technicians request and consume parts directly from work orders. Every transaction is logged, costed, and reflected in inventory instantly.', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=240&fit=crop' },
  { icon: '🧾', title: 'Purchase Order Management', desc: 'Create, approve, and track purchase orders from within FixNest. Full audit trail from request to receipt with delivery confirmation.', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=480&h=240&fit=crop' },
  { icon: '📍', title: 'Multi-Location Inventory', desc: 'Track parts across multiple warehouses, service trucks, and technician kits. Transfer stock between locations and see availability everywhere at once.', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=480&h=240&fit=crop' },
];

export default function PartsInventoryFeature() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '440px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1553341640-6ebc7d6a77e9?w=1400&h=440&fit=crop" alt="Parts Inventory Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(20,10,5,0.87),rgba(150,60,10,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ background: 'rgba(253,186,116,0.2)', border: '1px solid rgba(253,186,116,0.4)', color: '#fbbf24', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '18px', textTransform: 'uppercase' }}>Parts & Inventory</span>
          <h1 style={{ fontSize: '50px', fontWeight: '900', color: 'white', marginBottom: '16px', lineHeight: '1.1', maxWidth: '720px' }}>The Right Part, Always in Stock</h1>
          <p style={{ fontSize: '19px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>Manage spare parts across every location, automate reorders, and eliminate the downtime caused by stockouts.</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/dashboard?tab=inventory')} style={{ padding: '13px 30px', background: 'linear-gradient(135deg,#d97706,#b45309)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>View Inventory</button>
            <button onClick={() => navigate('/pricing')} style={{ padding: '13px 30px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>See Pricing</button>
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#78350f,#92400e)', padding: '28px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
          {stats.map(s => <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>{s.value}</div><div style={{ fontSize: '13px', color: '#fcd34d', marginTop: '3px' }}>{s.label}</div></div>)}
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '14px' }}>Stop losing time searching for parts</h2>
          <p style={{ fontSize: '17px', color: '#6b7280', maxWidth: '720px', lineHeight: '1.7', margin: '0 auto' }}>FixNest Parts & Inventory gives you real-time visibility into every spare part, across every location, linked directly to the work orders that consume them — so nothing is ever lost or out of stock.</p>
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
        <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius: '18px', padding: '44px', textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '19px', fontStyle: 'italic', color: '#92400e', maxWidth: '680px', margin: '0 auto 20px', lineHeight: '1.7' }}>"We used to have technicians waiting 2 hours for parts that were sitting in another storeroom. FixNest showed us where everything was — stockouts dropped to near zero within 6 weeks."</p>
          <div style={{ fontWeight: '700', color: '#78350f' }}>Christine A. — Maintenance Supervisor</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard?tab=inventory')} style={{ padding: '14px 36px', background: 'linear-gradient(135deg,#d97706,#b45309)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginRight: '14px' }}>View Inventory</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 36px', backgroundColor: 'transparent', color: '#d97706', border: '2px solid #d97706', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
