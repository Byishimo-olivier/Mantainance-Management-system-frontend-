import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AuthHeader from './auth/AuthHeader';
import api from '../api/axios';
import subscriptionAPI from '../api/subscription';
import MobileMoneyPendingModal from './payments/MobileMoneyPendingModal';
import { Smartphone, CreditCard, Building2, AlertCircle, Loader } from 'lucide-react';

export default function PaymentSelection() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [systemCurrency, setSystemCurrency] = useState('USD');
  const [pendingPaymentModal, setPendingPaymentModal] = useState({
    open: false,
    paymentId: '',
    requestTransactionId: '',
    transactionId: '',
    message: '',
  });

  // Extract parameters from URL
  const plan = searchParams.get('plan') || 'basic';
  const cycle = searchParams.get('cycle') || 'monthly';
  const currency = searchParams.get('currency') || systemCurrency;
  const companyName = searchParams.get('companyName') || '';
  const managerEmail = searchParams.get('email') || '';
  const companyPhone = searchParams.get('phone') || '';
  const subscriptionId = searchParams.get('subscriptionId');
  const amount = searchParams.get('amount') || '0';
  const employees = Math.max(1, Math.ceil(Number(searchParams.get('employees') || '2')));
  const includedEmployees = Math.max(1, Math.ceil(Number(searchParams.get('includedEmployees') || '2')));
  const extraEmployees = Math.max(0, employees - includedEmployees);
  const extraEmployeeAmount = Number(searchParams.get('extraEmployeeAmount') || 0);
  const seatUpgradeOnly = searchParams.get('seatUpgradeOnly') === 'true';
  const targetEmployeeLimit = Math.max(employees, Math.ceil(Number(searchParams.get('targetEmployeeLimit') || employees)));
  const pendingInvites = (() => {
    try {
      const raw = searchParams.get('pendingInvites');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  const paymentMethod = searchParams.get('paymentMethod') || 'card';
  const provider = searchParams.get('provider') || 'mtn';

  const closePendingPaymentModal = () => {
    setPendingPaymentModal((prev) => ({ ...prev, open: false }));
  };

  // Fetch system currency on mount
  useEffect(() => {
    const fetchSystemCurrency = async () => {
      try {
        const response = await subscriptionAPI.getPricing();
        const curr = response?.data?.currency || response?.currency || 'USD';
        setSystemCurrency(curr);
      } catch (err) {
        console.error('Failed to fetch system currency:', err);
        setSystemCurrency('USD');
      }
    };

    fetchSystemCurrency();
  }, []);

  const handleProcessPayment = async () => {
    try {
      setError(null);
      setProcessing(true);

      // Get user info from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const email = managerEmail || user.email || '';
      const company = companyName || user.companyName || user.company || 'Unknown';
      const userId = user.id || user._id;
      let finalAmount = parseFloat(amount);

      console.log('Payment details:', { plan, cycle, currency, finalAmount, amount });

      if (!finalAmount || finalAmount <= 0 || isNaN(finalAmount)) {
        setError('Invalid amount. Please go back and select a plan.');
        setProcessing(false);
        return;
      }

      if (!plan || !cycle) {
        setError('Missing plan or billing cycle. Please go back and select a plan.');
        setProcessing(false);
        return;
      }
      if (paymentMethod === 'mobile_money' && String(currency || '').toUpperCase() !== 'RWF') {
        setError('MTN Rwanda mobile money supports RWF only. Switch the subscription currency to RWF or use card payment.');
        setProcessing(false);
        return;
      }

      const subscriptionMetadata = {
        companyName: company,
        phone: companyPhone || user.phone || user.phoneNumber || '',
        branchLocation: user.branchLocation || '',
        branchName: user.branchName || '',
        branchDetails: user.branchDetails || '',
        companyType: user.companyType || '',
        countryCode: user.countryCode || '',
        employeeCount: employees,
        employeeLimit: employees,
        maxUsers: employees,
        includedEmployees,
        extraEmployees,
        extraEmployeeAmount,
        seatUpgradeOnly,
        targetEmployeeLimit,
        pendingSeatInvites: pendingInvites,
        invitedByUserId: userId,
      };

      // If no subscriptionId, create a subscription first
      let subId = subscriptionId;
      if (!subId) {
        try {
          const createSubResponse = await subscriptionAPI.createSubscription(
            userId,
            email,
            plan,
            cycle,
            paymentMethod === 'mobile_money' ? 'mobile_money' : 'card',
            subscriptionMetadata
          );
          const createdSubscription = createSubResponse?.data || createSubResponse;
          subId = createdSubscription?.id || createdSubscription?._id;
          if (Number(createdSubscription?.amount) > 0) {
            finalAmount = Number(createdSubscription.amount);
          }
          console.log('Subscription created:', subId);
          
          if (!subId) {
            setError('Failed to create subscription. Please try again.');
            setProcessing(false);
            return;
          }
        } catch (subErr) {
          console.error('Subscription creation error:', subErr.response?.data || subErr.message);
          setError('Failed to create subscription: ' + (subErr.response?.data?.error || subErr.message));
          setProcessing(false);
          return;
        }
      }

      const paymentData = {
        subscriptionId: subId,
        amount: finalAmount,
        currency,
        email,
        companyName: company,
        phoneNumber: companyPhone,
        plan,
        cycle,
      };

      console.log('Sending payment request:', { ...paymentData, paymentMethod, provider });

      if (paymentMethod === 'mobile_money') {
        const paymentResponse = await api.post('/api/subscriptions/payments/initiate-mobile-money', {
          ...paymentData,
          provider,
        });
        const createdPayment = paymentResponse?.data?.data || {};
        const immediateFailureMessage =
          createdPayment?.status === 'failed'
            ? createdPayment?.failureReason || createdPayment?.metadata?.intouchpayMessage || 'Mobile money payment was rejected by the gateway.'
            : null;

        if (immediateFailureMessage) {
          setError(immediateFailureMessage);
          return;
        }

        const requestTransactionId = createdPayment?.metadata?.requestTransactionId || createdPayment?.transactionId || '';
        const transactionId = createdPayment?.metadata?.intouchpayTransactionId || '';
        setPendingPaymentModal({
          open: true,
          paymentId: createdPayment.id || '',
          requestTransactionId,
          transactionId,
          message:
            createdPayment?.metadata?.intouchpayMessage ||
            createdPayment?.message ||
            'Approve the mobile money request on your phone. We will update the subscription here automatically.',
        });
      } else {
        const paymentResponse = await api.post(
          '/api/subscriptions/payments/initiate-pesapal',
          paymentData
        );

        if (paymentResponse.data?.redirectUrl) {
          window.location.href = paymentResponse.data.redirectUrl;
        } else {
          setError('Failed to get payment redirect. Please try again.');
        }
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-selection-page">
        <AuthHeader />
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Loader className="animate-spin inline-block text-blue-600 mb-3" size={40} />
          <h2>Loading payment options...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-selection-page">
      <AuthHeader />

      <section style={{ padding: '60px 20px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Choose Payment Method</h1>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Select how you'd like to pay for your {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <AlertCircle size={20} style={{ color: '#c33', marginTop: '2px', flexShrink: 0 }} />
            <div style={{ color: '#c33' }}>{error}</div>
          </div>
        )}

        {/* Payment Method Info - Let PesaPal handle the selection */}
        <div style={{ marginBottom: '30px', backgroundColor: '#f0f7ff', padding: '20px', borderRadius: '8px', border: '1px solid #b3d9f2' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ color: '#0066cc', marginTop: '2px', fontSize: '20px' }}>ℹ️</div>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#0066cc' }}>Flexible Payment Options</h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                Card payments continue through PesaPal, while mobile money collections are sent through InTouchPay using the phone number on the subscription:
              </p>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
                <li>Mobile Money via InTouchPay (MTN Rwanda, Airtel Rwanda)</li>
                <li>Credit/Debit Cards via PesaPal</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '30px', display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div style={{
            border: paymentMethod === 'card' ? '2px solid #2563eb' : '1px solid #d1d5db',
            borderRadius: '14px',
            padding: '18px',
            background: paymentMethod === 'card' ? '#eff6ff' : '#fff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <CreditCard size={20} style={{ color: '#2563eb' }} />
              <strong>Card Payment</strong>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
              Pay with Visa, Mastercard, or another supported card provider.
            </p>
          </div>
          <div style={{
            border: paymentMethod === 'mobile_money' ? '2px solid #2563eb' : '1px solid #d1d5db',
            borderRadius: '14px',
            padding: '18px',
            background: paymentMethod === 'mobile_money' ? '#eff6ff' : '#fff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Smartphone size={20} style={{ color: '#2563eb' }} />
              <strong>Mobile Money</strong>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
              Gateway: <strong>InTouchPay</strong>{companyPhone ? ` • Phone: ${companyPhone}` : ''}{provider ? ` • Network: ${provider.toUpperCase()}` : ''}
            </p>
          </div>
        </div>

        {/* Payment Summary */}
        <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: '600' }}>Payment Summary</h3>

          <div style={{ display: 'grid', gap: '10px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#666' }}>Plan:</span>
              <span style={{ fontWeight: '600' }}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#666' }}>Billing Cycle:</span>
              <span style={{ fontWeight: '600' }}>{cycle.charAt(0).toUpperCase() + cycle.slice(1)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#666' }}>Company:</span>
              <span style={{ fontWeight: '600' }}>{companyName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#666' }}>Employees Covered:</span>
              <span style={{ fontWeight: '600' }}>
                {seatUpgradeOnly
                  ? `${extraEmployees} new paid seat${extraEmployees === 1 ? '' : 's'}`
                  : `${employees} ${extraEmployees > 0 ? `(${extraEmployees} extra x ${currency === 'USD' ? '$' : 'FRw'} ${extraEmployeeAmount.toFixed(2)})` : `(${includedEmployees} included)`}`}
              </span>
            </div>
            {pendingInvites.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#666' }}>Invite Email:</span>
                <span style={{ fontWeight: '600' }}>
                  {pendingInvites.map((invite) => invite.email).join(', ')}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#666' }}>Payment Method:</span>
              <span style={{ fontWeight: '600' }}>{paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Card'}</span>
            </div>
            {paymentMethod === 'mobile_money' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#666' }}>Provider:</span>
                <span style={{ fontWeight: '600' }}>{provider.toUpperCase()}</span>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '600' }}>
            <span>Total Amount:</span>
            <span style={{ color: '#0066cc' }}>
              {currency === 'USD' ? '$' : 'FRw'} {parseFloat(amount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gap: '12px' }}>
          <button
            onClick={handleProcessPayment}
            disabled={processing || !amount}
            style={{
              padding: '14px 20px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: '#0066cc',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: processing || !amount ? 'not-allowed' : 'pointer',
              opacity: processing || !amount ? 0.6 : 1,
              transition: 'background-color 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseOver={(e) => !processing && !amount && (e.target.style.backgroundColor = '#0052a3')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#0066cc')}
          >
            {processing && <Loader size={18} className="animate-spin" />}
            {processing ? 'Processing...' : 'Continue to Payment'}
          </button>

          <button
            onClick={() => navigate('/login')}
            disabled={processing}
            style={{
              padding: '14px 20px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: 'white',
              color: '#0066cc',
              border: '2px solid #0066cc',
              borderRadius: '8px',
              cursor: processing ? 'not-allowed' : 'pointer',
              opacity: processing ? 0.6 : 1,
              transition: 'all 0.3s',
            }}
          >
            Skip for Now
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '20px' }}>
          Your subscription is created but not yet active. Complete payment to unlock all features.
        </p>
      </section>

      <MobileMoneyPendingModal
        open={pendingPaymentModal.open}
        paymentId={pendingPaymentModal.paymentId}
        requestTransactionId={pendingPaymentModal.requestTransactionId}
        transactionId={pendingPaymentModal.transactionId}
        provider={provider}
        phoneNumber={companyPhone}
        amount={amount}
        currency={currency}
        planName={plan}
        initialMessage={pendingPaymentModal.message}
        onClose={closePendingPaymentModal}
        onSuccess={async () => {
          setError(null);
          navigate('/subscription', { replace: true });
        }}
      />
    </div>
  );
}
