import React, { useState, useEffect } from 'react';
import AuthHeader from './auth/AuthHeader';
import subscriptionAPI from '../api/subscription';
import api from '../api/axios';

const products = [
  {
    name: 'CMMS',
    label: 'CMMS',
    description:
      'Mobile-first maintenance management that turns reactive firefighting into proactive operations. Create work orders in seconds, automate PMs, and give your team real-time visibility from any device.'
  },
  {
    name: 'FixNest Intelligence',
    label: 'Intelligence',
    description:
      'Embedded AI tools that eliminate busywork and surface insights your team would never find manually. From smart scheduling to predictive recommendations, Intelligence helps you work faster and smarter without extra setup.'
  },
  {
    name: 'Studio',
    label: 'Studio',
    description:
      'Custom app platform that lets anyone on your team build exactly the tools they need or install from 30+ ready-made apps, all running on your existing data, permissions, and security. No code. No IT. No limits.'
  },
  {
    name: 'EHS',
    label: 'Environment, Health, & Safety Software',
    description:
      'Capture safety events in seconds with voice-to-text reporting that works in any language. Automated OSHA logs, AI-powered CAPAs, and instant audit trails help you reduce incidents and stay compliant.'
  },
  {
    name: 'FixNestEdge',
    label: 'Edge',
    description:
      'Wireless IoT sensors that monitor your assets 24/7 and automatically create work orders when conditions change. Install in hours, not months, and avoid hardwiring or data science overhead.'
  },
  {
    name: 'FixNestFleet',
    label: 'Fleet',
    description:
      'Vehicle maintenance management that connects telematics data to work orders through real-time integrations and automated PM scheduling. Instant VIN lookup, digital inspections, and complete vehicle history in one system.'
  },
  {
    name: 'FixNestLMS',
    label: 'Learning Management Software',
    description:
      'Enable your frontline team to access job-relevant training, track certifications, and prove compliance. No more spreadsheets, delays, or one-size-fits-all courses.'
  }
];

// Plan descriptions and features (static content)
const planMetadata = {
  basic: {
    displayName: 'Essential',
    description: 'Small teams or single-site operations getting off spreadsheets and paper for the first time.',
    features: ['Unlimited work orders', 'Unlimited locations', 'Nova AI'],
    cta: 'Try for free'
  },
  premium: {
    displayName: 'Premium',
    description: 'Growing maintenance teams ready to move from reactive to preventive maintenance.',
    features: [
      'FixNestStudio',
      'PM scheduling',
      'Custom checklists',
      'Parts & inventory with costing',
      'Time & labor tracking',
      '30-day analytics history'
    ],
    cta: 'Try for free'
  },
  professional: {
    displayName: 'Professional',
    badge: 'Most Popular',
    description: 'Departments managing multiple asset types, needing field mobility and deeper analytics.',
    features: [
      'Mobile offline mode',
      'External request portal',
      'Full analytics history',
      'Asset lifecycle tracking',
      'Signature capture for compliance'
    ],
    cta: 'Schedule a Demo'
  },
  enterprise: {
    displayName: 'Enterprise',
    description: 'Multi-site organizations needing automation, integrations, and governance controls.',
    features: [
      'Multi-site module support',
      'Workflow automation',
      'Reliability & downtime tracking',
      'PO management',
      'API & custom integrations',
      'SSO & custom roles',
      'Custom dashboards'
    ],
    cta: 'Schedule a Demo'
  }
};

