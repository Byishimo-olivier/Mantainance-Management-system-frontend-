import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AuthHeader from './auth/AuthHeader';
import api from '../api/axios';
import subscriptionAPI from '../api/subscription';
import { CheckCircle, AlertCircle, Clock, RefreshCw, Home } from 'lucide-react';

export default function PaymentConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get payment status from URL or sessionStorage
  const paymentStatus = searchParams.get('payment_status'); // COMPLETED, FAILED, PENDING
  const transactionId = searchParams.get('transaction_id');
  const orderTrackingId = searchParams.get('orderTrackingId');
  const method = searchParams.get('method') || '';
  const paymentId = searchParams.get('paymentId') || '';
  const requestTransactionId = searchParams.get('requestTransactionId') || '';
  const mobileTransactionId = searchParams.get('transactionId') || '';

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(paymentStatus || 'pending');
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Step 4: Fetch and display post-payment information
  useEffect(() => {
    const loadPaymentDetails = async () => {
      try {
        setLoading(true);
        
        // Try to get payment details from sessionStorage (set before redirect)
        const storedDetails = sessionStorage.getItem('paymentDetails');
        if (storedDetails) {
          const details = JSON.parse(storedDetails);
          setPaymentDetails(details);
        }

        if (method === 'mobile_money' && paymentStatus !== 'completed' && paymentStatus !== 'failed') {
          await queryMobileMoneyStatus();
        } else if (orderTrackingId && paymentStatus !== 'completed' && paymentStatus !== 'failed') {
          await queryPaymentStatus(orderTrackingId);
        }
      } catch (err) {
        console.error('Error loading payment details:', err);
        setError('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentDetails();
  }, [method, orderTrackingId, paymentStatus, paymentId, requestTransactionId, mobileTransactionId]);

  // Step 5: Query PesaPal for payment status using orderTrackingId
  const queryPaymentStatus = async (trackingId) => {
    try {
      setCheckingStatus(true);
      const response = await api.get(
        `/api/subscriptions/payments/pesapal-status?orderTrackingId=${trackingId}`
      );
      
      const paymentStatus = response.data?.data?.status || response.data?.status;
      
      // Update status based on PesaPal response
      if (paymentStatus === 'COMPLETED') {
        setStatus('completed');
      } else if (paymentStatus === 'FAILED') {
        setStatus('failed');
      } else if (paymentStatus === 'PENDING') {
        setStatus('pending');
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      // Continue anyway - status might update via webhook
    } finally {
      setCheckingStatus(false);
    }
  };

  const queryMobileMoneyStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await subscriptionAPI.getMobileMoneyPaymentStatus({
        paymentId,
        requestTransactionId,
        transactionId: mobileTransactionId,
      });

      const mobileStatus = response?.data?.status || response?.status;
      const mobileMessage = response?.data?.message || response?.message || null;
      const responseCode = response?.data?.responseCode || response?.responseCode || null;
      if (mobileStatus === 'completed') {
        setStatus('completed');
        setError(null);
      } else if (mobileStatus === 'failed') {
        setStatus('failed');
        setError(
          mobileMessage
            ? `${mobileMessage}${responseCode ? ` (code: ${responseCode})` : ''}`
            : 'The mobile money payment was rejected by the gateway.'
        );
      } else {
        setStatus('pending');
        if (mobileMessage) {
          setError(null);
        }
      }
    } catch (err) {
      console.error('Error checking mobile money status:', err);
      setError(err?.error || err?.message || err?.response?.data?.error || 'Failed to check mobile money payment status.');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Retry status check every 5 seconds (up to 60 seconds for pending payments)
  useEffect(() => {
    if (status === 'pending' && (orderTrackingId || method === 'mobile_money')) {
      const interval = setInterval(() => {
        if (method === 'mobile_money') {
          queryMobileMoneyStatus();
        } else {
          queryPaymentStatus(orderTrackingId);
        }
      }, 5000);

      // Clear interval after 60 seconds
      const timeout = setTimeout(() => clearInterval(interval), 60000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [status, orderTrackingId, method, paymentId, requestTransactionId, mobileTransactionId]);

  if (loading) {
    return (
      <div className="payment-confirmation-page">
        <AuthHeader />
        <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '700px', margin: '0 auto' }}>
          <RefreshCw size={48} style={{ color: '#0066cc', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <h2>Processing Payment...</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Please wait while we confirm your payment {method === 'mobile_money' ? 'with InTouchPay' : 'with PesaPal'}.
          </p>
        </div>
      </div>
    );
  }

  // Payment Completed
  if (status === 'completed') {
    return (
      <div className="payment-confirmation-page">
        <AuthHeader />
        <section style={{ padding: '60px 20px', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <CheckCircle size={64} style={{ color: '#27ae60', margin: '0 auto 20px' }} />
            <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#27ae60', fontWeight: '600' }}>
              Payment Successful! ✓
            </h1>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
              Thank you for your payment. Your subscription has been activated and you can now access all features.
            </p>
          </div>

          {transactionId && (
            <div style={{
              backgroundColor: '#f0f9f7',
              border: '1px solid #27ae60',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '30px'
            }}>
              <p style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>
                <strong>Transaction ID:</strong>
              </p>
              <p style={{ fontSize: '13px', fontFamily: 'monospace', color: '#333', wordBreak: 'break-all' }}>
                {transactionId}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                flex: 1,
                padding: '14px 20px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: '#27ae60',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Payment Failed
  if (status === 'failed') {
    return (
      <div className="payment-confirmation-page">
        <AuthHeader />
        <section style={{ padding: '60px 20px', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <AlertCircle size={64} style={{ color: '#e74c3c', margin: '0 auto 20px' }} />
            <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#e74c3c', fontWeight: '600' }}>
              Payment Failed ✗
            </h1>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
              Unfortunately, your payment could not be processed. Please try again or contact support if the problem persists.
            </p>
          </div>

          <div style={{
            backgroundColor: '#fadbd8',
            border: '1px solid #e74c3c',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '30px',
            color: '#c0392b'
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              {error || `Payment could not be completed. Please try another ${method === 'mobile_money' ? 'mobile money' : 'payment'} method or contact support.`}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={() => navigate('/payment-selection' + window.location.search)}
              style={{
                padding: '14px 20px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/subscription')}
              style={{
                padding: '14px 20px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: '#95a5a6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Payment Pending (default state when user returns from PesaPal)
  return (
    <div className="payment-confirmation-page">
      <AuthHeader />
      <section style={{ padding: '60px 20px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Clock size={64} style={{ color: '#f39c12', margin: '0 auto 20px' }} />
          <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#333', fontWeight: '600' }}>
            Payment Processing
          </h1>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
            {method === 'mobile_money'
              ? 'Your mobile money request has been sent through InTouchPay. Approve it on your phone and we will keep checking the payment status automatically.'
              : 'Your payment is being processed. This usually takes a few moments. You can close this page and we will confirm your subscription via email.'}
          </p>
        </div>

        <div style={{
          backgroundColor: '#fef8f5',
          border: '1px solid #f39c12',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333', fontWeight: '600' }}>
            What happens next?
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#555', fontSize: '14px', lineHeight: '1.8' }}>
            {method === 'mobile_money' ? (
              <>
                <li>Approve the pending debit request on your phone</li>
                <li>We are checking InTouchPay for the latest transaction result</li>
                <li>Your subscription activates as soon as the payment is confirmed</li>
                <li>If the request expires, you can retry the collection from the subscription page</li>
              </>
            ) : (
              <>
                <li>We're verifying your payment with PesaPal</li>
                <li>You'll receive a confirmation email within 2-5 minutes</li>
                <li>Your subscription activates immediately upon confirmation</li>
                <li>You can start using all premium features right away</li>
              </>
            )}
          </ul>
        </div>

        <div style={{
          backgroundColor: '#ecf0f1',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#555' }}>
            {checkingStatus ? 'Checking payment status...' : 'Last checked: just now'}
          </p>
          <button
            onClick={() => {
              if (method === 'mobile_money') {
                queryMobileMoneyStatus();
              } else {
                queryPaymentStatus(orderTrackingId || transactionId);
              }
            }}
            disabled={checkingStatus}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: '#3498db',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: checkingStatus ? 'not-allowed' : 'pointer',
              opacity: checkingStatus ? 0.6 : 1
            }}
          >
            {checkingStatus ? 'Checking...' : 'Check Status'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              flex: 1,
              padding: '14px 20px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: '#3498db',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/pricing')}
            style={{
              flex: 1,
              padding: '14px 20px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: 'white',
              color: '#3498db',
              border: '2px solid #3498db',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Back to Pricing
          </button>
        </div>
      </section>
    </div>
  );
}
