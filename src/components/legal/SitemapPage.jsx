import React from 'react';
import { Link } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

export default function SitemapPage({ sections = [] }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      <AuthHeader />
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e40af)', color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '72px 24px 64px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#bfdbfe' }}>
            Navigation
          </div>
          <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', margin: '16px 0 12px', lineHeight: 1.08 }}>
            Sitemap
          </h1>
          <p style={{ maxWidth: '720px', fontSize: '17px', lineHeight: 1.7, color: '#dbeafe', margin: 0 }}>
            Browse the main public pages, product pages, feature pages, and legal pages connected through the FixNest footer.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 72px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}
        >
          {sections.map((section) => (
            <div
              key={section.title}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '22px',
                padding: '24px',
                boxShadow: '0 12px 24px rgba(15,23,42,0.05)',
              }}
            >
              <h2 style={{ fontSize: '20px', margin: 0, marginBottom: '16px' }}>{section.title}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {section.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600, lineHeight: 1.5 }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
