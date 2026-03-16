import React from 'react';
import AuthHeader from './auth/AuthHeader';

const pricingPlans = [
  {
    name: 'Essential',
    price: '$20',
    period: '/user/mo',
    description: 'Small teams or single-site operations getting off spreadsheets and paper for the first time.',
    features: ['Unlimited work orders', 'Unlimited locations', 'Nova AI']
  },
  {
    name: 'Premium',
    price: '$55',
    period: '/user/mo',
    description: 'Growing maintenance teams ready to move from reactive to preventive maintenance.',
    features: ['UpKeep Studio', 'PM scheduling', 'Custom checklists', 'Parts & inventory', 'Time & labor tracking', '30-day analytics history']
  },
  {
    name: 'Professional',
    price: 'Request a Quote',
    badge: 'Most Popular',
    description: 'Departments managing multiple asset types, needing field mobility and deeper analytics.',
    features: ['Mobile offline mode', 'External request portal', 'Full analytics history', 'Asset lifecycle tracking', 'Signature capture for compliance']
  },
  {
    name: 'Enterprise',
    price: 'Request a Quote',
    description: 'Multi-site organizations needing automation, integrations, and governance controls.',
    features: ['Multi-site module support', 'Workflow automation', 'Reliability & downtime tracking', 'PO management', 'API & custom integrations', 'SSO & custom roles']
  }
];

export default function Pricing() {
  return (
    <div className="pricing-page">
      <AuthHeader />

      <section className="pricing-hero">
        <div className="pricing-hero-inner">
          <h1 className="pricing-title">Flexible pricing for every maintenance team</h1>
          <p className="pricing-subtitle">
            Start with a plan that fits today, then scale as your operations grow.
          </p>
        </div>
      </section>

      <section className="pricing-grid">
        {pricingPlans.map((plan) => (
          <article
            key={plan.name}
            className={`pricing-card${plan.badge ? ' pricing-card--featured' : ''}`}
          >
            {plan.badge ? <div className="pricing-badge">{plan.badge}</div> : null}
            <div className="pricing-name">{plan.name}</div>
            <div className="pricing-price">
              {plan.price}
              {plan.period ? <span className="pricing-period">{plan.period}</span> : null}
            </div>
            <p className="pricing-description">{plan.description}</p>
            <div className="pricing-feature-list">
              {plan.features.map((feature) => (
                <div key={feature} className="pricing-feature">
                  <span className="pricing-check" aria-hidden="true" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <button className="pricing-cta" type="button">
              {plan.price === 'Request a Quote' ? 'Request a Quote' : 'Start a Free Trial'}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
