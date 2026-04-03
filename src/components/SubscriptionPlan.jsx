import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import subscriptionAPI from '../api/subscription';
import {
  Check,
  Download,
  AlertCircle,
  Loader,
  ChevronRight,
  Smartphone,
  CreditCard,
  Building2,
  Lock,
} from 'lucide-react';

const SubscriptionPlan = ({ userId }) => {
  const { subscription, loading, refresh } = useSubscription(userId);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [pricing, setPricing] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  
  // Initialize billing cycle from URL param if present
  const [billingCycle, setBillingCycle] = useState(() => {
    const cycle = searchParams.get('cycle');
    return (cycle === 'yearly' || cycle === 'annually') ? 'yearly' : 'monthly';
  });
  
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currency, setCurrency] = useState('USD');

  const currencySymbols = {
    'USD': '$',
    'RWF': 'FRw'
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'For small teams just starting with maintenance management',
      features: [
        'Dashboard',
        'Basic Reporting',
        'Email Support',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Growing teams ready to move from reactive to preventive maintenance',
      features: [
        'Dashboard',
        'Advanced Reporting',
        'Priority Support',
        'Basic API Access',
        'Company Branding',
      ],
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Departments managing multiple asset types with field mobility',
      features: [
        'All Premium Features',
        'Full API Access',
        'Custom Integrations',
        'Advanced Analytics',
        'Account Manager',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Multi-site organizations needing automation and governance',
      features: [
        'All Professional Features',
        'Dedicated Support',
        'Custom Solutions',
        'Training & Onboarding',
        'SLA Guarantee',
        'Multiple Properties',
      ],
    },
  ];

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await subscriptionAPI.getPricing();
        const pricingData = response?.data?.pricing || response?.data || response;
        setPricing(pricingData);
        // Fetch currency from system settings
        const currencyValue = response?.data?.currency || response?.currency || 'USD';
        setCurrency(currencyValue);
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
      }
    };

    fetchPricing();
  }, []);

  useEffect(() => {
    if (activeTab === 'invoices' && subscription?.id) {
      fetchInvoices();
    }
  }, [activeTab, subscription?.id]);

  const fetchInvoices = async () => {
    if (!subscription?.id) return;
    setLoadingInvoices(true);
    try {
      const response = await subscriptionAPI.getSubscriptionInvoices(subscription.id);
      setInvoices(Array.isArray(response.data) ? response.data : response.data?.invoices || []);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const blob = await subscriptionAPI.downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download invoice');
      console.error('Download error:', err);
    }
  };

  const handlePayNow = async () => {
    if (!subscription) return;
    
    // Navigate to payment selection to choose payment method
    const cycle = subscription.billingCycle || billingCycle;
    const amount = pricing?.[subscription.plan]?.[cycle];
    
    if (!amount) {
      setError(`Could not determine price for ${subscription.plan} (${cycle})`);
      return;
    }

    navigate(`/payment-selection?subscriptionId=${subscription.id || subscription._id}&plan=${subscription.plan}&cycle=${cycle}&amount=${amount}&currency=${currency}&email=${subscription.email || ''}`);
  };

  const handleUpgrade = async (newPlanId) => {
    // If user has a subscription already and clicks their current plan
    if (subscription && newPlanId === subscription.plan) {
      alert('You are already on this plan');
      return;
    }

    // Determine if this is an upgrade or a new subscription
    const isUpgrade = !!subscription;
    const actionName = isUpgrade ? 'Upgrade to' : 'Select';
    const confirmMsg = `${actionName} ${newPlanId.charAt(0).toUpperCase() + newPlanId.slice(1)} plan?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setUpgrading(true);
    setError(null);
    setSuccess(null);

    try {
      let subData;
      if (isUpgrade) {
        // Handle existing subscription upgrade
        const resp = await subscriptionAPI.upgradeSubscription(subscription.id, newPlanId);
        subData = resp.data || resp;
      } else {
        // Handle initial subscription creation
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userEmail = storedUser?.email || '';
        
        const resp = await subscriptionAPI.createSubscription(
          userId, 
          userEmail, 
          newPlanId, 
          billingCycle
        );
        subData = resp.data || resp;
      }

      // Navigate to payment selection with subscription details
      if (subData && (subData.id || subData._id)) {
        const subId = subData.id || subData._id;
        const amount = getPrice(newPlanId);

        if (amount) {
          setSuccess(`${isUpgrade ? 'Upgrade' : 'Subscription'} created successfully! Please complete the payment...`);
          setTimeout(() => {
            navigate(`/payment-selection?subscriptionId=${subId}&plan=${newPlanId}&cycle=${billingCycle}&amount=${amount}&currency=${currency}&email=${subData.email || ''}`);
          }, 500);
        }
      }
    } catch (err) {
      setError(err.error || err.message || 'Failed to process subscription');
      setUpgrading(false);
    }
  };

  const getPrice = (planId) => {
    if (!pricing) return null;
    return pricing[planId]?.[billingCycle];
  };

  const currentPlan = subscription?.plan || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader className="animate-spin inline-block text-blue-600 mb-3" size={40} />
          <p className="text-gray-600">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between gap-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`border-b-2 pb-4 pt-6 text-sm font-medium transition ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`border-b-2 pb-4 pt-6 text-sm font-medium transition ${
                  activeTab === 'invoices'
                    ? 'border-blue-600 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Invoices
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 border border-green-200 flex gap-3">
            <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-green-900">Success</h3>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* Current Subscription Info */}
            {subscription && (
              <div className="mb-8 rounded-lg bg-blue-50 p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-blue-900">Current Subscription</h3>
                  <button
                    onClick={() => {
                      const cycle = subscription.billingCycle || billingCycle;
                      const amount = pricing?.[subscription.plan]?.[cycle];
                      navigate(`/payment-selection?subscriptionId=${subscription.id || subscription._id}&plan=${subscription.plan}&cycle=${cycle}&amount=${amount}&currency=${currency}&email=${subscription.email || ''}`);
                    }}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    Change Payment Method
                  </button>
                </div>
                <p className="text-blue-700 text-sm">
                  You're currently on the <strong>{subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}</strong> plan.
                  {subscription.nextBillingDate && (
                    <> Next billing date: <strong>{new Date(subscription.nextBillingDate).toLocaleDateString()}</strong></>
                  )}
                </p>

                {/* Payment Method Display */}
                {subscription.paymentMethod && (
                  <div className="mt-3 text-sm text-blue-700">
                    <span>Payment Method: <strong>
                      {subscription.paymentMethod === 'mobile_money' ? '📱 Mobile Money' : 
                       subscription.paymentMethod === 'pesapal' ? '💳 PesaPal (Card)' : 
                       subscription.paymentMethod}
                    </strong></span>
                    {subscription.paymentMethod === 'mobile_money' && subscription.metadata?.provider && (
                      <div className="mt-1 text-xs text-blue-600">
                        Provider: <strong>{subscription.metadata.provider.toUpperCase()}</strong>
                      </div>
                    )}
                  </div>
                )}

                {(subscription.status === 'pending' || subscription.paymentStatus === 'pending') && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                      <div className="flex gap-3">
                        <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                        <div>
                          <h4 className="font-semibold text-yellow-800">Payment Required</h4>
                          <p className="text-yellow-700 text-sm mb-2">Your subscription is pending payment. Complete it now to activate all features.</p>
                          <div className="flex items-center gap-3 text-xs text-yellow-600 font-medium">
                            <span className="flex items-center gap-1"><Smartphone size={14} /> MoMo</span>
                            <span className="flex items-center gap-1"><CreditCard size={14} /> Cards</span>
                            <span className="flex items-center gap-1"><Building2 size={14} /> Bank</span>
                          </div>
                        </div>
                      </div>
                    <button
                      onClick={() => handlePayNow()}
                      disabled={upgrading}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {upgrading ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Billing Cycle Toggle */}
            <div className="mb-8 flex items-center justify-center gap-4">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-600'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition"
                style={{ backgroundColor: billingCycle === 'yearly' ? '#3b82f6' : '#d1d5db' }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition"
                  style={{ marginLeft: billingCycle === 'yearly' ? '20px' : '2px' }}
                />
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-600'}`}>
                Annually
              </span>
              {billingCycle === 'yearly' && (
                <span className="inline-block ml-2 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                  Save 15%
                </span>
              )}
            </div>

            {/* Pricing Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const price = getPrice(plan.id);
                const isCurrentPlan = currentPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-lg border transition-all ${
                      isCurrentPlan
                        ? 'border-blue-600 ring-2 ring-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="p-6">
                      {/* Plan Name */}
                      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mt-2">{plan.description}</p>

                      {/* Price */}
                      {price !== null ? (
                        <div className="mt-4 mb-6">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-gray-900">{currencySymbols[currency] || '$'}{price.toFixed(2)}</span>
                            <span className="text-gray-600 text-sm">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                          </div>
                          {billingCycle === 'yearly' && (
                            <p className="text-green-600 text-xs mt-1">Billed annually • {(price / 12).toFixed(0)} RWF/month</p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-4 mb-6 h-8 bg-gray-200 animate-pulse rounded"></div>
                      )}

                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Button */}
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isCurrentPlan || upgrading}
                        className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                          isCurrentPlan
                            ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95'
                        }`}
                      >
                        {upgrading ? (
                          <>
                            <Loader size={14} className="animate-spin" />
                            {subscription ? 'Upgrading...' : 'Processing...'}
                          </>
                        ) : isCurrentPlan ? (
                          'Current Plan'
                        ) : subscription === null ? (
                          'Select Plan'
                        ) : (
                          <>
                            Upgrade
                            <ChevronRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Supported Payment Methods Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Secure Payment Options via PesaPal</p>
                <div className="flex flex-wrap justify-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-gray-50 rounded-full border border-gray-100">
                      <Smartphone className="text-yellow-600" size={24} />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Mobile Money</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-gray-50 rounded-full border border-gray-100">
                      <CreditCard className="text-blue-600" size={24} />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Visa / Mastercard</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-gray-50 rounded-full border border-gray-100">
                      <Building2 className="text-green-600" size={24} />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Bank Transfer</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-gray-400 text-xs text-center">
                  <Lock size={12} />
                  <span>Secure 256-bit SSL Encrypted Payment Portal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div>
            {loadingInvoices ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-blue-600" size={32} />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-sm">No invoices yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-white">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Issue Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Balance</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice, idx) => (
                      <tr key={invoice.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{invoice.invoiceNumber || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1) || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {invoice.issuedDate ? new Date(invoice.issuedDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {invoice.amount ? `${invoice.amount.toFixed(0)} RWF` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {invoice.balance !== undefined ? `${invoice.balance.toFixed(0)} RWF` : '$0.00'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                            title="Download invoice"
                          >
                            <Download size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlan;
