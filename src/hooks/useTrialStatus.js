import { useState, useEffect, useCallback } from 'react';
import subscriptionAPI from '../api/subscription';

/**
 * Custom hook to manage trial status
 * Provides trial state and update functions for components
 * 
 * Usage:
 *   const { trialStatus, isInTrial, hasExpired, daysRemaining, loading, refetch } = useTrialStatus();
 */
const useTrialStatus = () => {
  const [trialStatus, setTrialStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrialStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subscriptionAPI.getTrialStatus();
      setTrialStatus(response?.data);
      setError(null);
      return response?.data;
    } catch (err) {
      console.error('Failed to fetch trial status:', err);
      setError(err?.message || 'Failed to fetch trial status');
      setTrialStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrialStatus();
    // Refresh trial status every minute
    const interval = setInterval(fetchTrialStatus, 60000);
    return () => clearInterval(interval);
  }, [fetchTrialStatus]);

  return {
    trialStatus,
    isInTrial: trialStatus?.isInTrial === true,
    hasExpired: trialStatus?.trialExceeded === true,
    daysRemaining: trialStatus?.daysRemaining || 0,
    loading,
    error,
    refetch: fetchTrialStatus,
  };
};

export default useTrialStatus;
