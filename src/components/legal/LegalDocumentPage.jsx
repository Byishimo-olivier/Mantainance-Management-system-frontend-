import React from 'react';
import AuthHeader from '../auth/AuthHeader';

export default function LegalDocumentPage({ document }) {
  if (!document) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      <AuthHeader />
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1d4ed8)', color: '#fff' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '72px 24px 64px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#bfdbfe' }}>
            Legal
          </div>
          <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', margin: '16px 0 12px', lineHeight: 1.08 }}>
            {document.title}
          </h1>
          <p style={{ maxWidth: '760px', fontSize: '17px', lineHeight: 1.7, color: '#dbeafe', margin: 0 }}>
            {document.intro}
          </p>
          <div style={{ marginTop: '18px', fontSize: '14px', color: '#bfdbfe' }}>
            Last updated: {document.updatedAt}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 72px' }}>
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 14px 30px rgba(15,23,42,0.06)',
            padding: '32px',
          }}
        >
          {document.sections.map((section) => (
            <section key={section.heading} style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '24px', margin: 0, color: '#0f172a' }}>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} style={{ fontSize: '15px', lineHeight: 1.8, color: '#475569', marginTop: '14px', marginBottom: 0 }}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
