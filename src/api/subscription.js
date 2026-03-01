import api from './axios';

// Configuration
const CLIENT_ID = 'ee00cab6-155a-11f1-a1f5-deadd43720af';
const SECRET_ID = '630eecbbb285bd9d5760f299a7231c9eda39a3ee5e6b4b0d3255bfef95601890afd80709';

const BASE = '/api/subscriptions';

const subscriptionAPI = {
  // Create a new subscription
  createSubscription: async (userId, email, plan = 'basic', billingCycle = 'monthly', paymentMethod = 'card', metadata = {}) => {
    try {
      const response = await api.post(`${BASE}`, {
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
      const response = await api.get(`${BASE}/client/${clientId}`);
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
      const response = await api.get(`${BASE}/${id}`);
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
      const response = await api.get(`${BASE}${queryString ? '?' + queryString : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update subscription
  updateSubscription: async (subscriptionId, updateData) => {
    try {
      const response = await api.put(`${BASE}/${subscriptionId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Convenience alias for updating a subscription as the current user
  updateMySubscription: async (subscriptionId, updateData, config = {}) => {
    try {
      const response = await api.put(`${BASE}/${subscriptionId}`, updateData, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Change billing cycle
  changeBillingCycle: async (subscriptionId, billingCycle) => {
    try {
      const response = await api.post(`${BASE}/${subscriptionId}/billing-cycle`, {
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
      const response = await api.post(`${BASE}/${subscriptionId}/upgrade`, {
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
      const response = await api.post(`${BASE}/${subscriptionId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete subscription
  deleteSubscription: async (subscriptionId) => {
    try {
      const response = await api.delete(`${BASE}/${subscriptionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get subscription analytics
  getAnalytics: async () => {
    try {
      const response = await api.get(`${BASE}/analytics/summary`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get pricing
  getPricing: async () => {
    try {
      // public pricing endpoint should be accessible without Authorization header
      const base = api.defaults.baseURL || '';
      const url = (base ? base.replace(/\/+$/,'') : '') + `${BASE}/public/pricing`;
      const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw errBody || new Error('Failed to fetch pricing');
      }
      const body = await res.json();
      return body;
    } catch (error) {
      throw error;
    }
  },

  // Verify subscription is active
  verifyActive: async (subscriptionId) => {
    try {
      const response = await api.get(`${BASE}/${subscriptionId}/verify`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Payment API methods
  // Process payment (simulated or real PayPack)
  processPayment: async (subscriptionId, amount, paymentMethod, phoneNumber = null, email = null) => {
    try {
      const response = await api.post(`${BASE}/payments/process`, {
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
      const response = await api.post(`${BASE}/payments/initiate-paypack`, {
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
      const response = await api.get(`${BASE}/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get subscription payments
  getSubscriptionPayments: async (subscriptionId) => {
    try {
      const response = await api.get(`${BASE}/payments/subscription/${subscriptionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  refundPayment: async (paymentId, reason = '') => {
    try {
      const response = await api.post(`${BASE}/payments/${paymentId}/refund`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get property associated with subscription
  getSubscriptionProperty: async (subscriptionId) => {
    try {
      const response = await api.get(`${BASE}/${subscriptionId}/property`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get properties (from properties API) - accepts optional axios config (headers/query)
  getPropertiesForUser: async (userId, config = {}) => {
    try {
      // If caller provided userId in config.params, prefer that; otherwise include as param
      const finalConfig = { ...(config || {}) };
      if (userId && !finalConfig.params) {
        finalConfig.params = { userId };
      }
      const response = await api.get('/api/properties', finalConfig);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default subscriptionAPI;
