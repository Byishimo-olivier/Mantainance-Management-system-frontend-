import React, { useState } from 'react';
import './PaymentMethodModal.css';

export default function PaymentMethodModal({ isOpen, plan, billingCycle, currency, onClose, onSelect }) {
  const [selectedMethod, setSelectedMethod] = useState('pesapal');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await onSelect(selectedMethod);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currencySymbols = {
    'USD': '$',
    'RWF': 'FRw'
  };
  const symbol = currencySymbols[currency] || '$';

  // Mock pricing for display
  const planPrices = {
    basic: { weekly: 9.99, monthly: 29.99, yearly: 299.99 },
    premium: { weekly: 15.99, monthly: 49.99, yearly: 499.99 },
    professional: { weekly: 24.99, monthly: 79.99, yearly: 799.99 },
    enterprise: { weekly: 49.99, monthly: 199.99, yearly: 1999.99 }
  };

  const amount = planPrices[plan]?.[billingCycle] || 0;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="payment-modal-header">
          <h2>Choose Payment Method</h2>
          <button 
            className="payment-modal-close" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="payment-modal-body">
          {/* Payment Summary */}
          <div className="payment-summary">
            <div className="payment-summary-item">
              <span className="payment-summary-label">Plan:</span>
              <span className="payment-summary-value">{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
            </div>
            <div className="payment-summary-item">
              <span className="payment-summary-label">Billing Cycle:</span>
              <span className="payment-summary-value">{billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}</span>
            </div>
            <div className="payment-summary-item">
              <span className="payment-summary-label">Total Amount:</span>
              <span className="payment-summary-value">{symbol}{amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods">
            {/* Mobile Money Option */}
            <div className="payment-method-option">
              <input
                type="radio"
                id="method-mobile"
                name="payment-method"
                value="pesapal"
                checked={selectedMethod === 'pesapal'}
                onChange={(e) => setSelectedMethod(e.target.value)}
              />
              <label htmlFor="method-mobile" className="payment-method-label">
                <div className="payment-method-header">
                  <span className="payment-method-icon">📱</span>
                  <span className="payment-method-title">Mobile Money</span>
                </div>
                <div className="payment-method-description">
                  Pay via M-Pesa, Airtel Money, MTN, Orange Money & more (via PesaPal)
                </div>
              </label>
            </div>

            {/* Card Payment Option */}
            <div className="payment-method-option">
              <input
                type="radio"
                id="method-card"
                name="payment-method"
                value="pesapal-card"
                checked={selectedMethod === 'pesapal-card'}
                onChange={(e) => setSelectedMethod(e.target.value)}
              />
              <label htmlFor="method-card" className="payment-method-label">
                <div className="payment-method-header">
                  <span className="payment-method-icon">💳</span>
                  <span className="payment-method-title">Card Payment (PesaPal)</span>
                </div>
                <div className="payment-method-description">
                  Pay with Visa, Mastercard, or American Express via PesaPal
                </div>
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="payment-info-box">
            <span className="info-icon">ℹ️</span>
            <p>
              All payments are processed securely through PesaPal. You'll be able to select your preferred provider during checkout.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="payment-modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleContinue}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Continue to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
