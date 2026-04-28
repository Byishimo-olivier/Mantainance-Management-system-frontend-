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
  const [trialStatus, setTrialStatus] = useState(trialStatusCache);
  const [loading, setLoading] = useState(!trialStatusCache);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrialStatus = useCallback(async () => {
    const hasCachedStatus = Boolean(trialStatusCache);

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
      trialStatusCache = response?.data || null;
      setTrialStatus(trialStatusCache);
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
  }, []);

  useEffect(() => {
    if (!trialStatusCache) {
      fetchTrialStatus();
    } else {
      setTrialStatus(trialStatusCache);
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
