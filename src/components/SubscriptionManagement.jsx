import React, { useState, useEffect } from 'react';
import subscriptionAPI from '../api/subscription';
import paymentAPI from '../api/payment';
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader,
  AlertTriangle,
  TrendingUp,
  Users,
  Package,
  Zap,
  Shield,
  Clock,
  X,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
} from 'lucide-react';

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [filteredPlan, setFilteredPlan] = useState('all');
  const [filteredStatus, setFilteredStatus] = useState('all');
  const [pricing, setPricing] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    plan: 'basic',
    billingCycle: 'monthly',
    paymentMethod: '',
    metadata: {},
  });

  // Fetch subscriptions, analytics, and pricing on component mount
  useEffect(() => {
    fetchSubscriptions();
    fetchAnalytics();
    fetchPricing();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const filters = {
        ...(filteredPlan !== 'all' && { plan: filteredPlan }),
        ...(filteredStatus !== 'all' && { status: filteredStatus }),
      };
      const response = await subscriptionAPI.getAllSubscriptions(filters);
      setSubscriptions(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.error || 'Failed to fetch subscriptions');
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await subscriptionAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchPricing = async () => {
    try {
      const response = await paymentAPI.getPricing();
      setPricing(response.data);
    } catch (err) {
      console.error('Error fetching pricing:', err);
    }
  };

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await subscriptionAPI.createSubscription(
        formData.userId,
        formData.email,
        formData.plan,
        formData.billingCycle,
        formData.paymentMethod,
        formData.metadata
      );
      setSubscriptions([response.data, ...subscriptions]);
      showSuccess('Subscription created successfully!');
      resetForm();
      closeModal();
    } catch (err) {
      setError(err.error || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeSubscription = async (subscriptionId, newPlan) => {
    setLoading(true);
    try {
      const response = await subscriptionAPI.upgradeSubscription(subscriptionId, newPlan);
      setSubscriptions(subscriptions.map(sub => 
        sub.id === subscriptionId ? response.data : sub
      ));
      showSuccess('Subscription upgraded successfully!');
    } catch (err) {
      setError(err.error || 'Failed to upgrade subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;

    setLoading(true);
    try {
      const response = await subscriptionAPI.cancelSubscription(subscriptionId);
      setSubscriptions(subscriptions.map(sub => 
        sub.id === subscriptionId ? response.data : sub
      ));
      showSuccess('Subscription cancelled successfully!');
    } catch (err) {
      setError(err.error || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) return;

    setLoading(true);
    try {
      await subscriptionAPI.deleteSubscription(subscriptionId);
      setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId));
      showSuccess('Subscription deleted successfully!');
    } catch (err) {
      setError(err.error || 'Failed to delete subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      email: '',
      plan: 'basic',
      billingCycle: 'monthly',
      paymentMethod: '',
      metadata: {},
    });
  };

  const openModal = (mode = 'create', subscription = null) => {
    setModalMode(mode);
    if (subscription) {
      setFormData({
        userId: subscription.userId,
        email: subscription.email,
        plan: subscription.plan,
        metadata: subscription.metadata || {},
      });
      setSelectedSubscription(subscription);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubscription(null);
    resetForm();
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'basic':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'professional':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'enterprise':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'cancelled':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'paused':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'pending':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getPlanFeatures = (plan) => {
    const features = {
      basic: ['Dashboard Access', 'Basic Reports', 'Email Support'],
      professional: ['All Basic Features', 'Advanced Reports', 'API Access', 'Priority Support'],
      enterprise: ['All Professional Features', 'Dedicated Support', 'Custom Training', 'SLA'],
    };
    return features[plan] || [];
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Subscription Management</h1>
          <p className="text-gray-600 mt-1">Manage user subscriptions and plans</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          New Subscription
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="text-red-600" size={20} />
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Subscriptions</p>
                <p className="text-2xl font-bold text-gray-800">{analytics.totalSubscriptions}</p>
              </div>
              <Package className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Subscriptions</p>
                <p className="text-2xl font-bold text-green-600">{analytics.activeSubscriptions}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{analytics.cancelledSubscriptions}</p>
              </div>
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.totalSubscriptions > 0
                    ? Math.round((analytics.activeSubscriptions / analytics.totalSubscriptions) * 100)
                    : 0}
                  %
                </p>
              </div>
              <TrendingUp className="text-blue-500" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filteredPlan}
          onChange={(e) => {
            setFilteredPlan(e.target.value);
            fetchSubscriptions();
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="all">All Plans</option>
          <option value="basic">Basic</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <select
          value={filteredStatus}
          onChange={(e) => {
            setFilteredStatus(e.target.value);
            fetchSubscriptions();
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="paused">Paused</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading && subscriptions.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="animate-spin text-blue-600" size={40} />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No subscriptions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Plan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Next Billing</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 font-mono">
                      {subscription.userId.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{subscription.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPlanColor(subscription.plan)}`}>
                        {subscription.plan?.charAt(0).toUpperCase() + subscription.plan?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(subscription.status)}`}>
                        {subscription.status?.charAt(0).toUpperCase() + subscription.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(subscription.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(subscription.nextBillingDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancelSubscription(subscription.id)}
                          disabled={subscription.status === 'cancelled' || loading}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Cancel Subscription"
                        >
                          <X size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteSubscription(subscription.id)}
                          disabled={loading}
                          className="text-orange-600 hover:text-orange-800 disabled:opacity-50"
                          title="Delete Subscription"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Create New Subscription' : 'Edit Subscription'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="User ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="basic">Basic</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                <select
                  name="billingCycle"
                  value={formData.billingCycle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                {pricing && pricing[formData.plan] && (
                  <p className="text-xs text-gray-500 mt-1">
                    Price: ${pricing[formData.plan][formData.billingCycle]} ({formData.billingCycle})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <input
                  type="text"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  placeholder="card, paypal, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
