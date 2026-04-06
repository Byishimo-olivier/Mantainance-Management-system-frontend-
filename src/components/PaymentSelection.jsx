import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AuthHeader from './auth/AuthHeader';
import api from '../api/axios';
import subscriptionAPI from '../api/subscription';
import { Smartphone, CreditCard, Building2, AlertCircle, Loader } from 'lucide-react';

export default function PaymentSelection() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [systemCurrency, setSystemCurrency] = useState('USD');

  // Extract parameters from URL
  const plan = searchParams.get('plan') || 'basic';
  const cycle = searchParams.get('cycle') || 'monthly';
  const currency = searchParams.get('currency') || systemCurrency;
  const companyName = searchParams.get('companyName') || '';
  const managerEmail = searchParams.get('email') || '';
  const companyPhone = searchParams.get('phone') || '';
  const subscriptionId = searchParams.get('subscriptionId');
  const amount = searchParams.get('amount') || '0';

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
      const finalAmount = parseFloat(amount);

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

      // If no subscriptionId, create a subscription first
      let subId = subscriptionId;
      if (!subId) {
        try {
          const createSubResponse = await api.post('/api/subscriptions', {
            plan,
            billingCycle: cycle,
            currency,
            companyName: company,
            email,
            userId,
          });
          subId = createSubResponse.data?.subscription?._id || createSubResponse.data?._id;
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

      // Send to PesaPal with complete data
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

      console.log('Sending payment request:', paymentData);

      const paymentResponse = await api.post(
        '/api/subscriptions/payments/initiate-pesapal',
        paymentData
      );

      if (paymentResponse.data?.redirectUrl) {
        // Redirect to PesaPal
        window.location.href = paymentResponse.data.redirectUrl;
      } else {
        setError('Failed to get payment redirect. Please try again.');
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
                After clicking "Proceed to Payment" below, you'll be redirected to PesaPal where you can choose from all available payment methods including:
              </p>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
                <li>Mobile Money (M-Pesa, Airtel Money, MTN, Orange Money)</li>
                <li>Credit/Debit Cards (Visa, Mastercard, American Express)</li>
              </ul>
            </div>
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
    </div>
  );
}
