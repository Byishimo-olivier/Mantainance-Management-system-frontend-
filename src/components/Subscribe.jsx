import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AuthHeader from './auth/AuthHeader';
import subscriptionAPI from '../api/subscription';
import api from '../api/axios';

const planMetadata = {
  basic: {
    displayName: 'Essential',
    description: 'Small teams or single-site operations getting off spreadsheets and paper for the first time.',
    features: ['Unlimited work orders', 'Unlimited locations', 'Nova AI']
  },
  premium: {
    displayName: 'Premium',
    description: 'Growing maintenance teams ready to move from reactive to preventive maintenance.',
    features: ['UpKeep Studio', 'PM scheduling', 'Custom checklists', 'Parts & inventory', 'Time & labor tracking', '30-day analytics history']
  },
  professional: {
    displayName: 'Professional',
    badge: 'Most Popular',
    description: 'Departments managing multiple asset types, needing field mobility and deeper analytics.',
    features: ['Mobile offline mode', 'External request portal', 'Full analytics history', 'Asset lifecycle tracking', 'Signature capture for compliance']
  },
  enterprise: {
    displayName: 'Enterprise',
    description: 'Multi-site organizations needing automation, integrations, and governance controls.',
    features: ['Multi-site module support', 'Workflow automation', 'Reliability & downtime tracking', 'PO management', 'API & custom integrations', 'SSO & custom roles']
  }
};

const currencySymbols = {
  'USD': '$',
  'RWF': 'FRw'
};

