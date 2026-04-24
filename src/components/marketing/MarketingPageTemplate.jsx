import React from 'react';
import { Link } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';

const sectionStyle = {
  maxWidth: '1180px',
  margin: '0 auto',
  padding: '64px 24px',
};

export default function MarketingPageTemplate({ page }) {
  if (!page) return null;

  const stats = Array.isArray(page.stats) ? page.stats : [];
  const highlights = Array.isArray(page.highlights) ? page.highlights : [];
  const relatedLinks = Array.isArray(page.relatedLinks) ? page.relatedLinks : [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      <AuthHeader />

      <div
        style={{
          position: 'relative',
          minHeight: '460px',
          overflow: 'hidden',
          backgroundColor: '#0f172a',
        }}
      >
        <img
          src={page.heroImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=520&fit=crop'}
          alt={page.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.28 }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(15,23,42,0.94), rgba(29,78,216,0.68))',
          }}
        />
        <div
          style={{
            ...sectionStyle,
            position: 'relative',
            minHeight: '460px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <span
            style={{
              width: 'fit-content',
              border: '1px solid rgba(191,219,254,0.35)',
              backgroundColor: 'rgba(59,130,246,0.16)',
              color: '#bfdbfe',
              borderRadius: '999px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {page.eyebrow || 'FixNest'}
          </span>
          <div style={{ maxWidth: '760px' }}>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.25rem)', lineHeight: 1.05, margin: 0, color: '#fff', fontWeight: 900 }}>
              {page.title}
            </h1>
            <p style={{ marginTop: '18px', fontSize: '18px', lineHeight: 1.7, color: '#dbeafe', maxWidth: '680px' }}>
              {page.description}
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link
              to={page.primaryCta?.to || '/pricing'}
              style={{
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff',
                padding: '14px 24px',
                borderRadius: '12px',
                fontWeight: 700,
                boxShadow: '0 12px 24px rgba(37,99,235,0.22)',
              }}
            >
              {page.primaryCta?.label || 'View Pricing'}
            </Link>
            <Link
              to={page.secondaryCta?.to || '/register'}
              style={{
                textDecoration: 'none',
                color: '#fff',
                padding: '14px 24px',
                borderRadius: '12px',
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.28)',
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}
            >
              {page.secondaryCta?.label || 'Create Account'}
            </Link>
          </div>
        </div>
      </div>

      {stats.length > 0 ? (
        <div style={{ background: '#e0ecff', borderBottom: '1px solid #bfdbfe' }}>
          <div
            style={{
              ...sectionStyle,
              paddingTop: '22px',
              paddingBottom: '22px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '18px',
            }}
          >
            {stats.map((stat) => (
              <div key={`${stat.value}-${stat.label}`} style={{ padding: '16px 18px', borderRadius: '18px', backgroundColor: '#fff', boxShadow: '0 10px 22px rgba(15,23,42,0.06)' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#1d4ed8' }}>{stat.value}</div>
                <div style={{ marginTop: '4px', fontSize: '14px', lineHeight: 1.5, color: '#475569' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div style={sectionStyle}>
        <div style={{ maxWidth: '760px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '32px', margin: 0, color: '#0f172a' }}>What this page covers</h2>
          <p style={{ marginTop: '12px', fontSize: '16px', lineHeight: 1.7, color: '#475569' }}>
            Explore the core concepts, workflows, and benefits behind {page.title}.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '22px',
          }}
        >
          {highlights.map((item) => (
            <div
              key={item.title}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 14px 30px rgba(15,23,42,0.05)',
              }}
            >
              <h3 style={{ fontSize: '18px', margin: 0, color: '#0f172a' }}>{item.title}</h3>
              <p style={{ marginTop: '12px', fontSize: '14px', lineHeight: 1.7, color: '#475569' }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...sectionStyle, paddingTop: 0 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
            borderRadius: '28px',
            padding: '32px',
            color: '#fff',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '30px' }}>Keep exploring</h2>
          <p style={{ marginTop: '12px', fontSize: '16px', lineHeight: 1.7, color: '#cbd5e1', maxWidth: '720px' }}>
            Jump to the next relevant FixNest page and continue exploring the platform.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              marginTop: '24px',
            }}
          >
            {relatedLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  textDecoration: 'none',
                  borderRadius: '18px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  padding: '16px 18px',
                  fontWeight: 600,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
