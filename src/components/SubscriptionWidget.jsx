import React, { useState, useEffect } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import subscriptionAPI from '../api/subscription';
import MobileMoneyPendingModal from './payments/MobileMoneyPendingModal';
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  TrendingUp,
  Edit2,
  Plus,
  X,
} from 'lucide-react';

const SubscriptionWidget = ({ userId }) => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const subscriptionLookupName = storedUser?.companyName || storedUser?.company?.name || storedUser?.company || userId;
  const { subscription, loading, isActive, isProfessional, isEnterprise, userRole, canUpdate, refresh } = useSubscription(subscriptionLookupName);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  
  // Form state
  const [plan, setPlan] = useState('basic');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [provider, setProvider] = useState('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStep, setPaymentStep] = useState('details');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [properties, setProperties] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [pendingPaymentModal, setPendingPaymentModal] = useState({
    open: false,
    paymentId: '',
    requestTransactionId: '',
    transactionId: '',
    message: '',
    amount: 0,
    subscriptionId: '',
  });

  const handleOpenCreateModal = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = () => {
    setModalMode('edit');
    setPlan(subscription.plan);
    setBillingCycle(subscription.billingCycle);
    setEmail(subscription.email);
    setPaymentMethod(subscription.paymentMethod === 'intouchpay' ? 'mobile_money' : (subscription.paymentMethod || 'card'));
    setProvider(subscription.metadata?.provider || 'mtn');
    setPhoneNumber('');
    setSelectedPropertyId(subscription.propertyId || '');
    setError(null);
    setPaymentStep('details');
    setShowModal(true);
  };

  const resetForm = () => {
    setPlan('basic');
    setBillingCycle('monthly');
    setEmail('');
    setPaymentMethod('card');
    setProvider('mtn');
    setPhoneNumber('');
    setSelectedPropertyId('');
    setError(null);
    setPaymentStep('details');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(null);
    setCreating(false);
    setPaymentStep('details');
  };

  const closePendingPaymentModal = () => {
    setPendingPaymentModal((prev) => ({ ...prev, open: false }));
  };

  // Fetch properties and pricing on mount
  useEffect(() => {
    const fetchPropertiesAndPricing = async () => {
      try {
        // Fetch properties for the user
        const propertiesRes = await subscriptionAPI.getPropertiesForUser(userId);
        const propertiesData = Array.isArray(propertiesRes) ? propertiesRes : (propertiesRes?.data || []);
        setProperties(propertiesData || []);

        // Fetch pricing
        const pricingRes = await subscriptionAPI.getPricing();
        const pricingData = pricingRes?.data?.pricing || pricingRes?.data || pricingRes || null;
        setPricing(pricingData);
        setCurrency(pricingRes?.data?.currency || 'USD');
      } catch (err) {
        console.error('Failed to fetch properties or pricing:', err);
      }
    };
    
    if (userId) {
      fetchPropertiesAndPricing();
    }
  }, [userId]);

  const handleCreateSubscription = async () => {
    setCreating(true);
    setError(null);
    try {
      // Validate required fields for new subscription
      if (!selectedPropertyId) {
        throw new Error('Please select a property');
      }

      if (!email) {
        throw new Error('Email is required');
      }

      // Create subscription
      const subResp = await subscriptionAPI.createSubscription(
        userId,
        email,
        plan,
        billingCycle,
        paymentMethod,
        { propertyId: selectedPropertyId }
      );

      if (!subResp.data || !subResp.data.id) {
        throw new Error('Failed to create subscription');
      }

      const subscriptionId = subResp.data.id;
      const amount = subResp.data.amount;

      // Handle payment if needed
      if (paymentMethod === 'mobile_money' || paymentMethod === 'card') {
        setPaymentStep('processing');

        if (paymentMethod === 'mobile_money') {
          const mobileMoneyResp = await subscriptionAPI.initiateMobileMoneyPayment(
            subscriptionId,
            amount,
            provider,
            phoneNumber || undefined,
            currency,
            email,
            storedUser?.id || storedUser?._id || null
          );
          const createdPayment = mobileMoneyResp?.data || {};
          const immediateFailureMessage =
            createdPayment?.status === 'failed'
              ? createdPayment?.failureReason || createdPayment?.metadata?.intouchpayMessage || 'Mobile money payment was rejected by the gateway.'
              : null;

          if (immediateFailureMessage) {
            setPaymentStep('details');
            setError(immediateFailureMessage);
            return;
          }

          const requestTransactionId = createdPayment?.metadata?.requestTransactionId || createdPayment?.transactionId || '';
          const transactionId = createdPayment?.metadata?.intouchpayTransactionId || '';
          setShowModal(false);
          setPendingPaymentModal({
            open: true,
            paymentId: createdPayment.id || '',
            requestTransactionId,
            transactionId,
            message:
              createdPayment?.metadata?.intouchpayMessage ||
              createdPayment?.message ||
              'Approve the payment request on your phone. We will refresh the subscription automatically.',
            amount,
            subscriptionId,
          });
        } else {
          const paymentResp = await subscriptionAPI.initiatePesaPalPayment(
            subscriptionId,
            amount,
            null,
            email
          );

          if (paymentResp.redirectUrl) {
            window.location.href = paymentResp.redirectUrl;
          } else {
            setPaymentStep('details');
            setError('Payment initiated but redirect URL not provided. Please contact support.');
          }
        }
      } else {
        // For test payments, reload
        window.location.reload();
      }
    } catch (err) {
      console.error('Create subscription error:', err);
      
      if (err.status === 403) {
        setError('You do not have permission to create a subscription. Please contact support.');
      } else if (err.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(err.error || err.message || 'Failed to create subscription');
      }
      setPaymentStep('details');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateSubscription = async () => {
    setCreating(true);
    setError(null);
    
    try {
      const updateData = {
        plan,
        billingCycle,
        email,
        paymentMethod,
      };

      // Update subscription - user can update their own subscription
      const response = await subscriptionAPI.updateMySubscription(
        subscription.id,
        updateData
      );
      
      // Show success message
      setError(null);
      setPaymentStep('success');
      
      // Reload after short delay to show success
        // Refresh subscription data and close modal after short delay
        setTimeout(() => {
          try {
            refresh();
          } catch (e) {
            console.warn('Refresh failed, falling back to full reload', e);
            window.location.reload();
          }
          setShowModal(false);
        }, 800);
      
    } catch (err) {
      console.error('Update subscription error:', err);
      
      // Enhanced error handling
      if (err.status === 403) {
        setError('Unable to update subscription. Please verify you are the owner of this subscription.');
      } else if (err.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.status === 404) {
        setError('Subscription not found. It may have been deleted.');
      } else {
        setError(err.error || err.message || 'Failed to update subscription');
      }
    } finally {
      setCreating(false);
    }
  };

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

  // No subscription view
  if (!subscription) {
    return (
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">No Active Subscription</h3>
            <p className="text-blue-700 text-sm mt-1">
              Create a subscription to unlock premium features and support.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            onClick={handleOpenCreateModal}
            disabled={creating}
          >
            Create Subscription
          </button>
        </div>

        {/* Subscription Modal */}
        {showModal && (
          <SubscriptionModal
            mode={modalMode}
            onClose={handleCloseModal}
            onSubmit={modalMode === 'create' ? handleCreateSubscription : handleUpdateSubscription}
            formData={{
              plan,
              billingCycle,
              email,
              paymentMethod,
              provider,
              phoneNumber,
              selectedPropertyId,
              properties,
              pricing
            }}
            setFormData={{
              setPlan,
              setBillingCycle,
              setEmail,
              setPaymentMethod,
              setProvider,
              setPhoneNumber,
              setSelectedPropertyId
            }}
            creating={creating}
            error={error}
            paymentStep={paymentStep}
          />
        )}

        <MobileMoneyPendingModal
          open={pendingPaymentModal.open}
          paymentId={pendingPaymentModal.paymentId}
          requestTransactionId={pendingPaymentModal.requestTransactionId}
          transactionId={pendingPaymentModal.transactionId}
          provider={provider}
          phoneNumber={phoneNumber}
          amount={pendingPaymentModal.amount}
          currency={currency}
          planName={plan}
          initialMessage={pendingPaymentModal.message}
          onClose={closePendingPaymentModal}
          onSuccess={async () => {
            setError(null);
            await refresh();
            closePendingPaymentModal();
          }}
        />
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

  const formatMoney = (amount) => {
    const numericAmount = Number(amount || 0);
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(numericAmount);
    } catch (err) {
      return `${currency} ${numericAmount.toFixed(2)}`;
    }
  };

  return (
    <>
      <div className={`rounded-lg border p-4 ${getPlanColor()}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">{getPlanIcon()}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
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

              {subscription.property && (
                <p className="text-gray-600 text-xs mt-1">
                  Property: <span className="font-medium text-gray-800">{subscription.property.name}</span>
                </p>
              )}

              <p className="text-gray-600 text-xs mt-1">
                {subscription.billingCycle?.charAt(0).toUpperCase() + subscription.billingCycle?.slice(1)} cycle - {formatMoney(subscription.amount)}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 flex-wrap">
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
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition"
              title="Edit Plan or Billing Cycle"
            >
              <Edit2 size={16} />
              Edit
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-medium transition"
              title="Add New Subscription for Another Property"
            >
              <Plus size={16} />
              New
            </button>
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

      {/* Subscription Modal */}
      {showModal && (
        <SubscriptionModal
          mode={modalMode}
          onClose={handleCloseModal}
          onSubmit={modalMode === 'create' ? handleCreateSubscription : handleUpdateSubscription}
          formData={{
            plan,
            billingCycle,
            email,
            paymentMethod,
            provider,
            phoneNumber,
            selectedPropertyId,
            properties,
            pricing,
            currentSubscription: subscription
          }}
          setFormData={{
            setPlan,
            setBillingCycle,
            setEmail,
            setPaymentMethod,
            setProvider,
            setPhoneNumber,
            setSelectedPropertyId
          }}
          creating={creating}
          error={error}
          paymentStep={paymentStep}
        />
      )}

      <MobileMoneyPendingModal
        open={pendingPaymentModal.open}
        paymentId={pendingPaymentModal.paymentId}
        requestTransactionId={pendingPaymentModal.requestTransactionId}
        transactionId={pendingPaymentModal.transactionId}
        provider={provider}
        phoneNumber={phoneNumber}
        amount={pendingPaymentModal.amount}
        currency={currency}
        planName={plan}
        initialMessage={pendingPaymentModal.message}
        onClose={closePendingPaymentModal}
        onSuccess={async () => {
          setError(null);
          await refresh();
          closePendingPaymentModal();
        }}
      />
    </>
  );
};

// Modal Component
const SubscriptionModal = ({ 
  mode, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  creating, 
  error, 
  paymentStep
}) => {
  const {
    plan,
    billingCycle,
    email,
    paymentMethod,
    provider,
    phoneNumber,
    selectedPropertyId,
    properties,
    pricing,
  } = formData;

  const {
    setPlan,
    setBillingCycle,
    setEmail,
    setPaymentMethod,
    setProvider,
    setPhoneNumber,
    setSelectedPropertyId
  } = setFormData;

  // Close modal when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !creating) {
      onClose();
    }
  };

  // Get price display based on selected plan and billing cycle
  const getPriceDisplay = () => {
    if (!pricing) return '';
    
    const planPricing = pricing[plan];
    if (!planPricing) return '';
    
    const cyclePrice = planPricing[billingCycle];
    if (!cyclePrice) return '';
    
    return `${formatMoney(cyclePrice)}/${billingCycle}`;
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === 'create' ? 'Create New Subscription' : 'Edit Subscription'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
            disabled={creating}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4">
          {mode === 'edit' && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <p className="text-blue-700 text-sm font-medium">
                Editing your subscription. Changes will take effect on your next billing date.
              </p>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200 mb-4">
              <p className="font-medium mb-1">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {paymentStep === 'details' && (
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={creating}
                />
              </div>

              {/* Property Selection - required for create, optional for edit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property {mode === 'create' && <span className="text-red-500">*</span>}
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  value={selectedPropertyId}
                  onChange={e => setSelectedPropertyId(e.target.value)}
                  required={mode === 'create'}
                  disabled={creating}
                >
                  <option value="">Select a property...</option>
                  {properties.map(prop => (
                    <option key={prop.id} value={prop.id}>{prop.name}</option>
                  ))}
                </select>
              </div>

              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  value={plan}
                  onChange={e => setPlan(e.target.value)}
                  disabled={creating}
                >
                  <option value="basic">Basic {pricing?.basic && `- ${formatMoney(pricing.basic.monthly)}/month`}</option>
                  <option value="professional">Professional {pricing?.professional && `- ${formatMoney(pricing.professional.monthly)}/month`}</option>
                  <option value="enterprise">Enterprise {pricing?.enterprise && `- ${formatMoney(pricing.enterprise.monthly)}/month`}</option>
                </select>
              </div>

              {/* Billing Cycle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Cycle <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  value={billingCycle}
                  onChange={e => setBillingCycle(e.target.value)}
                  disabled={creating}
                >
                  <option value="weekly">Weekly {pricing?.[plan]?.weekly && `(${formatMoney(pricing[plan].weekly)}/week)`}</option>
                  <option value="monthly">Monthly {pricing?.[plan]?.monthly && `(${formatMoney(pricing[plan].monthly)}/month)`}</option>
                  <option value="yearly">Yearly {pricing?.[plan]?.yearly && `(${formatMoney(pricing[plan].yearly)}/year - Save 20%)`}</option>
                </select>
              </div>

              {/* Price Summary */}
              {pricing && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Price summary:</p>
                  <p className="text-lg font-semibold text-gray-900">{getPriceDisplay()}</p>
                  {billingCycle === 'yearly' && (
                    <p className="text-xs text-green-600 mt-1">You save 20% with yearly billing!</p>
                  )}
                </div>
              )}

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  disabled={creating}
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>

              {/* Phone Number - Only for mobile money */}
              {paymentMethod === 'mobile_money' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provider <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      value={provider}
                      onChange={e => setProvider(e.target.value)}
                      disabled={creating}
                    >
                      <option value="mtn">MTN Rwanda</option>
                      <option value="airtel">Airtel Rwanda</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="+250 7XX XXX XXX"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      required
                      disabled={creating}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the phone number that will approve the InTouchPay request.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin inline-block mb-3">
                <CreditCard className="text-blue-600" size={40} />
              </div>
              <p className="text-gray-700 font-medium">Processing payment...</p>
              <p className="text-gray-500 text-sm mt-2">
                Please wait while we process your payment.
              </p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center py-8">
              <div className="inline-block mb-3 text-green-500">
                <CheckCircle size={40} />
              </div>
              <p className="text-gray-700 font-medium">Update Successful!</p>
              <p className="text-gray-500 text-sm mt-2">
                Your subscription has been updated. Refreshing...
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            onClick={onClose}
            disabled={creating}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'create' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={onSubmit}
            disabled={
              creating ||
              !email ||
              (paymentMethod === 'mobile_money' && !phoneNumber) ||
              (mode === 'create' && !selectedPropertyId)
            }
          >
            {creating ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Processing...
              </span>
            ) : mode === 'create' ? 'Create Subscription' : 'Update Subscription'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionWidget;
