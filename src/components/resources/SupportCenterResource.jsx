import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../auth/AuthHeader';
import api from '../../api/axios';

const supportEmail = 'byishimo034@gmail.com';
const supportPhoneDisplay = '+250 783 227 490';
const supportPhoneHref = 'tel:+250783227490';

const channels = [
  {
    icon: '💬',
    title: 'Live Chat',
    desc: 'Get answers in real-time from our support team with fast first response during business hours.',
    hours: 'Mon-Fri, 8am-8pm EAT',
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=480&h=200&fit=crop',
    cta: 'Open Chat',
    action: 'chat',
  },
  {
    icon: '📧',
    title: 'Email Support',
    desc: 'Send detailed questions with screenshots and our team will respond with a thorough solution.',
    hours: '24/7 response within 4hrs',
    img: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=480&h=200&fit=crop',
    cta: 'Send Email',
    action: 'email',
  },
  {
    icon: '📞',
    title: 'Phone Support',
    desc: 'Speak directly with our support team for urgent issues and guided troubleshooting.',
    hours: 'Call during business hours',
    img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=480&h=200&fit=crop',
    cta: 'Call Now',
    action: 'call',
  },
  {
    icon: '📖',
    title: 'Help Center',
    desc: 'Step-by-step guides, troubleshooting notes, and setup walkthroughs for the features your team uses every day.',
    hours: 'Always available',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=480&h=200&fit=crop',
    cta: 'Browse Articles',
    action: 'articles',
  },
  {
    icon: '🎓',
    title: 'Training & Onboarding',
    desc: 'Book a guided onboarding session so your team can get configured, trained, and productive faster.',
    hours: 'All plans included',
    img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=480&h=200&fit=crop',
    cta: 'Book Session',
    action: 'booking',
  },
];

const helpArticles = [
  {
    title: 'Getting Started With Your First Work Order',
    category: 'Getting Started',
    readTime: '4 min read',
    summary: 'Set up your first request flow, assign a technician, and close the loop with status updates.',
  },
  {
    title: 'How To Organize Assets By Site and Category',
    category: 'Asset Management',
    readTime: '6 min read',
    summary: 'Build a clean asset structure that makes reporting, filtering, and preventive maintenance easier.',
  },
  {
    title: 'Scheduling Preventive Maintenance Without Spreadsheet Tracking',
    category: 'Preventive Maintenance',
    readTime: '5 min read',
    summary: 'Create recurring PM schedules, assign owners, and track completion from one place.',
  },
  {
    title: 'Using Dashboards To Review Team Performance',
    category: 'Analytics',
    readTime: '3 min read',
    summary: 'See response time, open work, and completion trends without building custom reports.',
  },
  {
    title: 'Support Checklist For New Team Onboarding',
    category: 'Training',
    readTime: '7 min read',
    summary: 'A practical rollout checklist for admins, technicians, and managers joining the platform.',
  },
  {
    title: 'Troubleshooting Login and Access Issues',
    category: 'Troubleshooting',
    readTime: '4 min read',
    summary: 'Fix common sign-in, invitation, and account access issues before escalating to support.',
  },
];

const initialBookingForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companyName: '',
  jobTitle: '',
  industry: '',
  companySize: '',
  maintenanceChallenge: '',
};

