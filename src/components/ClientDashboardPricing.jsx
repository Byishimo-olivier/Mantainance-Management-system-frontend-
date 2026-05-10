import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import subscriptionAPI from '../api/subscription';
import api from '../api/axios';
import useCompanySubscription from '../hooks/useCompanySubscription';
import { DollarSign, Zap, Check, Plus, Info } from 'lucide-react';

const planMetadata = {
  basic: {
    displayName: 'Essential',
    description: 'Small teams or single-site operations getting started',
    features: ['Unlimited Work order', 'Request', 'AI']
  },
  professional: {
    displayName: 'Professional',
    badge: 'Most Popular',
    description: 'Departments managing multiple asset types with deeper analytics',
    features: ['Unlimited work Order', 'Requests', 'Asset', 'Location', 'PM', 'Over AI']
  },
  enterprise: {
    displayName: 'Enterprise',
    description: 'Multi-site organizations needing automation and integrations',
    features: ['Unlimited work Order', 'Requests', 'Asset', 'Location', 'PM', 'Over AI', 'Analytics', 'Material Request']
  },
  premium: {
    displayName: 'Premium',
    badge: 'Custom Quote',
    description: 'Growing teams ready for preventive maintenance',
    features: ['Unlimited work Order', 'Requests', 'Asset', 'Location', 'PM', 'Over AI', 'Analytics', 'Material Request', 'Purchase Order'],
    cta: 'Request Quotation',
    isPremium: true
  }
};

