import api from './axios';

// Configuration
const CLIENT_ID = 'ee00cab6-155a-11f1-a1f5-deadd43720af';
const SECRET_ID = '630eecbbb285bd9d5760f299a7231c9eda39a3ee5e6b4b0d3255bfef95601890afd80709';

const paymentAPI = {
  // Get pricing for all plans and billing cycles
  getPricing: async () => {
    try {
      const response = await api.get('/subscriptions/public/pricing');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Calculate amount for specific plan and billing cycle
  calculateAmount: async (plan, billingCycle) => {
    try {
      const response = await api.get('/subscriptions/public/calculate', {
        params: { plan, billingCycle },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Process payment
  processPayment: async (subscriptionId, amount, paymentMethod, currency = 'USD') => {
    try {
      const response = await api.post('/subscriptions/payments/process', {
        subscriptionId,
        amount,
        paymentMethod,
        currency,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create payment
  createPayment: async (subscriptionId, amount, paymentMethod, description) => {
    try {
      const response = await api.post('/subscriptions/payments', {
        subscriptionId,
        amount,
        paymentMethod,
        description,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    try {
      const response = await api.get(`/subscriptions/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all payments for a subscription
  getSubscriptionPayments: async (subscriptionId) => {
    try {
      const response = await api.get(`/subscriptions/payments/subscription/${subscriptionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Refund payment
  refundPayment: async (paymentId, reason = '') => {
    try {
      const response = await api.post(`/subscriptions/payments/${paymentId}/refund`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all payments (admin only)
  getAllPayments: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      const queryString = params.toString();
      const response = await api.get(
        `/subscriptions/payments${queryString ? '?' + queryString : ''}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default paymentAPI;