export default function SupportCenterResource() {
  const navigate = useNavigate();
  const [articleQuery, setArticleQuery] = useState('');
  const [bookingForm, setBookingForm] = useState(initialBookingForm);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const articlesRef = useRef(null);
  const bookingRef = useRef(null);

  const filteredArticles = useMemo(() => {
    const query = articleQuery.trim().toLowerCase();
    if (!query) return helpArticles;
    return helpArticles.filter((article) =>
      `${article.title} ${article.category} ${article.summary}`.toLowerCase().includes(query)
    );
  }, [articleQuery]);

  const scrollToRef = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleChannelClick = (action) => {
    if (action === 'email') {
      window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent('FixNest Support Request')}`;
      return;
    }
    if (action === 'call') {
      window.location.href = supportPhoneHref;
      return;
    }
    if (action === 'articles') {
      scrollToRef(articlesRef);
      return;
    }
    if (action === 'booking') {
      scrollToRef(bookingRef);
      return;
    }
    if (action === 'chat') {
      window.location.hash = 'contact-widget';
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleBookingChange = (event) => {
    const { name, value } = event.target;
    setBookingForm((current) => ({ ...current, [name]: value }));
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    setIsSubmittingBooking(true);

    try {
      await api.post('/demo-requests', {
        ...bookingForm,
        maintenanceChallenge: `Training & Onboarding Booking Request\n\n${bookingForm.maintenanceChallenge}`.trim(),
      });
      setBookingSuccess('Your onboarding request has been sent. Our team will contact you to confirm the session.');
      setBookingForm(initialBookingForm);
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'We could not submit the booking request. Please try again.';
      setBookingError(message);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader />
      <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&h=380&fit=crop" alt="Support Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(5,20,50,0.87), rgba(20,80,160,0.5))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Support Center</h1>
          <p style={{ fontSize: '18px', color: '#e2e8f0', maxWidth: '580px', lineHeight: '1.6' }}>Real humans. Fast responses. Clear help when you need it most.</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[{ v: '< 2 min', l: 'Chat Response' }, { v: '< 4 hrs', l: 'Email Response' }, { v: '6', l: 'Featured Articles' }].map((s) => (
              <div key={s.l} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 18px', backdropFilter: 'blur(6px)' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{s.v}</div>
                <div style={{ fontSize: '11px', color: '#93c5fd' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginBottom: '72px' }}>
          {channels.map((c) => (
            <div key={c.title} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <img src={c.img} alt={c.title} style={{ width: '100%', height: '165px', objectFit: 'cover' }} />
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '26px', marginBottom: '6px' }}>{c.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{c.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.6', marginBottom: '10px' }}>{c.desc}</p>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>🕐 {c.hours}</div>
                <button
                  type="button"
                  onClick={() => handleChannelClick(c.action)}
                  style={{ padding: '8px 18px', background: '#eff6ff', color: '#2563EB', border: '1px solid #bfdbfe', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                >
                  {c.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        <section ref={articlesRef} style={{ marginBottom: '72px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '1px', color: '#2563eb', textTransform: 'uppercase', marginBottom: '10px' }}>Help Center</div>
              <h2 style={{ fontSize: '34px', fontWeight: '800', color: '#111827', marginBottom: '10px' }}>Featured support articles</h2>
              <p style={{ fontSize: '16px', color: '#6b7280', maxWidth: '720px', lineHeight: '1.7' }}>
                Start with the most-used guides for onboarding, work orders, preventive maintenance, and common troubleshooting.
              </p>
            </div>
            <input
              type="search"
              value={articleQuery}
              onChange={(event) => setArticleQuery(event.target.value)}
              placeholder="Search help articles"
              style={{ minWidth: '280px', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {filteredArticles.map((article) => (
              <article key={article.title} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: '0 10px 30px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'inline-flex', padding: '6px 10px', borderRadius: '999px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: '700', marginBottom: '14px' }}>
                  {article.category}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '10px', lineHeight: '1.4' }}>{article.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.7', marginBottom: '14px' }}>{article.summary}</p>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{article.readTime}</div>
              </article>
            ))}
          </div>
        </section>

        <section ref={bookingRef} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.95fr) minmax(320px, 1.05fr)', gap: '28px', alignItems: 'start', marginBottom: '56px' }}>
          <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '20px', padding: '28px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '1px', color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '10px' }}>Training & Onboarding</div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>Book a guided rollout session</h2>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.7', marginBottom: '20px' }}>
              Share your team size, industry, and onboarding goals. We will use the existing booking backend to capture the request and schedule your session.
            </p>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                'Admin setup and account structure review',
                'Work order and asset workflow training',
                'Role-based onboarding for managers and technicians',
                'Best-practice rollout guidance for your industry',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: '10px', alignItems: 'start', color: '#1e293b', fontSize: '14px' }}>
                  <span style={{ color: '#2563eb', fontWeight: '900' }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 12px 30px rgba(15,23,42,0.06)' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '18px' }}>Request onboarding</h3>
            <form onSubmit={handleBookingSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>
                  First name
                  <input name="firstName" value={bookingForm.firstName} onChange={handleBookingChange} required style={{ width: '100%', marginTop: '6px', padding: '11px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </label>
                <label style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>
                  Last name
                  <input name="lastName" value={bookingForm.lastName} onChange={handleBookingChange} required style={{ width: '100%', marginTop: '6px', padding: '11px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </label>
                <label style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>
                  Work email
                  <input name="email" type="email" value={bookingForm.email} onChange={handleBookingChange} required style={{ width: '100%', marginTop: '6px', padding: '11px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </label>
                <label style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>
                  Phone
                  <input name="phone" value={bookingForm.phone} onChange={handleBookingChange} required style={{ width: '100%', marginTop: '6px', padding: '11px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </label>
                <label style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>
                  Company name
                  <input name="companyName" value={bookingForm.companyName} onChange={handleBookingChange} required style={{ width: '100%', marginTop: '6px', padding: '11px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </label>
                <label style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>
                  Job title
                  <input name="jobTitle" value={bookingForm.jobTitle} onChange={handleBookingChange} style={{ width: '100%', marginTop: '6px', padding: '11px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </label>
                <label style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>
                  Industry
                  <input name="industry" value={bookingForm.industry} onChange={handleBookingChange} placeholder="Manufacturing, healthcare, facilities..." style={{ width: '100%', marginTop: '6px', padding: '11px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </label>
                <label style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>
                  Company size
                  <select name="companySize" value={bookingForm.companySize} onChange={handleBookingChange} style={{ width: '100%', marginTop: '6px', padding: '11px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                    <option value="">Select size</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="500+">500+</option>
                  </select>
                </label>
              </div>

              <label style={{ fontSize: '13px', color: '#334155', fontWeight: '600', display: 'block', marginBottom: '14px' }}>
                What should the onboarding session focus on?
                <textarea
                  name="maintenanceChallenge"
                  value={bookingForm.maintenanceChallenge}
                  onChange={handleBookingChange}
                  rows={4}
                  placeholder="Asset setup, work order flow, PM rollout, team training..."
                  style={{ width: '100%', marginTop: '6px', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </label>

              {bookingError ? <div style={{ marginBottom: '12px', color: '#b91c1c', fontSize: '13px', fontWeight: '600' }}>{bookingError}</div> : null}
              {bookingSuccess ? <div style={{ marginBottom: '12px', color: '#166534', fontSize: '13px', fontWeight: '600' }}>{bookingSuccess}</div> : null}

              <button type="submit" disabled={isSubmittingBooking} style={{ padding: '12px 18px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: isSubmittingBooking ? 'not-allowed' : 'pointer', opacity: isSubmittingBooking ? 0.7 : 1 }}>
                {isSubmittingBooking ? 'Sending request...' : 'Book onboarding session'}
              </button>
            </form>
          </div>
        </section>

        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginRight: '12px' }}>Go to Dashboard</button>
          <button onClick={() => navigate('/pricing')} style={{ padding: '14px 32px', backgroundColor: 'transparent', color: '#2563EB', border: '2px solid #2563EB', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}
