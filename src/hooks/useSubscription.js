import { useState, useEffect, useCallback } from 'react';
import subscriptionAPI from '../api/subscription';

// Custom hook for managing user subscription
export const useSubscription = (userId) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscription = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await subscriptionAPI.getSubscriptionByUserId(userId);
      setSubscription(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err.error || 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
  };
};

export default useSubscription;
