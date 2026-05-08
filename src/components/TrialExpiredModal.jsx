import React, { useEffect, useState } from 'react';
import subscriptionAPI from '../api/subscription';

/**
 * TrialExpiredModal Component
 * Shows when company's free trial has expired
 * Restricts access to core features and shows upgrade options
 */
const TrialExpiredModal = ({ onClose, showOverlay = true }) => {
  const [trialStatus, setTrialStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrialStatus();
    // Check every 30 seconds if trial expired
    const interval = setInterval(fetchTrialStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrialStatus = async () => {
    try {
      const response = await subscriptionAPI.getTrialStatus();
      if (response?.data) {
        setTrialStatus(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch trial status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show modal only if trial has expired
  if (loading || !trialStatus?.trialExceeded) {
    return null;
  }

  const handleUpgade = () => {
    window.location.href = '/subscription';
  };

  const plans = [
    {
      name: 'Essential',
      key: 'basic',
      price: 29.99,
      description: 'For small teams',
      features: [
        'Unlimited Work order',
        'Request',
        'AI',
      ],
    },
    {
      name: 'Premium',
      key: 'premium',
      price: 49.99,
      description: 'For growing businesses',
      features: [
        'Unlimited work Order',
        'Requests',
        'Asset',
        'Location',
        'PM',
        'Over AI',
        'Analytics',
        'Material Request',
        'Purchase Order',
      ],
      recommended: true,
    },
    {
      name: 'Professional',
      key: 'professional',
      price: 79.99,
      description: 'For large organizations',
      features: [
        'Unlimited work Order',
        'Requests',
        'Asset',
        'Location',
        'PM',
        'Over AI',
      ],
    },
  ];

  return (
    <>
      {showOverlay && <div className='fixed inset-0 bg-black bg-opacity-50 z-40' onClick={onClose} />}
      <div className='fixed inset-0 flex items-center justify-center z-50 p-4'>
        <div className='bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
          {/* Header */}
          <div className='bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 text-white'>
            <button
              onClick={onClose}
              className='float-right text-2xl font-bold hover:opacity-80 transition-opacity'
            >
              ×
            </button>
            <h2 className='text-2xl font-bold mb-2'>Free Trial Period Ended</h2>
            <p className='text-red-100'>
              Your 7-day free trial has expired. Please select a plan to continue accessing all features.
            </p>
          </div>

          {/* Content */}
          <div className='p-8'>
            {/* Explanation */}
            <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded'>
              <p className='text-red-800 font-medium'>
                ⚠️ Your free trial access has ended. Basic features are restricted until you subscribe to a paid plan.
              </p>
              <p className='text-red-700 text-sm mt-2'>
                All your data is safe and will be available immediately after you upgrade.
              </p>
            </div>

            {/* Plans Grid */}
            <div className='mb-8'>
              <h3 className='text-xl font-bold mb-6 text-gray-800'>Choose Your Plan</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {plans.map((plan) => (
                  <div
                    key={plan.key}
                    className={`relative rounded-lg border-2 transition-all ${
                      plan.recommended ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {plan.recommended && (
                      <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                        <span className='bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold'>
                          Recommended
                        </span>
                      </div>
                    )}

                    <div className='p-6'>
                      <h4 className='text-lg font-bold text-gray-900'>{plan.name}</h4>
                      <p className='text-sm text-gray-600 mb-4'>{plan.description}</p>

                      <div className='mb-4'>
                        <span className='text-3xl font-bold text-gray-900'>${plan.price}</span>
                        <span className='text-gray-600 text-sm'>/month</span>
                      </div>

                      <button
                        onClick={handleUpgade}
                        className={`w-full py-2 px-4 rounded font-medium transition-colors mb-4 ${
                          plan.recommended
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                        }`}
                      >
                        Select Plan
                      </button>

                      <div className='space-y-2'>
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className='flex items-start gap-2'>
                            <span className='text-green-600 font-bold mt-0.5'>✓</span>
                            <span className='text-sm text-gray-700'>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className='border-t pt-8'>
              <h3 className='text-lg font-bold mb-4 text-gray-800'>Questions?</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='font-semibold text-gray-800 mb-2'>Can I try another plan?</p>
                  <p className='text-gray-600'>
                    Yes! You can upgrade or downgrade your plan anytime. Changes take effect immediately.
                  </p>
                </div>
                <div>
                  <p className='font-semibold text-gray-800 mb-2'>Will my data be lost?</p>
                  <p className='text-gray-600'>
                    No, all your data is preserved. You'll have full access to everything once you upgrade.
                  </p>
                </div>
                <div>
                  <p className='font-semibold text-gray-800 mb-2'>Can I get a refund?</p>
                  <p className='text-gray-600'>
                    Yes, we offer a 30-day money-back guarantee if you're not satisfied.
                  </p>
                </div>
                <div>
                  <p className='font-semibold text-gray-800 mb-2'>Need help?</p>
                  <p className='text-gray-600'>
                    Contact our support team at support@mms-app.com or call +1-800-MMS-HELP
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='bg-gray-50 px-8 py-4 border-t flex items-center justify-between'>
            <p className='text-sm text-gray-600'>Special offer: Get 20% off annual plans this month!</p>
            <button
              onClick={handleUpgade}
              className='bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition-colors'
            >
              Continue to Plans →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrialExpiredModal;
