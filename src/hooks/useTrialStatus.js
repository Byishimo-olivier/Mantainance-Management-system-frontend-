import { useState, useEffect, useCallback } from 'react';
import subscriptionAPI from '../api/subscription';

let trialStatusCache = null;
let trialStatusPendingPromise = null;

/**
 * Custom hook to manage trial status
 * Provides trial state and update functions for components
 * 
 * Usage:
 *   const { trialStatus, isInTrial, hasExpired, daysRemaining, loading, refetch } = useTrialStatus();
 */
const useTrialStatus = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
  const cacheKey = token ? token.slice(-16) : '';
  const cachedForUser = trialStatusCache?.cacheKey === cacheKey ? trialStatusCache.data : null;
  const [trialStatus, setTrialStatus] = useState(cachedForUser);
  const [loading, setLoading] = useState(!cachedForUser);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrialStatus = useCallback(async () => {
    const hasCachedStatus = Boolean(trialStatusCache?.cacheKey === cacheKey && trialStatusCache?.data);

    try {
      if (hasCachedStatus) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!trialStatusPendingPromise) {
        trialStatusPendingPromise = subscriptionAPI.getTrialStatus();
      }

      const response = await trialStatusPendingPromise;
      trialStatusCache = { cacheKey, data: response?.data || null };
      setTrialStatus(trialStatusCache.data);
      setError(null);
      return trialStatusCache;
    } catch (err) {
      console.error('Failed to fetch trial status:', err);
      setError(err?.message || 'Failed to fetch trial status');
      if (!hasCachedStatus) {
        setTrialStatus(null);
        trialStatusCache = null;
      }
    } finally {
      trialStatusPendingPromise = null;
      setRefreshing(false);
      if (!hasCachedStatus) {
        setLoading(false);
      }
    }
  }, [cacheKey]);

  useEffect(() => {
    if (!trialStatusCache || trialStatusCache.cacheKey !== cacheKey) {
      fetchTrialStatus();
    } else {
      setTrialStatus(trialStatusCache.data);
      setLoading(false);
    }

    // Refresh trial status regularly so expiry redirects happen without a manual refresh.
    const interval = setInterval(fetchTrialStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchTrialStatus]);

  return {
    trialStatus,
    isInTrial: trialStatus?.isInTrial === true,
    hasExpired: trialStatus?.trialExceeded === true,
    daysRemaining: trialStatus?.daysRemaining || 0,
    loading,
    refreshing,
    error,
    refetch: fetchTrialStatus,
  };
};

export default useTrialStatus;
