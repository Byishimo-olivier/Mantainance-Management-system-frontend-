import api from './axios';

// Configuration
const CLIENT_ID = 'ee00cab6-155a-11f1-a1f5-deadd43720af';
const SECRET_ID = '630eecbbb285bd9d5760f299a7231c9eda39a3ee5e6b4b0d3255bfef95601890afd80709';

const subscriptionAPI = {
  // Create a new subscription
  createSubscription: async (userId, email, plan = 'basic', billingCycle = 'monthly', paymentMethod = 'card', metadata = {}) => {
    try {
      const response = await api.post('/subscriptions', {
        userId,
        email,
        plan,
        billingCycle,
        clientId: CLIENT_ID,
        secretId: SECRET_ID,
        paymentMethod,
        metadata,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get subscription by client ID (alias for user subscription)
  getSubscriptionByClientId: async (clientId) => {
    try {
      const response = await api.get(`/subscriptions/client/${clientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Convenience method used by frontend hooks
  getSubscriptionByUserId: async (userId) => {
    // clientId and userId are treated interchangeably on the backend
    return subscriptionAPI.getSubscriptionByClientId(userId);
  },

  // Get subscription by subscription ID
  getSubscriptionById: async (id) => {
    try {
      const response = await api.get(`/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all subscriptions (admin/manager only)
  getAllSubscriptions: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.plan) params.append('plan', filters.plan);
      if (filters.billingCycle) params.append('billingCycle', filters.billingCycle);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      const queryString = params.toString();
      const response = await api.get(`/subscriptions${queryString ? '?' + queryString : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update subscription
  updateSubscription: async (subscriptionId, updateData) => {
    try {
      const response = await api.put(`/subscriptions/${subscriptionId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Change billing cycle
  changeBillingCycle: async (subscriptionId, billingCycle) => {
    try {
      const response = await api.post(`/subscriptions/${subscriptionId}/billing-cycle`, {
        billingCycle,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upgrade subscription
  upgradeSubscription: async (subscriptionId, newPlan) => {
    try {
      const response = await api.post(`/subscriptions/${subscriptionId}/upgrade`, {
        plan: newPlan,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId) => {
    try {
      const response = await api.post(`/subscriptions/${subscriptionId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete subscription
  deleteSubscription: async (subscriptionId) => {
    try {
      const response = await api.delete(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get subscription analytics
  getAnalytics: async () => {
    try {
      const response = await api.get('/subscriptions/analytics/summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get pricing
  getPricing: async () => {
    try {
      const response = await api.get('/subscriptions/public/pricing');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify subscription is active
  verifyActive: async (subscriptionId) => {
    try {
      const response = await api.get(`/subscriptions/${subscriptionId}/verify`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Payment API methods
  // Process payment (simulated or real PayPack)
  processPayment: async (subscriptionId, amount, paymentMethod, phoneNumber = null, email = null) => {
    try {
      const response = await api.post('/subscriptions/payments/process', {
        subscriptionId,
        amount,
        paymentMethod,
        phoneNumber,
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Initiate PayPack payment
  initiatePayPackPayment: async (subscriptionId, amount, paymentMethod, phoneNumber = null, email = null) => {
    try {
      const response = await api.post('/subscriptions/payments/initiate-paypack', {
        subscriptionId,
        amount,
        paymentMethod,
        phoneNumber,
        email,
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

  // Get subscription payments
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
      const response = await api.post(`/subscriptions/payments/${paymentId}/refund`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default subscriptionAPI;