const LandingPage = () => {
  const [pricing, setPricing] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [changingCurrency, setChangingCurrency] = useState(false);

  const currencySymbols = {
    'USD': '$',
    'RWF': 'FRw'
  };

  const fetchPricingData = async () => {
    try {
      const response = await subscriptionAPI.getPricing();
      setPricing(response.data?.pricing || response.pricing);
      setCurrency(response.data?.currency || 'USD');
    } catch (err) {
      console.error('Error fetching pricing:', err);
    }
  };

  const handleCurrencyChange = async (newCurrency) => {
    if (changingCurrency) return;
    
    try {
      setChangingCurrency(true);
      const payload = {
        platform: {
          subscriptionCurrency: newCurrency
        }
      };
      await api.put('/api/system-settings', payload);
      setCurrency(newCurrency);
      await fetchPricingData();
    } catch (err) {
      console.error('Error updating currency:', err);
      alert('Failed to change currency: ' + (err.response?.data?.error || err.message));
    } finally {
      setChangingCurrency(false);
    }
  };

  const handleUpgrade = (planKey) => {
    window.location.href = `/subscription?plan=${planKey}&currency=${currency}`;
  };

  useEffect(() => {
    fetchPricingData();
  }, []);

  const pricingPlans = pricing 
    ? Object.entries(pricing).map(([planKey, planPrices]) => {
        const metadata = planMetadata[planKey] || {};
        const monthlyPrice = planPrices.monthly;
        const symbol = currencySymbols[currency] || '$';
        
        return {
          key: planKey,
          name: metadata.displayName || planKey,
          price: monthlyPrice ? `${symbol}${monthlyPrice}` : 'Request a Quote',
          period: monthlyPrice ? '/user/mo' : '',
          badge: metadata.badge,
          description: metadata.description,
          features: metadata.features || [],
          cta: metadata.cta
        };
      })
    : [];

  return (
    <div className="landing-page">
      <AuthHeader />

      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-kicker">CONNECTED. INTELLIGENT. ADAPTABLE.</div>
          <h1 className="landing-title">The modern platform for asset operations</h1>
          <p className="landing-subtitle">
            Fixnest brings maintenance, safety, and asset data into one platform. Your teams see what
            matters. AI helps them act on it. Everything works together, and nothing falls through the cracks.
          </p>
          <div className="landing-cta-row">
            <a className="landing-cta" href="/register">Start a Free Trial</a>
            <a className="landing-cta landing-cta--ghost" href="/pricing">Request a Demo</a>
          </div>
        </div>
        <div className="landing-hero-media">
          <div className="hero-photo">
            <div className="hero-card hero-card--task">
              <div className="hero-card-title">Seasonal Electrical Connection Audit</div>
              <div className="hero-card-meta">Open · 1 hour</div>
            </div>
            <div className="hero-card hero-card--metrics">
              <div className="hero-card-title">Completion Rate</div>
              <div className="hero-card-metric">84% Completed</div>
              <div className="hero-card-graph" />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-logos">
        <div className="landing-logos-title">TRUSTED BY 4,000+ BUSINESSES</div>
        {/* <div className="landing-logos-row">
          <div className="logo-pill">Unilever</div>
          <div className="logo-pill">Pepsi</div>
          <div className="logo-pill">Chevron</div>
          <div className="logo-pill">Caterpillar</div>
          <div className="logo-pill">Shell</div>
          <div className="logo-pill">Yamaha</div>
          <div className="logo-pill">Stratasys</div>
        </div> */}
      </section>

      <section className="landing-section landing-products">
        <div className="landing-section-header">
          <div className="landing-section-title">Our Products</div>
          <a className="landing-section-cta" href="/pricing">Request a Demo</a>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article key={product.name} className="product-card">
              <div className="product-label">{product.label}</div>
              <h3 className="product-title">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <button className="product-link" type="button">Learn More</button>
            </article>
          ))}
        </div>
      </section>

      {pricingPlans.length > 0 && (
        <section className="landing-section landing-pricing">
          <div className="landing-section-header">
            <div>
              <div className="landing-kicker">FixNestPRICING</div>
              <div className="landing-section-title">Plans for Every Team</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => handleCurrencyChange('USD')}
                disabled={changingCurrency}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px',
                  border: currency === 'USD' ? '2px solid #0066cc' : '1px solid #ddd',
                  backgroundColor: currency === 'USD' ? '#f0f8ff' : '#fff',
                  color: currency === 'USD' ? '#0066cc' : '#333',
                  fontWeight: currency === 'USD' ? '600' : '500',
                  cursor: changingCurrency ? 'not-allowed' : 'pointer',
                  opacity: changingCurrency ? 0.6 : 1,
                  fontSize: '14px'
                }}
              >
                USD ($)
              </button>
              <button 
                onClick={() => handleCurrencyChange('RWF')}
                disabled={changingCurrency}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px',
                  border: currency === 'RWF' ? '2px solid #0066cc' : '1px solid #ddd',
                  backgroundColor: currency === 'RWF' ? '#f0f8ff' : '#fff',
                  color: currency === 'RWF' ? '#0066cc' : '#333',
                  fontWeight: currency === 'RWF' ? '600' : '500',
                  cursor: changingCurrency ? 'not-allowed' : 'pointer',
                  opacity: changingCurrency ? 0.6 : 1,
                  fontSize: '14px'
                }}
              >
                RWF (FRw)
              </button>
            </div>
          </div>
          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <article
                key={plan.key}
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
                <button 
                  className="pricing-cta" 
                  type="button"
                  onClick={() => handleUpgrade(plan.key)}
                  style={{ cursor: 'pointer' }}
                >
                  {plan.cta}
                </button>
                <div className="pricing-note">No Credit Card Required.</div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="landing-section landing-integrations">
        <div className="integration-card">
          <div className="integration-text">
            <div className="landing-kicker">INTEGRATIONS</div>
            <h2>Connects to what you already use.</h2>
            <p>
              Plug into your ERP, sensors, and other systems without disruption. One data foundation
              across everything.
            </p>
          </div>
          <div className="integration-visual">
            <div className="integration-node">CMMS</div>
            <div className="integration-node">Fleet</div>
            <div className="integration-node">Edge</div>
            <div className="integration-node">EHS</div>
            <div className="integration-node">LMS</div>
            <div className="integration-core">Nova Agent</div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-ai">
        <div className="ai-panel">
          <div className="ai-text">
            <h2>Automate the tedious. Accelerate the complex.</h2>
            <p>
              Give your team AI that does real work. Nova handles routine tasks and surfaces insights
              that used to take hours.
            </p>
            <div className="ai-cta-row">
              <a className="landing-cta" href="/register">Start a Free Trial</a>
              <a className="landing-cta landing-cta--ghost" href="/pricing">Request a Demo</a>
            </div>
          </div>
          <div className="ai-visual">
            <div className="ai-orb">Hi</div>
            <div className="ai-chat">
              <div className="ai-chat-title">How can I help?</div>
              <div className="ai-input">Create a dashboard to display analytics...</div>
              <div className="ai-actions">
                <span className="ai-chip" />
                <span className="ai-chip" />
                <span className="ai-chip ai-chip--send" />
              </div>
            </div>
          </div>
        </div>
        <div className="ai-cards">
          <div className="ai-card">
            <h3>Easily Complete Work Orders from Anywhere</h3>
            <p>
              Create work orders in seconds with photos, checklists, and real-time updates from any device.
              Technicians close work on the spot, reducing admin time and improving response speed.
            </p>
          </div>
          <div className="ai-card">
            <h3>Stay Ahead of Breakdowns with Automated PMs</h3>
            <p>
              Shift from reactive firefighting to proactive planning with automated schedules based on actual usage.
              Smart scheduling keeps assets running longer and minimizes downtime.
            </p>
          </div>
          <div className="ai-card">
            <h3>Turn Safety Events into Preventive Action</h3>
            <p>
              Report safety events from any device - just scan a QR code, no downloads or logins needed.
              AI turns incidents into preventive actions so small issues do not become big problems.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-proof">
        <div className="landing-proof-content">
          <div className="landing-section-title">Leading the Way to a Better Future for Maintenance and Reliability</div>
          <p>
            Your asset and equipment data does not belong in a silo. Fixnest makes it simple to see where everything
            stands, all in one place. That means less guesswork and more time to focus on what matters.
          </p>
          <div className="landing-cta-row">
            <a className="landing-cta" href="/register">Start a Free Trial</a>
            <a className="landing-cta landing-cta--ghost" href="/pricing">Request a Demo</a>
          </div>
          <div className="landing-badges">
            <span className="badge-pill">IDC CMMS Leader 2021</span>
            <span className="badge-pill">Gartner Peer Insights</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
