import api from './axios';

// Configuration
const CLIENT_ID = 'ee00cab6-155a-11f1-a1f5-deadd43720af';
const SECRET_ID = '630eecbbb285bd9d5760f299a7231c9eda39a3ee5e6b4b0d3255bfef95601890afd80709';

const BASE = '/api/subscriptions';

const subscriptionAPI = {
  // Create a new subscription
  createSubscription: async (userId, email, plan = 'basic', billingCycle = 'monthly', paymentMethod = 'card', metadata = {}) => {
    try {
      let currentUser = null;
      try {
        currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        currentUser = {};
      }

      const resolvedCompanyName = metadata?.companyName || currentUser?.companyName || currentUser?.company?.name || currentUser?.company || '';
      const resolvedCompanyId = metadata?.companyId || currentUser?.company?.id || currentUser?.companyId || '';
      const resolvedEmail = email || metadata?.managerEmail || currentUser?.email || '';
      const resolvedEmployeeCount = Number(
        metadata?.employeeCount ||
        metadata?.employeeLimit ||
        metadata?.maxUsers ||
        10
      );
      const resolvedMetadata = {
        ...metadata,
        companyName: resolvedCompanyName,
        companyId: resolvedCompanyId,
        employeeCount: resolvedEmployeeCount,
        employeeLimit: resolvedEmployeeCount,
        maxUsers: resolvedEmployeeCount,
        companyType: metadata?.companyType || currentUser?.companyType || '',
        branchName: metadata?.branchName || currentUser?.branchName || '',
        branchDetails: metadata?.branchDetails || currentUser?.branchDetails || '',
        branchLocation: metadata?.branchLocation || currentUser?.branchLocation || '',
        phone: metadata?.phone || currentUser?.phone || currentUser?.phoneNumber || '',
        countryCode: metadata?.countryCode || currentUser?.countryCode || '',
      };

      const response = await api.post(`${BASE}`, {
        userId,
        email: resolvedEmail,
        plan,
        billingCycle,
        clientId: CLIENT_ID,
        secretId: SECRET_ID,
        paymentMethod,
        employeeCount: resolvedEmployeeCount,
        employeeLimit: resolvedEmployeeCount,
        companyId: resolvedCompanyId || undefined,
        managerEmail: resolvedEmail,
        metadata: resolvedMetadata,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get subscription by company lookup value, preferring company name
  getSubscriptionByClientId: async (clientIdentifier) => {
    try {
      const response = await api.get(`${BASE}/client/${encodeURIComponent(clientIdentifier)}`);
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) {
        return { data: null, notFound: true };
      }
      throw error.response?.data || error.message;
    }
  },

  // Convenience method used by frontend hooks
  getSubscriptionByUserId: async (lookupValue) => {
    return subscriptionAPI.getSubscriptionByClientId(lookupValue);
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
  // Process payment (generic / legacy helper)
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

  // Legacy PayPack initiation endpoint
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

  // Initiate PesaPal card payment
  initiatePesaPalPayment: async (subscriptionId, amount, phoneNumber = null, email = null) => {
    try {
      const response = await api.post(`${BASE}/payments/initiate-pesapal`, {
        subscriptionId,
        amount,
        phoneNumber,
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Initiate InTouchPay mobile money payment
  initiateMobileMoneyPayment: async (
    subscriptionId,
    amount,
    provider,
    phoneNumber,
    currency = 'USD',
    email = null,
    userId = null
  ) => {
    try {
      const response = await api.post(`${BASE}/payments/initiate-mobile-money`, {
        subscriptionId,
        amount,
        provider,
        phoneNumber,
        currency,
        email,
        userId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMobileMoneyPaymentStatus: async ({ paymentId = null, requestTransactionId = null, transactionId = null }) => {
    try {
      const params = new URLSearchParams();
      if (paymentId) params.append('paymentId', paymentId);
      if (requestTransactionId) params.append('requestTransactionId', requestTransactionId);
      if (transactionId) params.append('transactionId', transactionId);
      const response = await api.get(`${BASE}/payments/mobile-money-status?${params.toString()}`);
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

  // Get invoices for a subscription
  getSubscriptionInvoices: async (subscriptionId) => {
    try {
      const response = await api.get(`${BASE}/${subscriptionId}/invoices`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId) => {
    try {
      const response = await api.get(`${BASE}/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Download invoice PDF
  downloadInvoice: async (invoiceId) => {
    try {
      const response = await api.get(`${BASE}/invoices/${invoiceId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get company subscription status for authenticated user
  getCompanySubscriptionStatus: async () => {
    try {
      const response = await api.get(`${BASE}/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * TRIAL-RELATED API METHODS
   */

  // Get trial status for user's company
  getTrialStatus: async () => {
    try {
      const response = await api.get(`${BASE}/trial/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Initialize free trial for new company
  initializeFreeTrial: async (companyId) => {
    try {
      const response = await api.post(`${BASE}/trial/initialize`, {
        companyId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upgrade from trial to paid subscription
  upgradeToPaid: async (companyId, plan, billingCycle = 'monthly') => {
    try {
      const response = await api.post(`${BASE}/trial/upgrade-to-paid`, {
        companyId,
        plan,
        billingCycle,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if user can access features
  canAccessFeatures: async () => {
    try {
      const response = await api.get(`${BASE}/trial/can-access`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's subscription info (plan + features)
  getUserSubscriptionInfo: async () => {
    try {
      const response = await api.get(`${BASE}/features/subscription-info`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's accessible features
  getAccessibleFeatures: async () => {
    try {
      const response = await api.get(`${BASE}/features/accessible`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if user has access to specific feature
  hasFeatureAccess: async (feature) => {
    try {
      const response = await api.get(`${BASE}/features/has-access`, {
        params: { feature },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default subscriptionAPI;
