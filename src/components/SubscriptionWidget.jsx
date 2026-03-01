import React, { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import subscriptionAPI from '../api/subscription';
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

const SubscriptionWidget = ({ userId }) => {
  const { subscription, loading, isActive, isProfessional, isEnterprise } = useSubscription(userId);

  // local state for creation form (always declared to satisfy hooks rules)
  const [showForm, setShowForm] = useState(false);
  const [plan, setPlan] = useState('basic');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStep, setPaymentStep] = useState('details'); // 'details', 'payment', 'processing'

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 h-48 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block">
            <CreditCard className="text-blue-600" size={32} />
          </div>
          <p className="text-gray-600 mt-2 text-sm">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    const createSub = async () => {
      setCreating(true);
      setError(null);
      try {
        // Step 1: Create subscription
        const subResp = await subscriptionAPI.createSubscription(
          userId,
          email || '',
          plan,
          billingCycle,
          paymentMethod
        );

        if (!subResp.data || !subResp.data.id) {
          throw new Error('Failed to create subscription');
        }

        const subscriptionId = subResp.data.id;
        const amount = subResp.data.amount;

        // Step 2: If payment method is PayPack (mobile money or card), initiate payment
        if (paymentMethod === 'mobile_money' || paymentMethod === 'card') {
          setPaymentStep('processing');

          const paymentResp = await subscriptionAPI.initiatePayPackPayment(
            subscriptionId,
            amount,
            paymentMethod,
            phoneNumber || undefined,
            email
          );

          // Step 3: If PayPack provided redirect URL, redirect user
          if (paymentResp.redirectUrl) {
            window.location.href = paymentResp.redirectUrl;
          } else {
            setPaymentStep('details');
            setError('Payment initiated but redirect URL not provided. Please contact support.');
          }
        } else {
          // For test/simulated payments, reload
          window.location.reload();
        }
      } catch (err) {
        setError(err.error || err.message || 'Failed to create subscription');
        setPaymentStep('details');
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900">No Active Subscription</h3>
            <p className="text-blue-700 text-sm mt-1">
              Create a subscription to unlock premium features and support.
            </p>
          </div>
        </div>
        <div className="mt-4">
          {!showForm ? (
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => setShowForm(true)}
            >
              Create Subscription
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                  {error}
                </div>
              )}

              {paymentStep === 'details' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Plan</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={plan}
                      onChange={e => setPlan(e.target.value)}
                    >
                      <option value="basic">Basic ($9.99/week, $29.99/month, $299.99/year)</option>
                      <option value="professional">Professional ($24.99/week, $79.99/month, $799.99/year)</option>
                      <option value="enterprise">Enterprise ($49.99/week, $199.99/month, $1999.99/year)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Billing Cycle</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={billingCycle}
                      onChange={e => setBillingCycle(e.target.value)}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Payment Method</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="mobile_money">Mobile Money</option>
                    </select>
                  </div>

                  {paymentMethod === 'mobile_money' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="+250 7XX XXX XXX"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter your mobile money phone number (e.g., +250 7XX XXX XXX)</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium disabled:opacity-50"
                      onClick={createSub}
                      disabled={creating || !email || (paymentMethod === 'mobile_money' && !phoneNumber)}
                    >
                      {creating ? 'Processing…' : 'Continue to Payment'}
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-200 rounded text-sm"
                      onClick={() => {
                        setShowForm(false);
                        setPaymentStep('details');
                        setError(null);
                      }}
                      disabled={creating}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {paymentStep === 'processing' && (
                <div className="text-center py-4">
                  <div className="animate-spin inline-block">
                    <CreditCard className="text-blue-600" size={32} />
                  </div>
                  <p className="text-gray-700 mt-2 text-sm">Processing payment...</p>
                  <p className="text-gray-500 text-xs mt-1">You will be redirected to PayPack to complete payment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const nextBillingDate = new Date(subscription.nextBillingDate);
  const daysUntilNextBilling = Math.ceil(
    (nextBillingDate - new Date()) / (1000 * 60 * 60 * 24)
  );

  const getPlanIcon = () => {
    if (isEnterprise) return <Shield className="text-red-500" size={20} />;
    if (isProfessional) return <TrendingUp className="text-purple-500" size={20} />;
    return <Zap className="text-blue-500" size={20} />;
  };

  const getPlanColor = () => {
    if (isEnterprise) return 'bg-red-50 border-red-200';
    if (isProfessional) return 'bg-purple-50 border-purple-200';
    return 'bg-blue-50 border-blue-200';
  };

  return (
    <div className={`rounded-lg border p-4 ${getPlanColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1">{getPlanIcon()}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {subscription.plan?.charAt(0).toUpperCase() + subscription.plan?.slice(1)} Plan
              </h3>
              {isActive && (
                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                  <CheckCircle size={14} />
                  Active
                </span>
              )}
            </div>
            <p className="text-gray-700 text-sm mt-1">
              {subscription.email}
            </p>
            <p className="text-gray-600 text-xs mt-1">
              {subscription.billingCycle?.charAt(0).toUpperCase() + subscription.billingCycle?.slice(1)} cycle - ${subscription.amount?.toFixed(2)}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                Started: {new Date(subscription.startDate).toLocaleDateString()}
              </span>
              {daysUntilNextBilling > 0 && (
                <span className="flex items-center gap-1">
                  <Zap size={14} />
                  Next billing in {daysUntilNextBilling} days
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {subscription.features && subscription.features.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-300 border-opacity-30">
          <p className="text-xs font-semibold text-gray-700 mb-2">Features included:</p>
          <div className="grid grid-cols-1 gap-1">
            {subscription.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                <CheckCircle size={12} />
                {feature}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionWidget;
