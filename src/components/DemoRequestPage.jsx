import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import AuthHeader from './auth/AuthHeader';
import api from '../api/axios';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  companyName: '',
  phone: '',
  jobTitle: '',
  industry: '',
  companySize: '',
  maintenanceChallenge: '',
};

const demoSteps = [
  "We'll contact you to learn about your needs and industry before scheduling a demo.",
  "We'll schedule a 30-60 minute live demo tailored to your organization's size and workflow.",
  'The demo will highlight key features based on your specific needs.',
  "We'll focus on tools and use cases relevant to your industry.",
  "Afterward, we'll share a follow-up that includes a summary, pricing, and suggested next steps.",
];

export default function DemoRequestPage() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [emailWarning, setEmailWarning] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setEmailWarning('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/demo-requests', form);
      const delivery = response.data?.emailDelivery;
      setSubmittedName(form.firstName.trim());
      if (delivery?.requester && !delivery.requester.success) {
        setEmailWarning('Your request was saved, but the confirmation email could not be delivered. Our team still received your request.');
      }
      setForm(initialForm);
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Failed to submit demo request. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedName) {
    return (
      <div className="demo-page">
        <AuthHeader />
        <main className="demo-success">
          <div className="demo-success__content">
            <CheckCircle2 className="demo-success__icon" aria-hidden="true" />
            <h1>You're all set!</h1>
            <p>
              Thanks for requesting a live demo{submittedName ? `, ${submittedName}` : ''}. While we're scheduling your
              session, get more acquainted with our <Link to="/product/cmms">system of solutions</Link>.
            </p>
            {emailWarning ? <div className="demo-success__warning">{emailWarning}</div> : null}
            <section className="demo-process-card" aria-label="Demo process">
              <h2>In the meantime, here's what you can expect from the demo process:</h2>
              <ul>
                {demoSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </section>
            <div className="demo-success__actions">
              <Link className="demo-secondary-link" to="/">
                <ArrowLeft size={18} aria-hidden="true" />
                Back to home
              </Link>
              <Link className="demo-primary-link" to="/resources">
                Explore resources
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="demo-page">
      <AuthHeader />
      <main className="demo-shell">
        <section className="demo-intro">
          <Link className="demo-back-link" to="/">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to home
          </Link>
          <div className="landing-kicker">REQUEST A LIVE DEMO</div>
          <h1>See how Fixnest can fit your maintenance workflow.</h1>
          <p>
            Tell us a little about your team and the maintenance challenges you want to solve. We'll send a confirmation
            email and follow up to schedule a tailored session.
          </p>
          <div className="demo-expectations">
            {demoSteps.slice(0, 3).map((step) => (
              <div key={step} className="demo-expectation">
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="demo-form-card" aria-label="Request demo form">
          <h2>Request your demo</h2>
          <form onSubmit={handleSubmit} className="demo-form">
            <div className="demo-form-grid">
              <label>
                First name
                <input name="firstName" value={form.firstName} onChange={handleChange} required autoComplete="given-name" />
              </label>
              <label>
                Last name
                <input name="lastName" value={form.lastName} onChange={handleChange} required autoComplete="family-name" />
              </label>
              <label>
                Work email
                <input name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" />
              </label>
              <label>
                Phone
                <input name="phone" value={form.phone} onChange={handleChange} required autoComplete="tel" />
              </label>
              <label>
                Company name
                <input name="companyName" value={form.companyName} onChange={handleChange} required autoComplete="organization" />
              </label>
              <label>
                Job title
                <input name="jobTitle" value={form.jobTitle} onChange={handleChange} autoComplete="organization-title" />
              </label>
              <label>
                Industry
                <input name="industry" value={form.industry} onChange={handleChange} placeholder="Manufacturing, property, hospitality..." />
              </label>
              <label>
                Company size
                <select name="companySize" value={form.companySize} onChange={handleChange}>
                  <option value="">Select size</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </label>
            </div>
            <label>
              What do you want to improve?
              <textarea
                name="maintenanceChallenge"
                value={form.maintenanceChallenge}
                onChange={handleChange}
                rows={4}
                placeholder="Preventive maintenance, work orders, asset tracking, reporting..."
              />
            </label>
            {error ? <div className="demo-error">{error}</div> : null}
            <button className="demo-submit" type="submit" disabled={isSubmitting}>
              <Send size={18} aria-hidden="true" />
              {isSubmitting ? 'Sending request...' : 'Request Demo'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
