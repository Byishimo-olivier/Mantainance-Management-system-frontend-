import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const posts = [
  {
    category: 'Maintenance Strategy',
    title: 'The Complete Guide to Preventive Maintenance in 2025',
    excerpt: 'How forward-thinking maintenance teams are moving from reactive firefighting to structured PM programs that cut downtime by 40%.',
    img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=480&h=280&fit=crop',
    read: '8 min read',
  },
  {
    category: 'Best Practices',
    title: '10 KPIs Every Maintenance Manager Should Track',
    excerpt: 'From MTTR to wrench time, this breakdown helps you measure what matters and benchmark your team against industry leaders.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=280&fit=crop',
    read: '6 min read',
  },
  {
    category: 'Industry Trends',
    title: 'How IoT Is Reshaping Asset Operations in Africa',
    excerpt: 'A closer look at how manufacturing and facility teams across Sub-Saharan Africa are adopting wireless sensors to reduce unplanned downtime.',
    img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=280&fit=crop',
    read: '5 min read',
  },
  {
    category: 'How-To',
    title: 'How to Build a Maintenance Checklist That Actually Gets Used',
    excerpt: 'A practical step-by-step guide to designing checklists that technicians want to complete — not skip.',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=480&h=280&fit=crop',
    read: '7 min read',
  },
  {
    category: 'Case Story',
    title: 'How a Rwandan Food Manufacturer Cut Downtime by 60%',
    excerpt: 'Inside the transformation: from paper-based work orders to a fully digital maintenance program in under 90 days.',
    img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=480&h=280&fit=crop',
    read: '4 min read',
  },
  {
    category: 'Product Insights',
    title: "What's New in FixNest: Spring 2025 Feature Roundup",
    excerpt: 'A walkthrough of the latest features including AI triage, advanced analytics, and the new Studio app marketplace.',
    img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=480&h=280&fit=crop',
    read: '3 min read',
  },
];

export default function BlogResource() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      {/* Hero */}
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1400&h=380&fit=crop" alt="Blog Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(10,20,40,0.85),rgba(30,60,120,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>FixNest Blog</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '560px', lineHeight: '1.6' }}>Insights, guides, and industry stories to help your team maintain more with less.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '60px' }}>
          {posts.map((p) => (
            <div key={p.title} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', cursor: 'pointer' }}>
              <img src={p.img} alt={p.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '24px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.category}</span>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', margin: '8px 0', lineHeight: '1.4' }}>{p.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>{p.excerpt}</p>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>📖 {p.read}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', backgroundColor: 'transparent', color: '#2563EB', border: '2px solid #2563EB', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
