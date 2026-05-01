import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function Activation() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, verified, payment_pending, completed, error
  const [activationData, setActivationData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    verifyActivationToken();
  }, [token]);

  useEffect(() => {
    if (status === 'verified' && activationData?.activationMode === 'email') {
      completeActivation();
    }
  }, [status, activationData]);

  const verifyActivationToken = async () => {
    try {
      if (!token) {
        setError('No activation token provided');
        setStatus('error');
        setLoading(false);
        return;
      }

      const response = await api.get(`/api/users/activate/${token}`);
      
      if (response.status === 200) {
        setActivationData(response.data);
        setStatus('verified');
        setError(null);
      }
    } catch (err) {
      console.error('Activation verification error:', err);
      setError(err.response?.data?.error || 'Failed to verify activation token');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);

      // Create a subscription and initiate payment
      const paymentResponse = await api.post('/api/subscriptions/payments/initiate-pesapal', {
        userId: activationData.userId,
        plan: activationData.plan,
        billingCycle: activationData.billingCycle,
        amount: activationData.price,
        currency: activationData.currency,
        email: activationData.email,
        activationToken: activationData.activationToken
      });

      if (paymentResponse.data.redirectUrl) {
        // Redirect to PesaPal payment
        window.location.href = paymentResponse.data.redirectUrl;
      } else {
        setError('Failed to initiate payment. Please try again.');
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError(err.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Check for payment completion from query params
  useEffect(() => {
    const paymentStatus = searchParams.get('payment_status');
    const transactionId = searchParams.get('transaction_id');

    if (paymentStatus === 'success') {
      completeActivation();
    } else if (paymentStatus === 'failed') {
      setError('Payment failed. Please try again.');
      setStatus('error');
    } else if (paymentStatus === 'error') {
      const message = searchParams.get('message');
      setError(message || 'An error occurred during payment');
      setStatus('error');
    }
  }, [searchParams]);

  const completeActivation = async () => {
    try {
      setLoading(true);

      const response = await api.post('/api/users/complete-activation', {
        activationToken: token,
        userId: activationData?.userId
      });

      if (response.status === 200) {
        setStatus('completed');
        setError(null);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Account activated successfully! Please log in with your credentials.' 
            } 
          });
        }, 3000);
      }
    } catch (err) {
      console.error('Activation completion error:', err);
      setError(err.response?.data?.error || 'Failed to complete activation');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Loading State */}
        {status === 'loading' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <h2 className="text-center text-xl font-semibold text-gray-800 mb-2">
              Verifying Your Account
            </h2>
            <p className="text-center text-gray-600">
              Please wait while we verify your activation link...
            </p>
          </div>
        )}

        {/* Verified - Ready for Payment or Email Activation */}
        {status === 'verified' && activationData && activationData.activationMode !== 'email' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome!
              </h2>
              <p className="text-gray-600">
                Your account is verified. Complete payment to activate.
              </p>
            </div>

            {/* Subscription Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Subscription Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {activationData.plan}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Billing Cycle:</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {activationData.billingCycle}
                  </span>
                </div>
                <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {activationData.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                paymentLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              {paymentLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Proceed to Payment (${activationData.currency} ${activationData.price})`
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              You will be redirected to PesaPal secure payment gateway
            </p>
          </div>
        )}

        {status === 'verified' && activationData?.activationMode === 'email' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <h2 className="text-center text-xl font-semibold text-gray-800 mb-2">
              Activating Your Account
            </h2>
            <p className="text-center text-gray-600">
              Your email was verified. We are activating your account now...
            </p>
          </div>
        )}

        {/* Completed - Success State */}
        {status === 'completed' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Account Activated!
              </h2>
              <p className="text-gray-600 mb-6">
                Your email is verified and your account is now active.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Redirecting to login page...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mx-auto"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Activation Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'An error occurred during activation'}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/register')}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Sign Up Again
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Back to Login
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              If you need help, please contact our support team.
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            What Happens Next?
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">1.</span>
              <span>Review your subscription details</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">2.</span>
              <span>Complete secure payment via PesaPal</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">3.</span>
              <span>Your account will be activated immediately</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">4.</span>
              <span>Log in and start using MMS</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
