import React, { useState, useEffect } from 'react';
import AuthHeader from './auth/AuthHeader';
import subscriptionAPI from '../api/subscription';
import api from '../api/axios';
import PaymentMethodModal from './PaymentMethodModal';
import useCompanySubscription from '../hooks/useCompanySubscription';

// Plan descriptions and features (static content)
const planMetadata = {
  basic: {
    displayName: 'Basic',
    description: 'Small teams or single-site operations getting off spreadsheets and paper for the first time.',
    features: ['Unlimited work orders', 'Unlimited locations', 'Over AI']
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
    features: ['Multi-site module support', 'Workflow automation', 'Reliability & downtime tracking', 'PO management', 'API & custom integrations', 'SSO & custom roles', 'Custom dashboards']
  },
  premium: {
    displayName: 'Premium',
    badge: 'Custom Quote',
    description: 'Growing maintenance teams ready to move from reactive to preventive maintenance.',
    features: [
      'FixNestStudio',
      'PM scheduling',
      'Custom checklists',
      'Parts & inventory with costing',
      'Time & labor tracking',
      '30-day analytics history'
    ],
    cta: 'Request Quotation',
    isPremium: true
  }
};

export default function Pricing() {
  const [pricing, setPricing] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [changingCurrency, setChangingCurrency] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Check if user's company has active subscription
  const { hasActive: hasActiveCompanySubscription, company, loading: subscriptionLoading } = useCompanySubscription();

  const currencySymbols = {
    'USD': '$',
    'RWF': 'FRw'
  };

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const response = await subscriptionAPI.getPricing();
      setPricing(response.data?.pricing || response.pricing);
      setCurrency(response.data?.currency || 'USD');
    } catch (err) {
      console.error('Error fetching pricing:', err);
      setError(err?.message || 'Failed to fetch pricing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingData();
  }, []);

  const handleCurrencyChange = async (newCurrency) => {
    if (changingCurrency) return;
    
    try {
      setChangingCurrency(true);
      // Update system settings
      const payload = {
        platform: {
          subscriptionCurrency: newCurrency
        }
      };
      await api.put('/api/system-settings', payload);
      setCurrency(newCurrency);
      // Re-fetch pricing to get updated data
      await fetchPricingData();
    } catch (err) {
      console.error('Error updating currency:', err);
      alert('Failed to change currency: ' + (err.response?.data?.error || err.message));
    } finally {
      setChangingCurrency(false);
    }
  };

  const handleUpgrade = (planKey) => {
    if (planKey === 'premium') {
      handlePremiumQuoteRequest();
    } else {
      setSelectedPlan(planKey);
      setShowPaymentModal(true);
    }
  };

  const handlePremiumQuoteRequest = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user.email || '';
    const companyName = user.companyName || user.company || 'Unknown Company';
    
    try {
      // Send quote request to admin
      await api.post('/api/quote-requests', {
        requesterEmail: userEmail,
        requesterName: user.name || 'Unknown',
        companyName: companyName,
        plan: 'premium',
        message: `Quote request for Premium plan with custom requirements.`
      });
      
      alert('Quote request sent! The system administrator will contact you shortly with a customized quote.');
      window.location.href = '/';
    } catch (error) {
      console.error('Error sending quote request:', error);
      alert('Failed to send quote request. Please contact the administrator directly.');
    }
  };

  const handlePaymentMethodSelect = async (paymentMethod) => {
    try {
      // Redirect to subscription page with payment details
      window.location.href = `/subscription?plan=${selectedPlan}&cycle=${billingCycle}&currency=${currency}&paymentMethod=${paymentMethod}`;
    } catch (error) {
      console.error('Error selecting payment method:', error);
      alert('Failed to proceed with payment. Please try again.');
    }
  };

  if (loading) {
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
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading pricing...</div>
      </div>
    );
  }

  if (error || !pricing) {
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
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          {error || 'Unable to load pricing information'}
        </div>
      </div>
    );
  }

  const pricingPlans = ['basic', 'professional', 'enterprise', 'premium']
    .filter(planKey => pricing[planKey])
    .map(planKey => {
      const planPrices = pricing[planKey];
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
        billingCycles: planPrices
      };
    });

  return (
    <div className="pricing-page">
      <AuthHeader />

      <section className="pricing-hero">
        <div className="pricing-hero-inner">
          <h1 className="pricing-title">Flexible pricing for every maintenance team</h1>
          <p className="pricing-subtitle">
            Start with a plan that fits today, then scale as your operations grow.
          </p>
          <div className="pricing-controls" style={{ marginTop: '30px', display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="billing-cycle-selector" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: '600' }}>Billing Cycle:</label>
              <select 
                value={billingCycle} 
                onChange={(e) => setBillingCycle(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="currency-selector" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontWeight: '600' }}>Currency:</label>
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
                  opacity: changingCurrency ? 0.6 : 1
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
                  opacity: changingCurrency ? 0.6 : 1
                }}
              >
                RWF (FRw)
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-grid">
        {pricingPlans.map((plan) => {
          const cyclePrice = plan.billingCycles[billingCycle];
          const symbol = currencySymbols[currency] || '$';
          const displayPrice = cyclePrice ? `${symbol}${cyclePrice}` : 'Request a Quote';
          
          return (
            <article
              key={plan.key}
              className={`pricing-card${plan.badge ? ' pricing-card--featured' : ''}${plan.key === 'premium' ? ' pricing-card--premium' : ''}`}
              style={plan.key === 'premium' ? {
                borderColor: '#9333ea',
                backgroundColor: '#faf5ff',
                position: 'relative',
                transform: 'scale(1.02)'
              } : {}}
            >
              {plan.badge ? (
                <div className="pricing-badge" style={plan.key === 'premium' ? {
                  backgroundColor: '#9333ea',
                  color: '#fff'
                } : {}}>
                  {plan.badge}
                </div>
              ) : null}
              <div className="pricing-name">{plan.name}</div>
              <div className="pricing-price">
                {plan.key === 'premium' ? (
                  <span style={{ color: '#9333ea', fontSize: '24px', fontWeight: 'bold' }}>Custom Pricing</span>
                ) : displayPrice}
                {cyclePrice && plan.key !== 'premium' && <span className="pricing-period">/{billingCycle}</span>}
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
              
              {/* Show different button states based on company subscription */}
              {hasActiveCompanySubscription ? (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '12px 16px', 
                  backgroundColor: '#d4edda', 
                  color: '#155724', 
                  borderRadius: '6px', 
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid #c3e6cb'
                }}>
                  ✓ Your company has an active subscription
                  {company?.name && <div style={{ fontSize: '12px', marginTop: '4px' }}>({company.name})</div>}
                </div>
              ) : (
                <button 
                  className="pricing-cta" 
                  type="button"
                  onClick={() => handleUpgrade(plan.key)}
                  style={{ 
                    cursor: 'pointer', 
                    marginTop: '20px',
                    backgroundColor: plan.key === 'premium' ? '#9333ea' : undefined,
                    borderColor: plan.key === 'premium' ? '#9333ea' : undefined,
                    color: plan.key === 'premium' ? '#fff' : undefined
                  }}
                  disabled={subscriptionLoading}
                >
                  {subscriptionLoading ? 'Loading...' : (plan.key === 'premium' ? 'Request Quotation' : (cyclePrice ? 'Start a Free Trial' : 'Request a Quote'))}
                </button>
              )}
            </article>
          );
        })}
      </section>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        plan={selectedPlan}
        billingCycle={billingCycle}
        currency={currency}
        onClose={() => setShowPaymentModal(false)}
        onSelect={handlePaymentMethodSelect}
      />
    </div>
  );
}