export default function ClientDashboardPricing({ currentUser = null }) {
  const [pricing, setPricing] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [includedEmployees, setIncludedEmployees] = useState(2);
  const [employeeCount, setEmployeeCount] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    hasActive: hasActiveCompanySubscription,
    subscription: companySubscription,
    company,
    teamMembers,
    loading: subscriptionLoading
  } = useCompanySubscription();

  const navigate = useNavigate();

  const currencySymbols = {
    'USD': '$',
    'RWF': 'FRw'
  };

  const handlePremiumQuoteRequest = async () => {
    const user = currentUser || JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user.email || '';
    const companyName = user.companyName || user.company || 'Unknown Company';

    try {
      await api.post('/api/quote-requests', {
        requesterEmail: userEmail,
        requesterName: user.name || 'Unknown',
        companyName,
        plan: 'premium',
        message: `Quote request for Premium plan from ${companyName}.`,
      });
      alert('Quote request sent. The administrator will contact you shortly.');
    } catch (quoteError) {
      console.error('Error sending quote request:', quoteError);
      alert('Failed to send quote request. Please contact the administrator directly.');
    }
  };

  const handleSubscribe = (planKey) => {
    if (planKey === 'premium') {
      handlePremiumQuoteRequest();
      return;
    }
    
    // Calculate the amount based on plan and billing cycle
    const planPrices = pricing[planKey];
    const baseAmount = planPrices[billingCycle] || 0;
    const amount = calculateEmployeeAdjustedAmount(baseAmount, employeeCount, includedEmployees);
    
    // Get user data from currentUser or localStorage
    const user = currentUser || JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user._id;
    const companyId = user.companyId || user.id;
    const email = user.email || '';
    const companyName = user.companyName || user.company || '';
    const phone = user.phone || user.phoneNumber || '';
    const branchLocation = user.branchLocation || '';
    const branchName = user.branchName || '';
    const companyType = user.companyType || '';
    
    // Redirect to payment selection page with all required data
    const params = new URLSearchParams({
      plan: planKey,
      currency: currency,
      cycle: billingCycle,
      amount: amount,
      employees: employeeCount,
      includedEmployees,
      extraEmployees: Math.max(0, employeeCount - includedEmployees),
      extraEmployeeAmount: getExtraEmployeeAmount(baseAmount, includedEmployees),
      userId: userId,
      companyId: companyId,
      email: email,
      companyName: companyName,
      phone: phone,
      branchLocation: branchLocation,
      branchName: branchName,
      companyType: companyType,
    });
    
    navigate(`/payment-selection?${params.toString()}`);
  };

  const calculateEmployeeAdjustedAmount = (baseAmount, employees = includedEmployees, included = includedEmployees) => {
    const safeBase = Number(baseAmount || 0);
    const safeIncluded = Math.max(1, Number(included || 2));
    const safeEmployees = Math.max(1, Math.ceil(Number(employees || safeIncluded)));
    const extraEmployees = Math.max(0, safeEmployees - safeIncluded);
    return Number((safeBase + (extraEmployees * getExtraEmployeeAmount(safeBase, safeIncluded))).toFixed(2));
  };

  const getExtraEmployeeAmount = (baseAmount, included = includedEmployees) => {
    const safeBase = Number(baseAmount || 0);
    return Number(safeBase.toFixed(2));
  };

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setLoading(true);
        const response = await subscriptionAPI.getPricing();
        setPricing(response.data?.pricing || response.pricing);
        setCurrency(response.data?.currency || 'USD');
        const policyIncludedEmployees = Number(response.data?.pricingPolicy?.includedEmployees || 2);
        setIncludedEmployees(policyIncludedEmployees);
        setEmployeeCount((currentCount) => Math.max(policyIncludedEmployees, currentCount));
      } catch (err) {
        console.error('Error fetching pricing:', err);
        setError(err?.message || 'Failed to fetch pricing');
      } finally {
        setLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  useEffect(() => {
    const existingLimit = Number(
      companySubscription?.metadata?.employeeLimit ||
      companySubscription?.metadata?.employeeCount ||
      company?.maxUsers ||
      teamMembers?.length ||
      currentUser?.techniciansCount ||
      2
    );
    if (Number.isFinite(existingLimit) && existingLimit > 0) {
      setEmployeeCount(Math.max(includedEmployees, Math.ceil(existingLimit)));
    }
  }, [companySubscription, company, teamMembers, currentUser, includedEmployees]);

  if (loading) {
    return (
      <div className="responsive-padding">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p style={{ marginTop: '16px', color: '#6B7280' }}>Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  if (error || !pricing) {
    return (
      <div className="responsive-padding">
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#FEE2E2',
          borderRadius: '12px',
          border: '1px solid #FECACA'
        }}>
          <Info className="h-12 w-12 mx-auto text-red-600 mb-4" />
          <p style={{ color: '#DC2626', fontWeight: '500' }}>
            {error || 'Unable to load pricing information'}
          </p>
        </div>
      </div>
    );
  }

  const pricingPlans = ['basic', 'professional', 'enterprise', 'premium']
    .filter(planKey => pricing[planKey])
    .map(planKey => {
      const planPrices = pricing[planKey];
      const metadata = planMetadata[planKey] || {};
      
      return {
        key: planKey,
        name: metadata.displayName || planKey,
        badge: metadata.badge,
        description: metadata.description,
        features: metadata.features || [],
        billingCycles: planPrices,
        isPremium: metadata.isPremium
      };
    });

  const symbol = currencySymbols[currency] || '$';

  return (
    <div className="responsive-padding" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-8">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <DollarSign className="h-8 w-8 text-blue-600" />
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: 0 }}>Subscription Plans</h1>
        </div>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' }}>
          Choose the perfect plan to manage your maintenance operations. Each admin-set plan price includes up to {includedEmployees} employees.
        </p>
      </div>

      {/* Controls */}
      <div className="glass-surface rounded-xl p-6 mb-8 border border-gray-200/70 shadow-lg">
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Billing Cycle Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>Billing Cycle:</label>
            <select 
              value={billingCycle} 
              onChange={(e) => setBillingCycle(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: '8px', 
                border: '1px solid #D1D5DB',
                backgroundColor: 'white',
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                cursor: 'pointer'
              }}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Currency Selector */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>Currency:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['USD', 'RWF'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '8px',
                    border: currency === curr ? '2px solid #1D4ED8' : '1px solid #D1D5DB',
                    backgroundColor: currency === curr ? '#EFF6FF' : '#F9FAFB',
                    color: currency === curr ? '#1D4ED8' : '#6B7280',
                    fontWeight: currency === curr ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {curr === 'USD' ? 'USD ($)' : 'RWF (FRw)'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>Employees:</label>
            <input
              type="number"
              min={1}
              value={employeeCount}
              onChange={(e) => setEmployeeCount(Math.max(1, Math.ceil(Number(e.target.value || includedEmployees))))}
              style={{
                width: '110px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                backgroundColor: 'white',
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827'
              }}
            />
            <span style={{ fontSize: '13px', color: '#6B7280' }}>
              First {includedEmployees} employees are included. Each extra employee adds the full admin-set plan amount.
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="responsive-grid-auto gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {pricingPlans.map((plan) => {
          const baseCyclePrice = plan.billingCycles[billingCycle];
          const cyclePrice = calculateEmployeeAdjustedAmount(baseCyclePrice, employeeCount, includedEmployees);
          const extraEmployeeAmount = getExtraEmployeeAmount(baseCyclePrice, includedEmployees);
          const displayPrice = cyclePrice ? `${symbol}${cyclePrice.toFixed(2)}` : 'Custom';
          const extraEmployees = Math.max(0, employeeCount - includedEmployees);
          const isCurrentPlan = hasActiveCompanySubscription && String(companySubscription?.plan || '').toLowerCase() === String(plan.key || '').toLowerCase();
          
          return (
            <div
              key={plan.key}
              style={{
                borderRadius: '12px',
                border: plan.badge ? '2px solid #1D4ED8' : '1px solid #E5E7EB',
                backgroundColor: plan.badge ? '#EFF6FF' : '#FFFFFF',
                padding: '24px',
                transition: 'all 0.3s',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: plan.badge ? '0 20px 25px -5px rgba(29, 78, 216, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = plan.badge ? '0 20px 25px -5px rgba(29, 78, 216, 0.25)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = plan.badge ? '0 20px 25px -5px rgba(29, 78, 216, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '24px',
                  backgroundColor: '#1D4ED8',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Plan Name */}
              <div style={{ marginBottom: '4px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  {plan.name}
                </h3>
              </div>

              {/* Price */}
              {!plan.isPremium && (
                <div style={{ marginBottom: '16px', paddingTop: '8px' }}>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#1D4ED8', margin: 0 }}>
                    {displayPrice}
                  </div>
                  {cyclePrice && (
                    <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                      per {billingCycle}
                    </div>
                  )}
                  {cyclePrice && (
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px', lineHeight: '1.5' }}>
                      Covers {employeeCount} employee{employeeCount === 1 ? '' : 's'}
                      {extraEmployees > 0
                        ? ` (${extraEmployees} extra x ${symbol}${extraEmployeeAmount.toFixed(2)})`
                        : ` (${includedEmployees} included)`}
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px', lineHeight: '1.5' }}>
                {plan.description}
              </p>

              {/* Features List */}
              <div style={{ marginBottom: '20px', flex: 1 }}>
                {plan.features.map((feature) => (
                  <div key={feature} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                    <Check style={{ 
                      height: '18px', 
                      width: '18px', 
                      color: '#10B981', 
                      flexShrink: 0, 
                      marginTop: '2px' 
                    }} />
                    <span style={{ fontSize: '13px', color: '#374151' }}>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => !isCurrentPlan && handleSubscribe(plan.key)}
                disabled={subscriptionLoading || isCurrentPlan}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: isCurrentPlan ? 'none' : (plan.badge ? 'none' : '1px solid #D1D5DB'),
                  backgroundColor: isCurrentPlan ? '#10B981' : (plan.badge ? '#1D4ED8' : '#F3F4F6'),
                  color: isCurrentPlan ? '#FFFFFF' : (plan.badge ? '#FFFFFF' : '#111827'),
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: subscriptionLoading || isCurrentPlan ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: subscriptionLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (subscriptionLoading || isCurrentPlan) {
                    return;
                  }
                  if (plan.badge) {
                    e.currentTarget.style.backgroundColor = '#1E40AF';
                  } else {
                    e.currentTarget.style.backgroundColor = '#E5E7EB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (subscriptionLoading || isCurrentPlan) {
                    e.currentTarget.style.backgroundColor = isCurrentPlan ? '#10B981' : (plan.badge ? '#1D4ED8' : '#F3F4F6');
                    return;
                  }
                  if (plan.badge) {
                    e.currentTarget.style.backgroundColor = '#1D4ED8';
                  } else {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }
                }}
              >
                {!isCurrentPlan && <Plus className="h-4 w-4" />}
                {subscriptionLoading ? 'Loading...' : isCurrentPlan ? 'Active' : (plan.isPremium ? 'Request Quotation' : 'Subscribe')}
              </button>
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="glass-surface rounded-xl p-6 mt-8 border border-gray-200/70">
        <div style={{ display: 'flex', gap: '12px' }}>
          <Zap className="h-5 w-5 text-blue-600 flexShrink-0" style={{ marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
              Need a custom solution?
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              Contact our sales team to discuss enterprise plans, custom features, and volume discounts tailored to your organization's needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