export default function Subscribe() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const planKey = searchParams.get('plan') || 'basic';
  const currencyParam = searchParams.get('currency') || 'USD';
  const billingCycle = searchParams.get('cycle') || 'monthly';
  
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currency, setCurrency] = useState(currencyParam);
  
  // Company information
  const [companyName, setCompanyName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        const response = await subscriptionAPI.getPricing();
        setPricing(response.data?.pricing || response.pricing);
        setCurrency(response.data?.currency || currencyParam);
      } catch (err) {
        console.error('Error fetching pricing:', err);
        setError('Failed to load pricing information');
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [currencyParam]);

  const handleStartFreeTrial = async () => {
    // Validate company info
    if (!companyName.trim()) {
      alert('Please enter your company name');
      return;
    }
    if (!managerEmail.trim() || !managerEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    // For all paid plans OR free plans, route to register then payment selection
    // Mobile money auto-routes through PesaPal on the payment selection page
    const params = new URLSearchParams({
      plan: planKey,
      cycle: billingCycle,
      currency: currency,
      companyName: companyName,
      email: managerEmail,
      phone: companyPhone
    });
    window.location.href = `/register?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="subscribe-page">
        <AuthHeader />
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Loading subscription details...</h2>
        </div>
      </div>
    );
  }

  if (error || !pricing) {
    return (
      <div className="subscribe-page">
        <AuthHeader />
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ color: 'red' }}>{error || 'Unable to load pricing'}</h2>
          <button onClick={() => navigate('/pricing')} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  const planPricing = pricing[planKey];
  const metadata = planMetadata[planKey] || {};
  const symbol = currencySymbols[currency] || '$';
  const price = planPricing?.[billingCycle] || 0;
  const displayPrice = price ? `${symbol}${price}` : 'Request a Quote';

  return (
    <div className="subscribe-page">
      <AuthHeader />

      <section style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
          {/* Left: Plan Details */}
          <div style={{ paddingRight: '20px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>{metadata.displayName}</h1>
            {metadata.badge && (
              <div style={{ display: 'inline-block', backgroundColor: '#ffd700', padding: '4px 12px', borderRadius: '20px', marginBottom: '20px', fontSize: '12px', fontWeight: '600' }}>
                {metadata.badge}
              </div>
            )}
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
              {metadata.description}
            </p>

            <h3 style={{ fontSize: '18px', marginBottom: '15px', fontWeight: '600' }}>What's Included:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {metadata.features.map((feature) => (
                <li key={feature} style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: '#0066cc', fontWeight: 'bold', marginTop: '3px' }}>✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Pricing & CTA */}
          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            padding: '30px',
            backgroundColor: '#f9f9f9',
            position: 'sticky',
            top: '80px'
          }}>
            <div style={{ marginBottom: '30px' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '5px' }}>
                {displayPrice}
              </div>
              {price > 0 && (
                <div style={{ fontSize: '16px', color: '#666' }}>
                  per user / {billingCycle}
                </div>
              )}
              <div style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
                Currency: <strong>{currency}</strong>
              </div>
            </div>

            {/* Company Information Form */}
            <div style={{ marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid #e0e0e0' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: '600' }}>Company Information</h3>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: '500', color: '#333' }}>Company Name *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: '500', color: '#333' }}>Manager Email *</label>
                <input
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: '500', color: '#333' }}>Phone Number</label>
                <input
                  type="tel"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="Enter phone number"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Payment Method Selection - SIMPLIFIED: All payments route through PesaPal */}
            {price > 0 && (
              <div style={{ marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#f0f7ff', padding: '20px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ color: '#0066cc', marginTop: '2px' }}>ℹ️</div>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#0066cc' }}>Flexible Payment Options</h4>
                    <p style={{ margin: '0', fontSize: '14px', color: '#555', lineHeight: '1.5' }}>
                      After registration, you can pay using mobile money (M-Pesa, Airtel Money, MTN, Orange Money, etc.) or cards via PesaPal. All payments are processed securely through our trusted payment partner.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '12px', marginBottom: '30px' }}>
              <button
                onClick={handleStartFreeTrial}
                disabled={processing}
                style={{
                  padding: '14px 20px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: '#0066cc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  opacity: processing ? 0.6 : 1,
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => !processing && (e.target.style.backgroundColor = '#0052a3')}
                onMouseOut={(e) => !processing && (e.target.style.backgroundColor = '#0066cc')}
              >
                {processing ? 'Processing...' : price > 0 ? 'Continue to Payment' : 'Start Free Trial'}
              </button>
            </div>

            <div style={{ fontSize: '14px', color: '#666', textAlign: 'center', borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
              <p style={{ margin: '0 0 10px 0' }}>✓ No credit card required for free trial</p>
              <p style={{ margin: 0 }}>✓ Cancel anytime</p>
            </div>

            <button
              onClick={() => navigate('/pricing')}
              style={{
                width: '100%',
                padding: '10px 20px',
                marginTop: '20px',
                fontSize: '14px',
                backgroundColor: 'white',
                color: '#0066cc',
                border: '1px solid #0066cc',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Back to Pricing
            </button>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#f5f5f5', padding: '60px 20px', marginTop: '60px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Why Choose {metadata.displayName}?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            <div>
              <h4 style={{ color: '#0066cc', marginBottom: '10px' }}>Easy Setup</h4>
              <p>Get started in minutes with our intuitive setup wizard. No technical knowledge required.</p>
            </div>
            <div>
              <h4 style={{ color: '#0066cc', marginBottom: '10px' }}>24/7 Support</h4>
              <p>Our support team is always here to help you succeed with our platform.</p>
            </div>
            <div>
              <h4 style={{ color: '#0066cc', marginBottom: '10px' }}>Flexible & Scalable</h4>
              <p>Upgrade or downgrade anytime. Pay only for what you use.</p>
            </div>
            <div>
              <h4 style={{ color: '#0066cc', marginBottom: '10px' }}>Data Security</h4>
              <p>Enterprise-grade security and compliance with industry standards.</p>
            </div>
            <div>
              <h4 style={{ color: '#0066cc', marginBottom: '10px' }}>Integrations</h4>
              <p>Connect with your existing tools and streamline your workflow.</p>
            </div>
            <div>
              <h4 style={{ color: '#0066cc', marginBottom: '10px' }}>Mobile First</h4>
              <p>Access your data on the go with our powerful mobile app.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
