import { useEffect, useState, useCallback } from 'react';
import subscriptionAPI from '../api/subscription';

let companySubscriptionCache = null;
let companySubscriptionPendingPromise = null;

/**
 * Hook to check user's company subscription status
 */
export const useCompanySubscription = () => {
  const [subscription, setSubscription] = useState(companySubscriptionCache?.subscription || null);
  const [hasActive, setHasActive] = useState(companySubscriptionCache?.hasActive || false);
  const [company, setCompany] = useState(companySubscriptionCache?.company || null);
  const [teamMembers, setTeamMembers] = useState(companySubscriptionCache?.teamMembers || []);
  const [isAdmin, setIsAdmin] = useState(companySubscriptionCache?.isAdmin || false);
  const [loading, setLoading] = useState(!companySubscriptionCache);
  const [error, setError] = useState(null);

  const checkSubscription = useCallback(async () => {
    try {
      setLoading(true);
      if (!companySubscriptionPendingPromise) {
        companySubscriptionPendingPromise = subscriptionAPI.getCompanySubscriptionStatus();
      }

      const response = await companySubscriptionPendingPromise;
      
      if (response?.data) {
        const data = response.data;
        companySubscriptionCache = {
          hasActive: data.hasActiveSubscription || false,
          subscription: data.subscription || null,
          company: data.company || null,
          teamMembers: data.teamMembers || [],
          isAdmin: data.isCompanyAdmin || false,
        };
        setHasActive(data.hasActiveSubscription || false);
        setSubscription(data.subscription);
        setCompany(data.company);
        setTeamMembers(data.teamMembers || []);
        setIsAdmin(data.isCompanyAdmin || false);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError(err.message);
      setHasActive(false);
      companySubscriptionCache = null;
    } finally {
      companySubscriptionPendingPromise = null;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!companySubscriptionCache) {
      checkSubscription();
      return;
    }

    setHasActive(companySubscriptionCache.hasActive || false);
    setSubscription(companySubscriptionCache.subscription || null);
    setCompany(companySubscriptionCache.company || null);
    setTeamMembers(companySubscriptionCache.teamMembers || []);
    setIsAdmin(companySubscriptionCache.isAdmin || false);
    setLoading(false);
  }, [checkSubscription]);

  return {
    hasActive,
    subscription,
    company,
    teamMembers,
    isAdmin,
    loading,
    error,
    refresh: checkSubscription,
  };
};

export default useCompanySubscription;
