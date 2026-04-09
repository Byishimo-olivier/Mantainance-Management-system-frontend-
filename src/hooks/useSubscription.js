import { useState, useEffect, useCallback } from 'react';
import subscriptionAPI from '../api/subscription';

// Custom hook for managing company subscription, preferring company name lookup
export const useSubscription = (lookupValue) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // grab the currently logged in user from localStorage
  const getCurrentUser = () => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const userRole = currentUser?.role || null;
  const resolvedLookupValue =
    lookupValue ||
    currentUser?.companyName ||
    currentUser?.company?.name ||
    currentUser?.company ||
    currentUser?.companyId ||
    currentUser?.id ||
    currentUser?._id ||
    null;

  const fetchSubscription = useCallback(async () => {
    if (!resolvedLookupValue) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await subscriptionAPI.getSubscriptionByUserId(resolvedLookupValue);
      setSubscription(response?.data || null);
      setError(null);
    } catch (err) {
      if (err?.status === 404 || err?.error === 'Subscription not found') {
        setSubscription(null);
        setError(null);
        return;
      }
      console.error('Error fetching subscription:', err);
      setError(err.error || 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  }, [resolvedLookupValue]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const upgrade = useCallback(
    async (newPlan) => {
      if (!subscription?.id) {
        setError('No active subscription');
        return;
      }
      try {
        setLoading(true);
        const response = await subscriptionAPI.upgradeSubscription(subscription.id, newPlan);
        setSubscription(response.data);
        setError(null);
        return response.data;
      } catch (err) {
        setError(err.error || 'Failed to upgrade subscription');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [subscription?.id]
  );

  const cancel = useCallback(async () => {
    if (!subscription?.id) {
      setError('No active subscription');
      return;
    }
    try {
      setLoading(true);
      const response = await subscriptionAPI.cancelSubscription(subscription.id);
      setSubscription(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.error || 'Failed to cancel subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [subscription?.id]);

  const verify = useCallback(async () => {
    if (!subscription?.id) {
      return false;
    }
    try {
      const response = await subscriptionAPI.verifyActive(subscription.id);
      return response.isActive;
    } catch (err) {
      console.error('Error verifying subscription:', err);
      return false;
    }
  }, [subscription?.id]);

  const refresh = useCallback(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const canUpdate = !!(
    subscription &&
    (currentUser &&
      (currentUser.id === subscription.userId ||
        currentUser._id === subscription.userId ||
        ['admin', 'manager'].includes(userRole)))
  );

  return {
    subscription,
    loading,
    error,
    upgrade,
    cancel,
    verify,
    refresh,
    isActive: subscription?.status === 'active',
    isProfessional: subscription?.plan === 'professional',
    isEnterprise: subscription?.plan === 'enterprise',
    userRole,
    canUpdate,
  };
};

export default useSubscription;
